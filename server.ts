import "dotenv/config";
import express from "express";
import path from "path";
import { app } from "./server/app";

// Local development and self-hosting. On Vercel, api/index.ts is used instead.
const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const required = ["GEMINI_API_KEY", "VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(", ")}. Copy .env.example to .env and fill them in.`);
    process.exit(1);
  }

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pantry Vault AI listening on http://localhost:${PORT}`);
  });
}

startServer();
