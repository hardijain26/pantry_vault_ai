import { GoogleGenAI } from "@google/genai";

/**
 * One place to ask an AI model for JSON, with automatic fallback across free
 * providers. Order: Gemini -> Groq -> OpenRouter. A provider is skipped when
 * its API key isn't set. The first provider that returns valid JSON wins.
 *
 * Env:
 *   GEMINI_API_KEY      GEMINI_MODELS      (default: gemini-3.6-flash,gemini-3.8-flash,gemini-3.5-flash)
 *   GROQ_API_KEY        GROQ_MODELS        (default: qwen/qwen3.8-27b)           free: 1,000 req/day, no card
 *   OPENROUTER_API_KEY  OPENROUTER_MODELS  (default: google/gemma-4-31b-it:free) free: 50 req/day
 */

export interface Media {
  data: string; // base64, no data: prefix
  mimeType: string;
}

export interface JSONRequest {
  prompt: string;
  media?: Media;
  /** Gemini-style response schema (uses @google/genai Type values). */
  schema: any;
  label?: string; // for logs
}

const list = (v: string | undefined, fallback: string) =>
  (v || fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const GEMINI_MODELS = list(process.env.GEMINI_MODELS || process.env.GEMINI_MODEL, "gemini-3.6-flash,gemini-3.8-flash,gemini-3.5-flash");
const GROQ_MODELS = list(process.env.GROQ_MODELS, "qwen/qwen3.8-27b");
const OPENROUTER_MODELS = list(process.env.OPENROUTER_MODELS, "google/gemma-4-31b-it:free");
const REQUEST_TIMEOUT_MS = 45_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isBusy = (err: any) =>
  /\b(429|500|502|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|rate limit|DEADLINE_EXCEEDED|timed out/i.test(
    `${err?.status ?? ""} ${err?.code ?? ""} ${err?.message ?? ""}`
  );

const short = (err: any) => String(err?.message || err).replace(/\s+/g, " ").slice(0, 140);

/** Pull JSON out of a model reply that may include ```json fences or <think> blocks. */
function parseJSON(text: string): any {
  let t = (text || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  try {
    return JSON.parse(t);
  } catch {
    const start = t.search(/[[{]/);
    const end = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
    if (start >= 0 && end > start) return JSON.parse(t.slice(start, end + 1));
    throw new Error("Model reply was not valid JSON");
  }
}

/** Turn a Gemini Type schema into a readable JSON-schema-ish hint for other models. */
function schemaHint(schema: any): string {
  const conv = (s: any): any => {
    if (!s || typeof s !== "object") return s;
    const out: any = { type: String(s.type || "").toLowerCase() };
    if (s.properties) out.properties = Object.fromEntries(Object.entries(s.properties).map(([k, v]) => [k, conv(v)]));
    if (s.items) out.items = conv(s.items);
    if (s.required) out.required = s.required;
    return out;
  };
  return JSON.stringify(conv(schema));
}

// ---- Providers ----------------------------------------------------------------

async function viaGemini(req: JSONRequest): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("skipped (no GEMINI_API_KEY)");
  const ai = new GoogleGenAI({ apiKey });
  const contents = req.media
    ? { parts: [{ inlineData: { data: req.media.data, mimeType: req.media.mimeType } }, { text: req.prompt }] }
    : req.prompt;

  let lastErr: any;
  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents,
          config: { responseMimeType: "application/json", responseSchema: req.schema },
        });
        return parseJSON(res.text || "");
      } catch (err) {
        lastErr = err;
        if (!isBusy(err)) throw err; // bad key / bad input: move to the next provider
        console.warn(`[llm] gemini ${model} busy (try ${attempt + 1}): ${short(err)}`);
        if (attempt === 0) await sleep(1000);
      }
    }
  }
  throw lastErr;
}

/** Groq and OpenRouter both speak the OpenAI chat-completions format. */
async function viaOpenAICompatible(
  name: string,
  url: string,
  apiKey: string | undefined,
  models: string[],
  req: JSONRequest,
  extraHeaders: Record<string, string> = {}
): Promise<any> {
  if (!apiKey) throw new Error(`skipped (no ${name.toUpperCase()}_API_KEY)`);
  if (req.media && !req.media.mimeType.startsWith("image/")) throw new Error("skipped (audio not supported)");

  const topIsArray = String(req.schema?.type || "").toUpperCase() === "ARRAY";
  const instructions = `${req.prompt}

Respond with ONLY valid JSON, no explanation.${
    topIsArray
      ? ` Wrap the array in an object like {"result": [...]} where the array matches this schema: ${schemaHint(req.schema)}`
      : ` The JSON must match this schema: ${schemaHint(req.schema)}`
  }`;

  const content: any[] = [{ type: "text", text: instructions }];
  if (req.media) {
    content.push({ type: "image_url", image_url: { url: `data:${req.media.mimeType};base64,${req.media.data}` } });
  }

  let lastErr: any;
  for (const model of models) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, ...extraHeaders },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content }],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });
      const body: any = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(`${res.status} ${body?.error?.message || res.statusText}`);
      const parsed = parseJSON(body?.choices?.[0]?.message?.content || "");
      return topIsArray && !Array.isArray(parsed) ? parsed.result ?? parsed.items ?? Object.values(parsed)[0] ?? [] : parsed;
    } catch (err: any) {
      lastErr = err?.name === "AbortError" ? new Error("timed out") : err;
      console.warn(`[llm] ${name} ${model} failed: ${short(lastErr)}`);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

const PROVIDERS: { name: string; run: (r: JSONRequest) => Promise<any> }[] = [
  { name: "gemini", run: viaGemini },
  {
    name: "groq",
    run: (r) =>
      viaOpenAICompatible("groq", "https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_API_KEY, GROQ_MODELS, r),
  },
  {
    name: "openrouter",
    run: (r) =>
      viaOpenAICompatible(
        "openrouter",
        "https://openrouter.ai/api/v1/chat/completions",
        process.env.OPENROUTER_API_KEY,
        OPENROUTER_MODELS,
        r,
        { "HTTP-Referer": "https://pantry-vault-ai.vercel.app", "X-Title": "Pantry Vault AI" }
      ),
  },
];

/** Ask for JSON, falling back across providers. Returns the parsed value and which provider answered. */
export async function generateJSON(req: JSONRequest): Promise<{ data: any; provider: string }> {
  const failures: string[] = [];
  for (const p of PROVIDERS) {
    try {
      const data = await p.run(req);
      if (failures.length) console.warn(`[llm] ${req.label || ""} answered by ${p.name} after: ${failures.join(" | ")}`);
      return { data, provider: p.name };
    } catch (err) {
      failures.push(`${p.name}: ${short(err)}`);
    }
  }
  const tried = failures.filter((f) => !f.includes("skipped"));
  const allBusy = tried.length > 0 && tried.every((f) => isBusy({ message: f }));
  const e = new Error(
    allBusy
      ? "All AI services are busy right now. Please try again in a minute."
      : `No AI service could answer (${failures.join(" | ")})`
  );
  throw e;
}
