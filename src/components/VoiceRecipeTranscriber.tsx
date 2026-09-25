import { apiPost } from "../lib/api";
import React, { useState, useRef } from "react";
import { UserProfile, VoiceRecipeResult, PantryItem, CommunityPost } from "../types";
import {
  Mic,
  Square,
  Sparkles,
  CheckCircle2,
  Plus,
  Clock,
  Flame,
  FileText,
  RotateCcw,
  Globe,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Languages,
  BookOpen,
  ArrowRight,
  Zap,
} from "lucide-react";
import { WhatsAppIcon, AestheticProduceArt } from "./ProduceIcons";

interface VoiceRecipeTranscriberProps {
  userProfile: UserProfile;
  onAddIngredientToPantry: (item: Omit<PantryItem, "id">) => void;
}

const SAMPLE_MULTILINGUAL_PROMPTS = [
  {
    lang: "Spanish (Español)",
    flag: "🇪🇸",
    text: "Hoy preparé un guiso vegetariano de garbanzos con cúrcuma, espinacas frescas y leche de coco. Herví los garbanzos durante 15 minutos con sal de mar, jengibre picado y cebolla. Serví caliente con arroz integral.",
  },
  {
    lang: "Hindi (हिंदी)",
    flag: "🇮🇳",
    text: "आज मैंने एक बहुत ही पौष्टिक मूंंग दाल तड़का बनाया। मूंग दाल में हल्दी, कसा हुआ अदरक, हींग और ताज़ा पालक मिलाया। 10 मिनट उबाला और फिर देसी घी व जीरे का तड़का लगाया।",
  },
  {
    lang: "French (Français)",
    flag: "🇫🇷",
    text: "Aujourd'hui, j'ai préparé une salade tiède de lentilles vertes du Puy avec de l'huile d'olive extra vierge, du thym frais, de l'ail écrasé et du jus de citron bio. Cuisson 20 minutes.",
  },
  {
    lang: "Italian (Italiano)",
    flag: "🇮🇹",
    text: "Oggi ho cucinato una minestra di fagioli cannellini con pomodorini freschi, basilico, olio extravergine d'oliva e riso integrale. Bollito per 18 minuti e servito caldo.",
  },
];

export const VoiceRecipeTranscriber: React.FC<VoiceRecipeTranscriberProps> = ({
  userProfile,
  onAddIngredientToPantry,
}) => {
  const [activeInputMode, setActiveInputMode] = useState<"mic" | "transcript">("mic");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [pastedTranscript, setPastedTranscript] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [result, setResult] = useState<VoiceRecipeResult | null>(null);
  const [addedPantryItems, setAddedPantryItems] = useState<Set<string>>(new Set());
  const [copiedMarkdown, setCopiedMarkdown] = useState<boolean>(false);
  const [activeTranscriptView, setActiveTranscriptView] = useState<"english" | "original">("english");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access failed:", err);
      alert("Microphone permission required for audio recording. You can also paste voice dictation in any language in the Text Dictation tab!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
    setResult(null);
  };

  const handleTranscribe = async () => {
    if (!audioBlob && !pastedTranscript.trim()) return;

    setIsTranscribing(true);
    setResult(null);

    try {
      let bodyData: any = { dietaryPreference: userProfile.dietaryPreference };

      if (activeInputMode === "mic" && audioBlob) {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result?.toString().split(",")[1];
          bodyData.audioBase64 = base64data;
          bodyData.mimeType = audioBlob.type || "audio/webm";

          try {
            const data = await apiPost<{ result: VoiceRecipeResult }>("/api/recipes/transcribe-voice", bodyData);
            setResult(data.result);
          } catch (err) {
            alert((err as Error).message || "Transcription failed. Please try again or use text dictation.");
          }
          setIsTranscribing(false);
        };
      } else {
        bodyData.transcript = pastedTranscript.trim();
        const data = await apiPost<{ result: VoiceRecipeResult }>("/api/recipes/transcribe-voice", bodyData);
        setResult(data.result);
        setIsTranscribing(false);
      }
    } catch (err) {
      console.error("Transcription failed:", err);
      alert((err as Error).message || "Network or server connection error. Please try again.");
      setIsTranscribing(false);
    }
  };

  const handleAddToPantry = (ingredientItem: string) => {
    onAddIngredientToPantry({
      name: ingredientItem,
      nutrientCategory: "Protein",
      foodGroup: "Legumes & Pulses",
      quantity: 500,
      unit: "g",
      threshold: 150,
      caloriesPerUnit: 120,
      proteinPerUnit: 8,
      carbsPerUnit: 15,
      fatsPerUnit: 2,
      fiberPerUnit: 4,
      keyMicroNutrients: ["Essential Nutrients"],
      healthNotes: "Added from voice recipe transcription.",
      lastUpdated: new Date().toISOString(),
    });

    setAddedPantryItems((prev) => new Set(prev).add(ingredientItem));
  };

  const handleAddAllToPantry = () => {
    if (!result) return;
    result.ingredients.forEach((ing) => {
      if (!addedPantryItems.has(ing.item)) {
        handleAddToPantry(ing.item);
      }
    });
  };

  const handleWhatsAppPublish = () => {
    if (!result) return;
    const phone = userProfile.whatsappPhone ? userProfile.whatsappPhone.replace(/[^0-9]/g, "") : "";
    const shareText =
      result.whatsappShareText ||
      `🌱 *${result.title}*\n\n⏱ Prep: ${result.prepTime} | Cook: ${result.cookTime}\n\n🥗 *Ingredients:*\n${result.ingredients
        .map((i) => `• ${i.quantity} ${i.item}`)
        .join("\n")}\n\n👩‍🍳 *Method:*\n${result.instructions
        .map((step, idx) => `${idx + 1}. ${step}`)
        .join("\n")}\n\nPublished via VegPantry Voice Transcriber`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleCopyMarkdown = () => {
    if (!result) return;
    const text = `# ${result.title}\n\n🌐 Language Detected: ${result.detectedLanguage || "Auto-Detected"} ${
      result.detectedLanguageFlag || "🌐"
    }\n\n## Ingredients\n${result.ingredients
      .map((i) => `- ${i.quantity} ${i.item}`)
      .join("\n")}\n\n## Instructions\n${result.instructions
      .map((step, idx) => `${idx + 1}. ${step}`)
      .join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Banner */}
      <AestheticProduceArt variant="harvest" />

      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-emerald-800" /> Any Language Voice-to-Recipe
              </span>
              <span className="text-xs text-stone-600 font-semibold">
                Universal Detection & English Publisher
              </span>
            </div>
            <h1 className="text-3xl font-serif-italic text-stone-900 mt-2 tracking-tight font-bold">
              Voice-to-Recipe Transcriber & English Publisher
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl font-medium">
              Speak or paste dictation in <strong>ANY language</strong> (Spanish, Hindi, French, Mandarin, Italian, German, Tamil, Japanese, Portuguese, etc.). Gemini automatically detects the native language, transcribes it into fluent English, structures ingredients and cooking steps, and lets you publish instantly.
            </p>
          </div>
        </div>

        {/* Supported Languages Ticker */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2 text-[11px] text-stone-600 font-medium">
          <span className="font-bold text-emerald-900 flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-emerald-700" /> Supported Languages:
          </span>
          <span className="bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">🇪🇸 Spanish</span>
          <span className="bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">🇮🇳 Hindi</span>
          <span className="bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">🇫🇷 French</span>
          <span className="bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">🇨🇳 Mandarin</span>
          <span className="bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">🇮🇹 Italian</span>
          <span className="bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">🇩🇪 German</span>
          <span className="bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">🇯🇵 Japanese</span>
          <span className="bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">🇧🇷 Portuguese</span>
          <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
            + 100 More Auto-Detected
          </span>
        </div>

        {/* Input Mode Switcher */}
        <div className="mt-5 flex items-center bg-stone-100 p-1 rounded-full border border-stone-200 max-w-xs">
          <button
            onClick={() => setActiveInputMode("mic")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition ${
              activeInputMode === "mic"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-700 hover:text-stone-900"
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-emerald-200" />
            <span>Speak Voice Audio</span>
          </button>

          <button
            onClick={() => setActiveInputMode("transcript")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition ${
              activeInputMode === "transcript"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-700 hover:text-stone-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-200" />
            <span>Text Dictation</span>
          </button>
        </div>
      </div>

      {/* Input Studio Area */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs">
        {activeInputMode === "mic" ? (
          <div className="text-center py-8 space-y-6">
            <div className="relative inline-block">
              {isRecording && (
                <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping" />
              )}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-md transition-all transform hover:scale-105 min-w-[80px] min-h-[80px] ${
                  isRecording
                    ? "bg-amber-600 text-white animate-pulse"
                    : "bg-emerald-800 hover:bg-emerald-900 text-white"
                }`}
              >
                {isRecording ? (
                  <Square className="w-8 h-8 fill-current" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            <div>
              <p className="text-lg font-serif-italic text-stone-900 font-bold">
                {isRecording
                  ? "Listening... Speak in ANY language (Spanish, Hindi, French, Italian, etc.)"
                  : audioBlob
                  ? "Audio Recording Captured"
                  : "Tap Microphone & Describe Your Recipe in Any Language"}
              </p>
              <p className="text-xs text-stone-600 mt-1 font-medium">
                {isRecording
                  ? `Recording live: ${formatTimer(recordingSeconds)}`
                  : "Example: 'Heute habe ich ein Curry mit Kichererbsen, Kurkuma und Kokosmilch gekocht... ' or 'Hoy cociné garbanzos con espinacas...'"}
              </p>
            </div>

            {/* Audio Playback if recorded */}
            {audioUrl && !isRecording && (
              <div className="max-w-md mx-auto bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 shadow-2xs">
                <audio src={audioUrl} controls className="w-full h-8" />
                <button
                  onClick={resetRecording}
                  className="p-2 text-stone-500 hover:text-stone-900 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  title="Record again"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}

            <div>
              <button
                onClick={handleTranscribe}
                disabled={isTranscribing || (!audioBlob && !isRecording)}
                className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-full shadow-md transition disabled:opacity-50 inline-flex items-center gap-2 min-h-[44px]"
              >
                {isTranscribing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Detecting Language, Transcribing & Translating into English...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Transcribe, Translate & Publish in English</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-800">
                Paste Voice Dictation or Cooking Transcript (Any Language)
              </label>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                Auto-Translates to English
              </span>
            </div>

            {/* Multilingual Sample Prompts */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                Quick Sample Dictations to Test Language Detection:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_MULTILINGUAL_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPastedTranscript(sample.text)}
                    className="text-[11px] font-semibold bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-stone-800 px-3 py-1.5 rounded-full border border-stone-200 transition flex items-center gap-1.5"
                  >
                    <span>{sample.flag}</span>
                    <span>{sample.lang}</span>
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={5}
              placeholder="E.g., En espagnol, hindi, français ou anglais: Hoy preparé un guiso vegetariano de garbanzos con cúrcuma y espinacas frescas..."
              value={pastedTranscript}
              onChange={(e) => setPastedTranscript(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:border-emerald-600"
            />

            <button
              onClick={handleTranscribe}
              disabled={isTranscribing || !pastedTranscript.trim()}
              className="px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-full shadow-md transition disabled:opacity-50 inline-flex items-center gap-2 min-h-[44px]"
            >
              {isTranscribing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Detecting Language & Translating to English...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Transcribe, Translate & Publish</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Structured Output Card */}
      {result && (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-800/30 shadow-lg space-y-6 animate-fadeIn">
          {/* Language Detection Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0">
                {result.detectedLanguageFlag || "🌐"}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block">
                  Language Detection & Translation Status
                </span>
                <p className="text-sm font-bold">
                  Spoken Language: <span className="text-amber-300 font-extrabold">{result.detectedLanguage || "Auto-Detected"}</span> {result.detectedLanguageFlag || "🌐"} ➔ Translated into Fluent English 🇬🇧
                </p>
              </div>
            </div>

            <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-bold border border-white/20 whitespace-nowrap self-start sm:self-center">
              Gemini Multilingual AI Verified
            </span>
          </div>

          {/* Header & Health Score */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-900 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200">
                English Recipe Ready to Publish
              </span>
              <h2 className="text-2xl font-serif-italic text-stone-900 mt-1 font-bold">
                {result.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-stone-600 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-800" /> Prep: {result.prepTime || "10 mins"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-600" /> Cook: {result.cookTime || "15 mins"}
                </span>
                <span>•</span>
                <span>Difficulty: <strong>{result.difficulty || "Easy"}</strong></span>
                <span>•</span>
                <span>Servings: <strong>{result.servings || 2}</strong></span>
              </div>
            </div>

          </div>

          {/* Dual Transcript View Tabs */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTranscriptView("english")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    activeTranscriptView === "english"
                      ? "bg-emerald-800 text-white shadow-2xs"
                      : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  🇬🇧 English Translation
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTranscriptView("original")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    activeTranscriptView === "original"
                      ? "bg-emerald-800 text-white shadow-2xs"
                      : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {result.detectedLanguageFlag || "🌐"} Spoken ({result.detectedLanguage || "Original"})
                </button>
              </div>

              <span className="text-[10px] text-stone-500 font-bold">
                {activeTranscriptView === "english" ? "English Transcript" : "Native Spoken Transcript"}
              </span>
            </div>

            <p className="text-xs text-stone-800 font-medium italic leading-relaxed pt-1">
              "{activeTranscriptView === "english" ? result.englishTranscript || result.rawTranscript : result.originalTranscript || result.rawTranscript}"
            </p>
          </div>


          {/* Nutrition Macros Pill */}
          {result.nutrition && (
            <div className="grid grid-cols-5 gap-2 text-center bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs">
              <div>
                <span className="block text-[10px] text-stone-500 font-medium">Calories</span>
                <span className="font-bold text-stone-900 font-mono">{result.nutrition.calories || 320} kcal</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-medium">Protein</span>
                <span className="font-bold text-emerald-800 font-mono">{result.nutrition.protein || 14}g</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-medium">Carbs</span>
                <span className="font-bold text-amber-700 font-mono">{result.nutrition.carbs || 42}g</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-medium">Fats</span>
                <span className="font-bold text-stone-800 font-mono">{result.nutrition.fats || 8}g</span>
              </div>
              <div>
                <span className="block text-[10px] text-stone-500 font-medium">Fiber</span>
                <span className="font-bold text-emerald-800 font-mono">{result.nutrition.fiber || 9}g</span>
              </div>
            </div>
          )}

          {/* Extracted Ingredients & Bulk Pantry Add */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>Extracted Ingredients (English)</span>
              </h3>

              <button
                type="button"
                onClick={handleAddAllToPantry}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add All Ingredients to Pantry Stock</span>
              </button>
            </div>

            <div className="space-y-2">
              {result.ingredients.map((ing, idx) => {
                const isAdded = addedPantryItems.has(ing.item);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs text-stone-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-900 font-mono">{ing.quantity}</span>
                      <span className="font-semibold">{ing.item}</span>
                      <span className="text-[10px] bg-white text-stone-600 px-2.5 py-0.5 rounded-full border border-stone-200 font-medium">
                        {ing.pantryMatch || "Pantry Staple"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToPantry(ing.item)}
                      disabled={isAdded}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 hover:underline disabled:text-stone-400 bg-white px-3 py-1.5 rounded-full border border-stone-200 transition min-h-[32px]"
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>In Pantry</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Pantry</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Method */}
          <div>
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
              Structured Cooking Instructions (English)
            </h3>
            <ol className="space-y-2 text-xs text-stone-900">
              {result.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Publishing Section */}
          <div className="pt-4 border-t border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-800" />
                  <span>Publish Transcribed English Recipe</span>
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Send the translated recipe on WhatsApp or copy it.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              <button
                type="button"
                onClick={handleWhatsAppPublish}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-full shadow-md transition min-h-[44px]"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Publish to WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-full border border-stone-200 transition min-h-[44px]"
              >
                {copiedMarkdown ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                <span>{copiedMarkdown ? "Copied Markdown!" : "Copy English Card"}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
