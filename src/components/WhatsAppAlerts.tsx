import React, { useState } from "react";
import { PantryItem, UserProfile } from "../types";
import {
  BellRing,
  Send,
  Copy,
  Check,
  AlertTriangle,
  Phone,
  Code2,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Zap,
} from "lucide-react";
import { WhatsAppIcon, AestheticProduceArt } from "./ProduceIcons";

interface WhatsAppAlertsProps {
  items: PantryItem[];
  userProfile: UserProfile;
  onUpdateQuantity: (id: string, delta: number) => void;
}

export const WhatsAppAlerts: React.FC<WhatsAppAlertsProps> = ({
  items,
  userProfile,
  onUpdateQuantity,
}) => {
  const [phone, setPhone] = useState(userProfile.whatsappPhone || "");
  const [copiedText, setCopiedText] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [simulatedWebhookToast, setSimulatedWebhookToast] = useState(false);

  const lowStockItems = items.filter((item) => item.quantity <= item.threshold);

  // Clean phone number for wa.me link
  const cleanPhone = phone.replace(/[^\d+]/g, "");

  // Generate WhatsApp Human Readable Message
  const generateWhatsAppMessage = () => {
    if (lowStockItems.length === 0) {
      return "🌱 *VegPantry Alert*: All pantry items are currently well-stocked!";
    }

    let msg = `🌱 *VEGPANTRY - LOW STOCK RESTOCK ALERT*\n`;
    msg += `------------------------------------\n`;
    msg += `Recipient: ${userProfile.name} (${userProfile.dietaryPreference})\n`;
    msg += `Alert Date: ${new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}\n\n`;
    msg += `⚠️ *${lowStockItems.length} ITEM(S) NEED RESTOCKING:* \n\n`;

    lowStockItems.forEach((item, index) => {
      const needed = Math.max(item.threshold * 2 - item.quantity, item.threshold);
      msg += `${index + 1}. *${item.name}* [${item.nutrientCategory}]\n`;
      msg += `   • Current Stock: ${item.quantity} ${item.unit}\n`;
      msg += `   • Alert Threshold: ${item.threshold} ${item.unit}\n`;
      msg += `   • Suggested Restock: ~${needed} ${item.unit}\n\n`;
    });

    msg += `------------------------------------\n`;
    msg += `Please confirm order placement for your organic vegetarian kitchen! 🥗`;
    return msg;
  };

  const whatsappText = generateWhatsAppMessage();
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`;

  // Generate Structured JSON Webhook Payload
  const structuredPayload = {
    event: "VEGPANTRY_STOCK_THRESHOLD_EXCEEDED",
    timestamp: new Date().toISOString(),
    recipient: {
      name: userProfile.name,
      phone: phone,
      dietaryPreference: userProfile.dietaryPreference,
    },
    alertSummary: {
      totalLowStockItems: lowStockItems.length,
      severity: lowStockItems.length > 3 ? "HIGH" : lowStockItems.length > 0 ? "MEDIUM" : "LOW",
    },
    itemsToRestock: lowStockItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.nutrientCategory,
      foodGroup: item.foodGroup,
      currentQuantity: item.quantity,
      threshold: item.threshold,
      unit: item.unit,
      suggestedOrderQty: Math.max(item.threshold * 2 - item.quantity, item.threshold),
    })),
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(structuredPayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleSimulateWebhook = () => {
    setSimulatedWebhookToast(true);
    setTimeout(() => setSimulatedWebhookToast(false), 3500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Banner */}
      <AestheticProduceArt variant="harvest" />

      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-2 shadow-2xs">
                <WhatsAppIcon className="w-4 h-4" /> Automated WhatsApp Dispatcher
              </span>
              <span className="text-xs text-stone-600 font-semibold">
                Live Inventory Monitor
              </span>
            </div>
            <h1 className="text-3xl font-serif-italic text-stone-900 mt-2 tracking-tight font-bold">
              Stock Thresholds & Instant WhatsApp Restock Alerts
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl font-medium">
              When pantry items fall below minimum thresholds, VegPantry constructs preformatted, emoji-rich WhatsApp restock messages and structured API payloads ready to send directly to your phone or supplier.
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-full border border-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 block font-medium">Restock Status</span>
              <span className="text-sm font-bold text-stone-900">
                {lowStockItems.length} {lowStockItems.length === 1 ? "Item" : "Items"} Need Action
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Low Stock Items Checklist */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h2 className="text-xl font-serif-italic text-emerald-950 font-bold flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-800" />
                <span>Monitored Low Stock Items</span>
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-amber-900 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                Quantity ≤ Threshold
              </span>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="text-center py-8 bg-stone-50 rounded-2xl border border-stone-200 p-6">
                <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-stone-900">Pantry is Fully Stocked!</h3>
                <p className="text-xs text-stone-600 mt-1">
                  All items are currently above their minimum threshold limits. No WhatsApp alert is required right now.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-amber-50/40 p-4 rounded-2xl border border-amber-200"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-stone-900">{item.name}</h4>
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {item.nutrientCategory}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-stone-600">
                        <span>Current: <strong className="text-amber-600 font-bold">{item.quantity} {item.unit}</strong></span>
                        <span>Threshold: <strong className="text-stone-900 font-bold">{item.threshold} {item.unit}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, 200)}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold shadow-2xs transition"
                        title="Simulate adding stock back"
                      >
                        + Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Details Settings */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp Alert Contact Number</span>
            </h3>

            <div>
              <label className="block text-xs text-stone-600 font-semibold mb-1">
                Recipient Phone Number (with Country Code)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678 or +91 9876543210"
                  className="w-full bg-stone-50 border border-stone-200 rounded-full pl-11 pr-4 py-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:border-emerald-600 min-h-[42px]"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-stone-500 mt-1.5 font-medium">
                Formats text into a 1-click WhatsApp link (<code className="text-emerald-800 font-bold">https://wa.me/</code>) for instant mobile delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Generated Message Preview & API Payload */}
        <div className="lg:col-span-6 space-y-4">
          {/* Formatted Text Preview */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                <h2 className="text-xl font-serif-italic text-emerald-950 font-bold flex items-center gap-2">
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Formatted WhatsApp Message</span>
                </h2>

                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-full transition border border-emerald-200"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? "Copied!" : "Copy Message"}</span>
                </button>
              </div>

              {/* Message Box */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 font-mono text-xs text-stone-900 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {whatsappText}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-full text-xs shadow-md transition min-h-[44px]"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Send via WhatsApp (wa.me)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                onClick={handleSimulateWebhook}
                className="flex items-center gap-1.5 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-full border border-stone-200 transition min-h-[44px]"
              >
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Test Webhook Payload</span>
              </button>
            </div>
          </div>

          {/* JSON Webhook Structure */}
          <div className="bg-white rounded-3xl p-6 border border-[#5A5A40]/10 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#5A5A40]/10 mb-3">
              <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Structured JSON Webhook Payload</span>
              </h3>

              <button
                onClick={handleCopyPayload}
                className="flex items-center gap-1 text-[11px] text-[#5A5A40]/70 hover:text-[#5A5A40] font-semibold"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-[#5A5A40]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? "Copied" : "Copy JSON"}</span>
              </button>
            </div>

            <pre className="bg-[#F9F8F4] p-4 rounded-2xl border border-[#5A5A40]/15 font-mono text-[11px] text-[#5A5A40] overflow-x-auto max-h-48 scrollbar-thin">
              {JSON.stringify(structuredPayload, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Simulated Webhook Trigger Toast */}
      {simulatedWebhookToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-[#2D2D2D] p-4 rounded-2xl border border-[#5A5A40] shadow-xl flex items-center gap-3 animate-bounce">
          <Zap className="w-5 h-5 text-[#B45309] fill-[#B45309]" />
          <div>
            <p className="text-xs font-bold text-[#5A5A40]">Webhook Payload Dispatched!</p>
            <p className="text-[11px] text-[#5A5A40]/70">
              Triggered VEGPANTRY_STOCK_THRESHOLD_EXCEEDED event with {lowStockItems.length} restock item(s).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
