import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ProduceIconProps {
  name: string;
  category?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const ProduceIcon: React.FC<ProduceIconProps> = ({
  name,
  category,
  className = "",
  size = "md",
}) => {
  const sizeMap = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
    xl: "w-14 h-14",
  };

  const dim = sizeMap[size];
  const itemLower = name.toLowerCase();
  const catLower = (category || "").toLowerCase();

  // Custom detailed SVG Produce Icons with vibrant, aesthetic fruit & vegetable art

  // 🥑 Avocado
  if (itemLower.includes("avocado") || itemLower.includes("guacamole")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 6C20 6 12 18 12 36C12 50 20 58 32 58C44 58 52 50 52 36C52 18 44 6 32 6Z" fill="#2E5A27" />
        <path d="M32 10C22 10 16 20 16 36C16 48 22 54 32 54C42 54 48 48 48 36C48 20 42 10 32 10Z" fill="#84CC16" />
        <path d="M32 14C24 14 19 22 19 36C19 46 24 51 32 51C40 51 45 46 45 36C45 22 40 14 32 14Z" fill="#BEF264" />
        <circle cx="32" cy="38" r="9" fill="#78350F" stroke="#451A03" strokeWidth="2" />
        <circle cx="29" cy="35" r="2.5" fill="#A16207" opacity="0.6" />
      </svg>
    );
  }

  // 🥕 Carrot
  if (itemLower.includes("carrot") || itemLower.includes("beta carotene")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 8C28 8 26 2 32 2C38 2 36 8 36 8M32 8C32 8 22 4 24 0M32 8C32 8 42 4 40 0" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M32 10C37 10 44 14 42 22C39 33 34 52 32 58C30 52 25 33 22 22C20 14 27 10 32 10Z" fill="#EA580C" />
        <path d="M26 20C29 21 33 21 35 20M25 29C28 30 32 30 34 29M27 38C29 39 32 39 33 38" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 🥦 Broccoli
  if (itemLower.includes("broccoli") || itemLower.includes("kale") || itemLower.includes("cabbage")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="34" width="8" height="24" rx="4" fill="#86EFAC" />
        <path d="M26 36L18 42M38 36L46 42" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="20" r="14" fill="#15803D" />
        <circle cx="20" cy="26" r="11" fill="#166534" />
        <circle cx="44" cy="26" r="11" fill="#166534" />
        <circle cx="26" cy="15" r="9" fill="#22C55E" />
        <circle cx="38" cy="15" r="9" fill="#22C55E" />
      </svg>
    );
  }

  // 🍅 Tomato
  if (itemLower.includes("tomato") || itemLower.includes("paste") || itemLower.includes("passata")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="36" r="22" fill="#DC2626" />
        <circle cx="26" cy="28" r="20" fill="#EF4444" />
        <circle cx="22" cy="22" r="5" fill="#FCA5A5" opacity="0.6" />
        <path d="M32 14C32 14 30 6 32 4C34 6 32 14 32 14Z" fill="#15803D" />
        <path d="M32 14C27 10 20 12 20 12C20 12 26 16 32 14Z" fill="#22C55E" />
        <path d="M32 14C37 10 44 12 44 12C44 12 38 16 32 14Z" fill="#22C55E" />
      </svg>
    );
  }

  // 🍋 Lemon / Citrus
  if (itemLower.includes("lemon") || itemLower.includes("citrus") || itemLower.includes("orange") || itemLower.includes("lime")) {
    const isOrange = itemLower.includes("orange");
    const isLime = itemLower.includes("lime");
    const mainColor = isOrange ? "#EA580C" : isLime ? "#65A30D" : "#EAB308";
    const lightColor = isOrange ? "#FDBA74" : isLime ? "#BEF264" : "#FEF08A";
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 32C12 18 22 10 36 10C50 10 56 22 56 36C56 50 44 56 30 56C16 56 12 46 12 32Z" fill={mainColor} />
        <path d="M16 32C16 21 24 14 36 14C47 14 52 23 52 36C52 47 42 52 30 52C19 52 16 43 16 32Z" fill={lightColor} />
        <circle cx="26" cy="24" r="3" fill="#FFFFFF" opacity="0.7" />
        <path d="M48 12C52 8 56 8 56 8C56 8 54 14 48 12Z" fill="#15803D" />
      </svg>
    );
  }

  // 🫐 Berry / Blueberry / Strawberry
  if (itemLower.includes("berry") || itemLower.includes("blueberry") || itemLower.includes("strawberry") || itemLower.includes("raspberry") || itemLower.includes("açai")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="38" r="14" fill="#6D28D9" />
        <circle cx="21" cy="34" r="12" fill="#7C3AED" />
        <circle cx="18" cy="30" r="3" fill="#DDD6FE" opacity="0.8" />
        
        <circle cx="42" cy="30" r="12" fill="#BE185D" />
        <circle cx="40" cy="28" r="10" fill="#E11D48" />
        <circle cx="37" cy="25" r="2.5" fill="#FECDD3" opacity="0.8" />

        <circle cx="32" cy="46" r="10" fill="#4C1D95" />
        <path d="M24 24C24 18 30 14 32 14C34 14 40 18 40 24" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 🏺 Kimchi / Sauerkraut / Ferment Jar / Kombucha
  if (itemLower.includes("kimchi") || itemLower.includes("sauerkraut") || itemLower.includes("kombucha") || itemLower.includes("ferment") || itemLower.includes("miso") || itemLower.includes("kefir") || itemLower.includes("pickled")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="22" y="8" width="20" height="6" rx="2" fill="#B45309" />
        <rect x="20" y="14" width="24" height="4" fill="#78350F" />
        <path d="M16 22C16 18 20 18 20 18H44C44 18 48 18 48 22V52C48 56 44 58 40 58H24C20 58 16 56 16 52V22Z" fill="#FDE68A" fillOpacity="0.8" stroke="#B45309" strokeWidth="2" />
        <path d="M20 28H44V52C44 54 42 56 39 56H25C22 56 20 54 20 52V28Z" fill="#F97316" />
        <circle cx="28" cy="36" r="3" fill="#DC2626" />
        <circle cx="36" cy="42" r="4" fill="#15803D" />
        <circle cx="30" cy="48" r="2.5" fill="#FEF08A" />
        <path d="M22 32C26 34 38 30 42 34" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 🌾 Quinoa / Oats / Chia Seeds / Sprouted Grains / Legumes
  if (itemLower.includes("quinoa") || itemLower.includes("oat") || itemLower.includes("chia") || itemLower.includes("seed") || itemLower.includes("grain") || itemLower.includes("rice") || itemLower.includes("flax")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 58C32 58 18 48 18 32C18 16 32 6 32 6C32 6 46 16 46 32C46 48 32 58 32 58Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
        <path d="M32 12V50" stroke="#CA8A04" strokeWidth="2" strokeDasharray="2 2" />
        <circle cx="26" cy="24" r="3" fill="#B45309" />
        <circle cx="38" cy="30" r="3.5" fill="#78350F" />
        <circle cx="27" cy="38" r="2.5" fill="#CA8A04" />
        <circle cx="36" cy="44" r="3" fill="#B45309" />
      </svg>
    );
  }

  // 🫘 Lentils / Beans / Chickpeas / Tempeh / Tofu / Edamame
  if (itemLower.includes("lentil") || itemLower.includes("bean") || itemLower.includes("chickpea") || itemLower.includes("tofu") || itemLower.includes("tempeh") || itemLower.includes("edamame") || itemLower.includes("hummus")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 28C16 20 24 16 32 20C40 16 48 20 48 28C48 40 38 48 32 48C26 48 16 40 16 28Z" fill="#B45309" />
        <path d="M20 28C20 22 26 19 32 22C38 19 44 22 44 28C44 38 36 44 32 44C28 44 20 38 20 28Z" fill="#D97706" />
        <circle cx="28" cy="28" r="3" fill="#FEF3C7" />
        <circle cx="36" cy="34" r="2.5" fill="#FEF3C7" />
      </svg>
    );
  }

  // 🍄 Mushroom
  if (itemLower.includes("mushroom") || itemLower.includes("shiitake") || itemLower.includes("fungi")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M26 32V54C26 56 28 58 32 58C36 58 38 56 38 54V32H26Z" fill="#FDE68A" />
        <path d="M10 32C10 18 20 10 32 10C44 10 54 18 54 32H10Z" fill="#78350F" />
        <path d="M14 30C14 19 22 13 32 13C42 13 50 19 50 30H14Z" fill="#92400E" />
        <circle cx="22" cy="20" r="4" fill="#FEF3C7" />
        <circle cx="36" cy="18" r="5" fill="#FEF3C7" />
        <circle cx="44" cy="24" r="3" fill="#FEF3C7" />
      </svg>
    );
  }

  // 🫑 Bell Pepper / Chili / Capsicum
  if (itemLower.includes("pepper") || itemLower.includes("capsicum") || itemLower.includes("chili") || itemLower.includes("paprika")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 10C32 10 30 4 32 2C34 4 32 10 32 10Z" stroke="#15803D" strokeWidth="4" />
        <path d="M18 20C14 26 14 44 20 52C24 56 28 56 32 52C36 56 40 56 44 52C50 44 50 26 46 20C40 14 24 14 18 20Z" fill="#22C55E" />
        <path d="M22 22C18 28 18 42 23 48C26 52 29 52 32 48C35 52 38 52 41 48C46 42 46 28 42 22C37 17 27 17 22 22Z" fill="#4ADE80" />
      </svg>
    );
  }

  // 🧄 Garlic / Ginger / Onion / Turmeric / Spices
  if (itemLower.includes("garlic") || itemLower.includes("ginger") || itemLower.includes("onion") || itemLower.includes("turmeric") || itemLower.includes("spice")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 8C32 8 20 22 18 36C16 50 24 58 32 58C40 58 48 50 46 36C44 22 32 8 32 8Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
        <path d="M32 12C32 12 26 24 26 38C26 48 29 54 32 56C35 54 38 48 38 38C38 24 32 12 32 12Z" fill="#FFFBEB" />
        <path d="M32 8L32 2" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 🍎 Apple / Fruit default
  if (itemLower.includes("apple") || catLower.includes("fruit")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 16C32 16 30 8 34 4C34 4 36 10 32 16Z" fill="#15803D" />
        <path d="M32 16C24 10 14 18 14 34C14 50 26 58 32 58C38 58 50 50 50 34C50 18 40 10 32 16Z" fill="#EF4444" />
        <path d="M32 18C26 13 18 20 18 34C18 48 27 54 32 54C37 54 46 48 46 34C46 20 38 13 32 18Z" fill="#F87171" />
        <circle cx="24" cy="28" r="3" fill="#FCA5A5" opacity="0.8" />
      </svg>
    );
  }

  // 🥬 Leafy Greens / Vegetable Default
  if (catLower.includes("veg") || catLower.includes("gut") || catLower.includes("herb")) {
    return (
      <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 40C12 20 32 8 52 12C56 32 44 52 24 52C16 52 12 46 12 40Z" fill="#16A34A" />
        <path d="M16 38C16 22 32 12 48 15C51 31 41 47 25 47C19 47 16 43 16 38Z" fill="#4ADE80" />
        <path d="M14 48C28 38 42 24 50 14" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // 🌟 Universal Organic Produce Badge Fallback
  return (
    <svg className={`${dim} ${className}`} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="26" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="2" />
      <path d="M22 38C22 26 32 18 42 20C44 30 38 40 28 40C24 40 22 39 22 38Z" fill="#10B981" />
      <path d="M20 44C28 38 36 28 42 20" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

// Official WhatsApp Icon component with brand green and phone silhouette
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12.012 2C6.485 2 2 6.48 2 12.008c0 2.102.648 4.053 1.758 5.666L2 22l4.464-1.696A9.956 9.956 0 0012.012 22C17.538 22 22 17.52 22 12.008 22 6.48 17.538 2 12.012 2z"
      fill="#25D366"
    />
    <path
      d="M17.202 14.288c-.287-.144-1.7-.84-1.961-.936-.262-.096-.453-.144-.645.144-.191.288-.744.936-.912 1.128-.168.192-.335.216-.622.072-.288-.144-1.216-.448-2.316-1.428-.856-.763-1.435-1.706-1.603-1.994-.168-.288-.018-.444.126-.587.129-.129.287-.336.431-.504.144-.168.191-.288.287-.48.096-.192.048-.36-.024-.504-.072-.144-.645-1.56-.885-2.136-.233-.561-.471-.485-.645-.494l-.551-.01c-.191 0-.503.072-.766.36-.263.288-1.005.984-1.005 2.4 0 1.416 1.03 2.784 1.173 2.976.144.192 2.029 3.1 4.918 4.348.687.297 1.224.475 1.642.608.69.219 1.319.188 1.815.114.553-.083 1.701-.696 1.94-1.368.239-.672.239-1.248.168-1.368-.072-.12-.263-.192-.55-.336z"
      fill="#FFFFFF"
    />
  </svg>
);

// Aesthetic Decorative Produce Banner Artwork
export const AestheticProduceArt: React.FC<{ variant?: "harvest" | "ferments" | "nutrition" | "chef" }> = ({
  variant = "harvest",
}) => {
  if (variant === "harvest") {
    return (
      <div className="relative w-full h-36 sm:h-44 rounded-3xl overflow-hidden shadow-md group">
        <img
          src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80"
          alt="Fresh Organic Vegetables & Fruits"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-6 sm:px-10 text-white">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] bg-[#10B981] text-white px-3 py-1 rounded-full shadow-xs">
              🌱 Farm-Fresh Harvest
            </span>
            <span className="text-xs text-amber-300 font-serif-italic">100% Organic Vegetarian</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-italic mt-1 text-white drop-shadow-md">
            Lively Fruit & Vegetable Inventory
          </h2>
          <p className="text-xs text-emerald-100/90 max-w-lg mt-1 hidden sm:block">
            Vibrant cataloging of farm produce, active ferments, micro-nutrients, and expiration reminders.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "ferments") {
    return (
      <div className="relative w-full h-36 sm:h-44 rounded-3xl overflow-hidden shadow-md group">
        <img
          src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80"
          alt="Gut Health Probiotic Ferments and Fresh Produce"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-900/50 to-transparent flex flex-col justify-center px-6 sm:px-10 text-white">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] bg-amber-500 text-white px-3 py-1 rounded-full shadow-xs">
              🦠 Gut Health & Micro-Biome
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-italic mt-1 text-white drop-shadow-md">
            Live Probiotics & Active Enzymes
          </h2>
          <p className="text-xs text-amber-100/90 max-w-lg mt-1 hidden sm:block">
            Track kimchi, kombucha, sauerkraut, sprouted lentils, and probiotic rich gut superfoods.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "nutrition") {
    return (
      <div className="relative w-full h-36 sm:h-44 rounded-3xl overflow-hidden shadow-md group">
        <img
          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80"
          alt="Nutritious Rainbow Food"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 via-stone-900/40 to-transparent flex flex-col justify-center px-6 sm:px-10 text-white">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] bg-emerald-600 text-white px-3 py-1 rounded-full shadow-xs">
              🌈 Rainbow Macro Dashboard
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-italic mt-1 text-white drop-shadow-md">
            Plant-Based Bio-Availability
          </h2>
          <p className="text-xs text-stone-200/90 max-w-lg mt-1 hidden sm:block">
            Analyze plant protein, fiber density, vitamin C, iron, and gut diversity across your inventory.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-36 sm:h-44 rounded-3xl overflow-hidden shadow-md group">
      <img
        src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80"
        alt="Artisanal Vegetarian Cooking"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-950/85 via-amber-900/40 to-transparent flex flex-col justify-center px-6 sm:px-10 text-white">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] bg-orange-600 text-white px-3 py-1 rounded-full shadow-xs">
            👩‍🍳 DIY Botanical Kitchen
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif-italic mt-1 text-white drop-shadow-md">
          Zero-Waste Gourmet Recipes
        </h2>
      </div>
    </div>
  );
};

// Interactive Floating Parallax Wrapper for Pantry Cards with animated fresh farm illustrations
interface ParallaxWrapperProps {
  children: React.ReactNode;
  itemName?: string;
  category?: string;
  className?: string;
}

export const PantryItemParallaxWrapper: React.FC<ParallaxWrapperProps> = ({
  children,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    setOffset({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setOffset({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      className={`relative group ${className}`}
    >
      {children}

      {/* Subtle Floating Animated Fresh Farm Produce & Herbs */}
      <AnimatePresence>
        {isHovered && (
          <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
            {/* Top-Right Floating Basil Leaf */}
            <motion.div
              initial={{ opacity: 0, scale: 0.2, y: 10, rotate: -20 }}
              animate={{
                opacity: 0.95,
                scale: 1,
                x: offset.x * 14,
                y: [offset.y * 14, offset.y * 14 - 6, offset.y * 14],
                rotate: [offset.x * 12, offset.x * 12 + 8, offset.x * 12],
              }}
              exit={{ opacity: 0, scale: 0.3, y: 8 }}
              transition={{
                duration: 0.3,
                y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
              }}
              className="absolute -top-4 -right-3 w-9 h-9 drop-shadow-md"
            >
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 2C8 2 2 12 2 22C2 30 10 34 18 34C26 34 34 30 34 22C34 12 28 2 18 2Z"
                  fill="url(#basilGrad)"
                />
                <path d="M18 2V34M18 10L10 16M18 18L26 24M18 22L12 27" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="basilGrad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4ADE80" />
                    <stop offset="1" stopColor="#15803D" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* Top-Left Floating Lemon Slice */}
            <motion.div
              initial={{ opacity: 0, scale: 0.2, y: 8, rotate: 15 }}
              animate={{
                opacity: 0.9,
                scale: 1,
                x: offset.x * -12,
                y: [offset.y * -12, offset.y * -12 - 5, offset.y * -12],
                rotate: [-8 + offset.x * -10, -3 + offset.x * -10, -8 + offset.x * -10],
              }}
              exit={{ opacity: 0, scale: 0.3, y: 6 }}
              transition={{
                duration: 0.3,
                y: { repeat: Infinity, duration: 2.6, ease: "easeInOut", delay: 0.2 },
                rotate: { repeat: Infinity, duration: 2.8, ease: "easeInOut" },
              }}
              className="absolute -top-3 -left-3 w-8 h-8 drop-shadow-md"
            >
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#EAB308" />
                <circle cx="16" cy="16" r="12" fill="#FEF08A" />
                <path d="M16 4V28M4 16H28M7.5 7.5L24.5 24.5M24.5 7.5L7.5 24.5" stroke="#EAB308" strokeWidth="1.2" />
              </svg>
            </motion.div>

            {/* Bottom-Right Floating Tomato / Berry */}
            <motion.div
              initial={{ opacity: 0, scale: 0.2, y: -8 }}
              animate={{
                opacity: 0.9,
                scale: 1,
                x: offset.x * 16,
                y: [offset.y * 10, offset.y * 10 - 4, offset.y * 10],
                rotate: [10, 16, 10],
              }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{
                duration: 0.35,
                y: { repeat: Infinity, duration: 2.1, ease: "easeInOut", delay: 0.4 },
              }}
              className="absolute -bottom-2 -right-2 w-7 h-7 drop-shadow-md"
            >
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="18" r="11" fill="#EF4444" />
                <path d="M16 7C16 7 13 2 16 2C19 2 16 7 16 7Z" fill="#15803D" />
                <path d="M16 7C13 5 9 6 9 6C9 6 13 8 16 7Z" fill="#22C55E" />
                <path d="M16 7C19 5 23 6 23 6C23 6 19 8 16 7Z" fill="#22C55E" />
                <circle cx="12" cy="14" r="2.5" fill="#FCA5A5" opacity="0.6" />
              </svg>
            </motion.div>

            {/* Bottom-Left Micro Sprout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.2, x: 8 }}
              animate={{
                opacity: 0.85,
                scale: 1,
                x: offset.x * -10,
                y: [offset.y * -8, offset.y * -8 - 5, offset.y * -8],
                rotate: [-12, -6, -12],
              }}
              exit={{ opacity: 0, scale: 0.2 }}
              transition={{
                duration: 0.3,
                y: { repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.1 },
              }}
              className="absolute -bottom-3 -left-2 w-7 h-7 drop-shadow-sm"
            >
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 28V12" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 16C10 12 8 6 8 6C8 6 14 8 16 16Z" fill="#4ADE80" />
                <path d="M16 12C22 8 24 2 24 2C24 2 18 4 16 12Z" fill="#22C55E" />
              </svg>
            </motion.div>

            {/* Floating Organic Farm Badge */}
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-2 left-1/2 -translate-x-1/2 bg-emerald-950/90 text-emerald-100 text-[9px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-emerald-400/40 shadow-sm flex items-center gap-1"
            >
              <span>🌱 Fresh Farm Harvest</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

