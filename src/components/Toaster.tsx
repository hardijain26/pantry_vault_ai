import React, { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { onNotify } from "../lib/notify";

export const Toaster: React.FC = () => {
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);

  useEffect(
    () =>
      onNotify((text) => {
        const id = Date.now() + Math.random();
        setMessages((prev) => [...prev.slice(-2), { id, text }]);
        setTimeout(() => setMessages((prev) => prev.filter((m) => m.id !== id)), 12000);
      }),
    []
  );

  if (messages.length === 0) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[min(92vw,480px)] space-y-2" role="alert">
      {messages.map((m) => (
        <div
          key={m.id}
          className="flex items-start gap-2 bg-white border border-red-300 text-red-900 text-xs rounded-2xl shadow-lg p-3"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="flex-1 leading-relaxed break-words">{m.text}</span>
          <button
            onClick={() => setMessages((prev) => prev.filter((x) => x.id !== m.id))}
            className="text-red-700/70 hover:text-red-900 shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
