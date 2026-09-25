import React, { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { ProduceIcon } from "./ProduceIcons";

export const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 flex items-center justify-center p-4">
      <div className="bg-white border border-emerald-900/10 rounded-3xl shadow-lg p-6 sm:p-8 max-w-sm w-full space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 rounded-2xl flex items-center justify-center shadow-md">
            <ProduceIcon name="avocado" size="md" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif-italic text-emerald-900">Pantry Vault AI</h1>
            <p className="text-xs text-stone-500">Cook what you have before it goes off.</p>
          </div>
        </div>

        {status === "sent" ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-950 space-y-1">
            <p className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Check your email
            </p>
            <p className="text-xs">
              We sent a sign-in link to <strong>{email}</strong>. Open it on this device. It can take a minute; check spam
              if it doesn't show up.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="text-xs font-bold text-emerald-800 hover:underline pt-1"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-stone-800" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white font-bold text-sm rounded-full min-h-[44px]"
            >
              {status === "sending" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>Email me a sign-in link</span>
            </button>
            {status === "error" && <p className="text-xs text-red-700">{errorMsg}</p>}
            <p className="text-[11px] text-stone-500">No password needed. New here? The same link creates your account.</p>
          </form>
        )}
      </div>
    </div>
  );
};
