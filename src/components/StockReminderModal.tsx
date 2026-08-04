import React, { useState } from "react";
import { PantryItem } from "../types";
import {
  Bell,
  Check,
  Copy,
  ExternalLink,
  X,
  Clock,
  Calendar,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { WhatsAppIcon } from "./ProduceIcons";

interface StockReminderModalProps {
  item: PantryItem;
  userPhone?: string;
  userName?: string;
  onClose: () => void;
}

export const StockReminderModal: React.FC<StockReminderModalProps> = ({
  item,
  userPhone = "",
  userName = "Chef",
  onClose,
}) => {
  const [reminderTime, setReminderTime] = useState<string>("tomorrow");
  const [customNote, setCustomNote] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [scheduledStatus, setScheduledStatus] = useState<boolean>(false);

  // Calculate needed quantity for restock
  const suggestedQty = Math.max(item.threshold * 2 - item.quantity, item.threshold);

  const defaultMsg = `🛒 *VEGPANTRY STOCK REMINDER*\n------------------------------------\nHi ${userName}! Reminder to stock up on *${item.name}* [${item.nutrientCategory}].\n• Current Stock: ${item.quantity} ${item.unit}\n• Suggested Restock: ~${suggestedQty} ${item.unit}\n• Health Note: ${item.healthNotes || "Pantry organic essential"}\n------------------------------------`;

  const finalMsg = customNote.trim() ? `${defaultMsg}\nNote: ${customNote}` : defaultMsg;

  const cleanPhone = userPhone.replace(/[^\d+]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMsg)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(finalMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleScheduleReminder = () => {
    setScheduledStatus(true);
    setTimeout(() => {
      setScheduledStatus(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-emerald-900/15 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-5 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-full">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif-italic text-stone-900 font-bold">
                Stock Up Reminder
              </h3>
              <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">
                Direct Grocery Restock Notification
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-2 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Info */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-stone-900">{item.name}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              {item.nutrientCategory}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-1 border-t border-stone-200">
            <div>
              <span className="text-[10px] text-stone-500 block">Current Stock:</span>
              <span className="font-bold text-amber-600">{item.quantity} {item.unit}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block">Suggested Restock:</span>
              <span className="font-bold text-stone-800">~{suggestedQty} {item.unit}</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 italic pt-1">
            "Instant restock notifications tailored for your organic vegetarian kitchen run."
          </p>
        </div>

        {/* Reminder Time Selection */}
        <div>
          <label className="block text-xs text-stone-800 font-bold mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-800" /> Select Reminder Schedule
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "tomorrow", label: "Tomorrow 9 AM" },
              { id: "weekend", label: "This Weekend" },
              { id: "shopping_day", label: "Grocery Run Day" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setReminderTime(t.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center transition min-h-[42px] ${
                  reminderTime === t.id
                    ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Custom Note */}
        <div>
          <label className="block text-xs text-stone-800 font-bold mb-1">
            Additional Shopping Note (Optional)
          </label>
          <input
            type="text"
            placeholder="E.g., Prefer organic cold-pressed brand from local farm store"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:border-emerald-600 min-h-[42px]"
          />
        </div>

        {/* Message Preview */}
        <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl text-[11px] text-stone-800 font-mono whitespace-pre-wrap max-h-28 overflow-y-auto">
          {finalMsg}
        </div>

        {/* Success Toast banner if scheduled */}
        {scheduledStatus && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn font-bold">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Restock reminder saved! We'll prompt you on your scheduled grocery run.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-200 bg-stone-50 text-stone-700 text-xs font-bold hover:bg-stone-100 transition min-h-[44px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-xs transition min-h-[44px]"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </a>
          </div>

          <button
            onClick={handleScheduleReminder}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold shadow-xs transition min-h-[44px]"
          >
            <Bell className="w-4 h-4" />
            <span>Save Stock Reminder</span>
          </button>
        </div>
      </div>
    </div>
  );
};
