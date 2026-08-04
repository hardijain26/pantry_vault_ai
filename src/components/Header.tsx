import React from "react";
import {
  ShoppingBag,
  Activity,
  BellRing,
  Youtube,
  ChefHat,
  Mic,
  Users,
  Sparkles,
  Apple,
  Calendar,
} from "lucide-react";
import { UserProfile } from "../types";
import { ProduceIcon } from "./ProduceIcons";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
  userProfile: UserProfile;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount,
  userProfile,
  onOpenProfile,
}) => {
  const navItems = [
    { id: "pantry", label: "Inventory", icon: ShoppingBag, produce: "broccoli" },
    { id: "harvest", label: "Harvest Map", icon: Calendar, produce: "spinach" },
    { id: "nutrition", label: "Nutrition", icon: Activity, produce: "avocado" },
    {
      id: "alerts",
      label: "Stock Alerts",
      icon: BellRing,
      badge: lowStockCount > 0 ? lowStockCount : null,
      produce: "lemon",
    },
    { id: "media", label: "Vault Analysis", icon: Youtube, produce: "kimchi" },
    { id: "diy", label: "DIY Recipes", icon: ChefHat, produce: "carrot" },
    { id: "voice", label: "Voice Studio", icon: Mic, produce: "garlic" },
    { id: "community", label: "Community", icon: Users, produce: "berry" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 text-[#2D2D2D] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand with Aesthetic Produce Icon */}
          <div
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
            onClick={() => setActiveTab("pantry")}
          >
            <div className="relative w-10 h-10 xl:w-11 xl:h-11 bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
              <ProduceIcon name="avocado" size="md" className="drop-shadow-xs" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-xs border border-white">
                <Sparkles className="w-2.5 h-2.5 text-amber-900" />
              </div>
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-lg xl:text-xl font-bold font-serif-italic text-emerald-900 tracking-tight whitespace-nowrap">
                  Pantry Vault AI
                </span>
                <span className="text-[9px] xl:text-[10px] uppercase tracking-widest font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs whitespace-nowrap hidden sm:inline-block">
                  🌱 Fresh Harvest
                </span>
              </div>
              <p className="text-[9px] xl:text-[10px] uppercase tracking-wider text-emerald-800/70 hidden md:block font-semibold whitespace-nowrap">
                Organic Vegetarian Stock & Micro-Nutrient Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-[10px] xl:text-[11px] uppercase tracking-wider font-bold text-stone-600 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 py-1.5 px-2.5 xl:px-3 rounded-2xl transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-emerald-800 text-white shadow-xs font-bold"
                      : "hover:bg-emerald-50 text-stone-700 hover:text-emerald-800"
                  }`}
                >
                  <ProduceIcon name={item.produce} size="sm" className={isActive ? "brightness-125" : "opacity-80"} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-amber-500 text-white rounded-full animate-pulse shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Badge */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 pl-3 border-l border-emerald-900/10 text-right hover:opacity-90 transition group shrink-0"
              title="Click to edit health profile"
            >
              <div className="hidden sm:block leading-none">
                <p className="text-xs font-bold text-stone-900 group-hover:text-emerald-700 transition whitespace-nowrap">
                  {userProfile.name || "Elena V."}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 whitespace-nowrap">
                  {userProfile.dietaryPreference}
                </p>
              </div>
              <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-200 via-emerald-100 to-green-200 text-emerald-900 flex items-center justify-center text-xs font-bold border border-emerald-300 shadow-xs shrink-0">
                {userProfile.name ? userProfile.name.charAt(0) : "EV"}
                <span className="absolute -bottom-1 -right-1 text-xs">🥬</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2.5 bg-emerald-50/60 border-t border-emerald-900/10 space-x-2 no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-full text-[10px] uppercase tracking-wider font-bold transition min-h-[38px] ${
                isActive
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "text-stone-700 bg-white border border-emerald-200/80 hover:bg-emerald-50"
              }`}
            >
              <ProduceIcon name={item.produce} size="sm" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>

    {/* Mobile Fixed Bottom Navigation Bar for Single-Thumb Touch Reach */}
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-emerald-900/15 py-1.5 px-2 flex justify-around items-center shadow-lg">
      {navItems.slice(0, 5).map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl min-h-[48px] min-w-[56px] transition ${
              isActive ? "text-emerald-800 font-bold bg-emerald-100/80" : "text-stone-500 hover:text-emerald-800"
            }`}
          >
            <div className="relative">
              <ProduceIcon name={item.produce} size="sm" />
              {item.badge && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-bold bg-amber-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold mt-0.5 tracking-tight truncate max-w-[64px]">
              {item.label.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </nav>
    </>
  );
};
