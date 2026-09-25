import { apiPost } from "../lib/api";
import React, { useState } from "react";
import { PantryItem, NutrientCategory, FoodGroup } from "../types";
import {
  Plus,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  Apple,
  X,
  UploadCloud,
  ArrowUpDown,
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  Filter,
  RotateCcw,
} from "lucide-react";
import { StockReminderModal } from "./StockReminderModal";
import { ProduceIcon, AestheticProduceArt, PantryItemParallaxWrapper } from "./ProduceIcons";

interface PantryViewProps {
  items: PantryItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onAddItem: (item: Omit<PantryItem, "id">) => void;
  onAddBulkItems: (items: Omit<PantryItem, "id">[]) => void;
  onEditItem: (item: PantryItem) => void;
  onDeleteItem: (id: string) => void;
}

const nutrientCategories: NutrientCategory[] = [
  "Gut Health",
  "Probiotics",
  "Protein",
  "Dairy",
  "Carbohydrates",
  "Fats",
  "Vitamins",
  "Minerals",
  "Other",
];

const foodGroups: FoodGroup[] = [
  "Vegetables",
  "Legumes & Pulses",
  "Grains & Seeds",
  "Nuts & Healthy Fats",
  "Dairy & Alternatives",
  "Fermented & Gut Care",
  "Fruits",
  "Spices & Herbs",
  "Other",
];

const nutrientCategoryBadgeColors: Record<
  NutrientCategory,
  { bg: string; text: string; border: string }
> = {
  "Gut Health": { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300" },
  Probiotics: { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300" },
  Protein: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300" },
  Dairy: { bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-200" },
  Carbohydrates: { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-300" },
  Fats: { bg: "bg-yellow-100", text: "text-yellow-900", border: "border-yellow-300" },
  Vitamins: { bg: "bg-rose-100", text: "text-rose-900", border: "border-rose-300" },
  Minerals: { bg: "bg-teal-100", text: "text-teal-900", border: "border-teal-300" },
  Other: { bg: "bg-stone-100", text: "text-stone-800", border: "border-stone-300" },
};

// Helper: calculate days until expiration
const calculateExpiryDays = (expiryDateStr?: string) => {
  if (!expiryDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDateStr);
  exp.setHours(0, 0, 0, 0);
  if (isNaN(exp.getTime())) return null;
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper: badge metadata for expiry status
const getExpiryBadgeInfo = (expiryDateStr?: string) => {
  const days = calculateExpiryDays(expiryDateStr);
  if (days === null) {
    return {
      type: "none",
      days: null,
      label: "No Expiry Date",
      badgeClass: "bg-[#5A5A40]/10 text-[#5A5A40] border-[#5A5A40]/15 hover:border-[#5A5A40]",
      icon: Calendar,
    };
  }
  if (days < 0) {
    const ago = Math.abs(days);
    return {
      type: "expired",
      days,
      label: `Expired (${ago}d ago)`,
      badgeClass: "bg-[#DC2626] text-white border-[#DC2626] shadow-xs animate-pulse",
      icon: AlertTriangle,
    };
  }
  if (days === 0) {
    return {
      type: "expiring_today",
      days,
      label: "Expires Today!",
      badgeClass: "bg-[#EA580C] text-white border-[#EA580C] shadow-xs",
      icon: Clock,
    };
  }
  if (days <= 7) {
    return {
      type: "expiring_soon",
      days,
      label: `Expires in ${days}d`,
      badgeClass: "bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs",
      icon: Clock,
    };
  }
  return {
    type: "fresh",
    days,
    label: `Exp: ${expiryDateStr}`,
    badgeClass: "bg-[#15803D]/10 text-[#15803D] border-[#15803D]/25",
    icon: Calendar,
  };
};

export const PantryView: React.FC<PantryViewProps> = ({
  items,
  onUpdateQuantity,
  onAddItem,
  onAddBulkItems,
  onEditItem,
  onDeleteItem,
}) => {
  const [viewMode, setViewMode] = useState<"nutrient" | "food">("nutrient");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter States
  const [expiryStatusFilter, setExpiryStatusFilter] = useState<
    "All" | "Expired" | "ExpiringSoon" | "InDate" | "LowStock"
  >("All");
  const [selectedNutrientCategory, setSelectedNutrientCategory] = useState<string>("All");
  const [selectedFoodGroup, setSelectedFoodGroup] = useState<string>("All");
  const [selectedHealthBenefit, setSelectedHealthBenefit] = useState<
    "All" | "Probiotic" | "HighProtein" | "HighFiber" | "LowCalorie"
  >("All");

  const [sortBy, setSortBy] = useState<
    | "name-asc"
    | "name-desc"
    | "expiry-asc"
    | "expiry-desc"
    | "quantity-asc"
    | "quantity-desc"
    | "protein-desc"
    | "fiber-desc"
    | "calories-desc"
  >("name-asc");

  const [reminderItem, setReminderItem] = useState<PantryItem | null>(null);
  const [editingExpiryItem, setEditingExpiryItem] = useState<PantryItem | null>(null);
  const [editExpiryDateValue, setEditExpiryDateValue] = useState<string>("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Single Item Add Form State
  const [newItem, setNewItem] = useState({
    name: "",
    nutrientCategory: "Protein" as NutrientCategory,
    foodGroup: "Legumes & Pulses" as FoodGroup,
    quantity: 500,
    unit: "g",
    threshold: 200,
    caloriesPerUnit: 120,
    proteinPerUnit: 8,
    carbsPerUnit: 15,
    fatsPerUnit: 2,
    fiberPerUnit: 4,
    keyMicroNutrients: "Iron, Calcium, Zinc",
    healthNotes: "Great organic vegetarian pantry staple.",
    expiryDate: "",
  });

  // Calculate Expiration Summary Counters
  const expiredItems = items.filter((i) => {
    const d = calculateExpiryDays(i.expiryDate);
    return d !== null && d < 0;
  });
  const expiringSoonItems = items.filter((i) => {
    const d = calculateExpiryDays(i.expiryDate);
    return d !== null && d >= 0 && d <= 7;
  });
  const freshItems = items.filter((i) => {
    const d = calculateExpiryDays(i.expiryDate);
    return d !== null && d > 7;
  });
  const lowStockItems = items.filter((i) => i.quantity <= i.threshold);

  // Filter & Sort Items
  const filteredItems = items
    .filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.nutrientCategory.toLowerCase().includes(q) ||
        item.foodGroup.toLowerCase().includes(q) ||
        (item.healthNotes && item.healthNotes.toLowerCase().includes(q)) ||
        item.keyMicroNutrients.some((m) => m.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Expiry & Stock status filter
      const expDays = calculateExpiryDays(item.expiryDate);
      if (expiryStatusFilter === "Expired" && (expDays === null || expDays >= 0)) return false;
      if (expiryStatusFilter === "ExpiringSoon" && (expDays === null || expDays < 0 || expDays > 7)) return false;
      if (expiryStatusFilter === "InDate" && (expDays === null || expDays < 0)) return false;
      if (expiryStatusFilter === "LowStock" && item.quantity > item.threshold) return false;

      // Nutrient Category filter
      if (selectedNutrientCategory !== "All" && item.nutrientCategory !== selectedNutrientCategory) {
        return false;
      }

      // Food Group filter
      if (selectedFoodGroup !== "All" && item.foodGroup !== selectedFoodGroup) {
        return false;
      }

      // Benefit filter
      if (selectedHealthBenefit === "Probiotic") {
        const isGut =
          item.nutrientCategory === "Probiotics" ||
          item.nutrientCategory === "Gut Health" ||
          item.foodGroup === "Fermented & Gut Care";
        if (!isGut) return false;
      }
      if (selectedHealthBenefit === "HighProtein" && item.proteinPerUnit < 15) return false;
      if (selectedHealthBenefit === "HighFiber" && item.fiberPerUnit < 5) return false;
      if (selectedHealthBenefit === "LowCalorie" && item.caloriesPerUnit > 100) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);

      if (sortBy === "expiry-asc") {
        const daysA = calculateExpiryDays(a.expiryDate) ?? 999999;
        const daysB = calculateExpiryDays(b.expiryDate) ?? 999999;
        return daysA - daysB;
      }
      if (sortBy === "expiry-desc") {
        const daysA = calculateExpiryDays(a.expiryDate) ?? -999999;
        const daysB = calculateExpiryDays(b.expiryDate) ?? -999999;
        return daysB - daysA;
      }

      if (sortBy === "quantity-asc") return a.quantity - b.quantity;
      if (sortBy === "quantity-desc") return b.quantity - a.quantity;
      if (sortBy === "protein-desc") return b.proteinPerUnit - a.proteinPerUnit;
      if (sortBy === "fiber-desc") return b.fiberPerUnit - a.fiberPerUnit;
      if (sortBy === "calories-desc") return b.caloriesPerUnit - a.caloriesPerUnit;
      return 0;
    });

  const handleBulkSubmit = async () => {
    if (!bulkText.trim()) return;
    setIsBulkProcessing(true);
    try {
      const data = await apiPost<{ items: any[] }>("/api/pantry/categorize", { itemsText: bulkText });
      if (data.items && Array.isArray(data.items)) {
        const formatted: Omit<PantryItem, "id">[] = data.items.map((i: any) => ({
          name: i.name || "Pantry Item",
          nutrientCategory: (i.nutrientCategory as NutrientCategory) || "Other",
          foodGroup: (i.foodGroup as FoodGroup) || "Other",
          quantity: i.defaultQuantity || 500,
          unit: i.unit || "g",
          threshold: i.threshold || 150,
          caloriesPerUnit: i.caloriesPerUnit || 100,
          proteinPerUnit: i.proteinPerUnit || 5,
          carbsPerUnit: i.carbsPerUnit || 15,
          fatsPerUnit: i.fatsPerUnit || 2,
          fiberPerUnit: i.fiberPerUnit || 3,
          keyMicroNutrients: i.keyMicroNutrients || ["Essential Nutrients"],
          healthNotes: i.healthNotes || "Organic pantry item.",
          expiryDate: i.expiryDate || new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
          lastUpdated: new Date().toISOString(),
        }));
        onAddBulkItems(formatted);
        setBulkText("");
        setShowBulkModal(false);
      }
    } catch (err) {
      console.error("Bulk import failed:", err);
      alert((err as Error).message || "Couldn't read that list. Please try again.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleSingleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    onAddItem({
      name: newItem.name.trim(),
      nutrientCategory: newItem.nutrientCategory,
      foodGroup: newItem.foodGroup,
      quantity: Number(newItem.quantity),
      unit: newItem.unit,
      threshold: Number(newItem.threshold),
      caloriesPerUnit: Number(newItem.caloriesPerUnit),
      proteinPerUnit: Number(newItem.proteinPerUnit),
      carbsPerUnit: Number(newItem.carbsPerUnit),
      fatsPerUnit: Number(newItem.fatsPerUnit),
      fiberPerUnit: Number(newItem.fiberPerUnit),
      keyMicroNutrients: newItem.keyMicroNutrients.split(",").map((s) => s.trim()).filter(Boolean),
      healthNotes: newItem.healthNotes,
      expiryDate: newItem.expiryDate || undefined,
      lastUpdated: new Date().toISOString(),
    });
    setShowAddModal(false);
  };

  const handleSaveExpiryDate = () => {
    if (!editingExpiryItem) return;
    onEditItem({
      ...editingExpiryItem,
      expiryDate: editExpiryDateValue || undefined,
      lastUpdated: new Date().toISOString(),
    });
    setEditingExpiryItem(null);
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setExpiryStatusFilter("All");
    setSelectedNutrientCategory("All");
    setSelectedFoodGroup("All");
    setSelectedHealthBenefit("All");
    setSortBy("name-asc");
  };

  const activeFiltersCount =
    (expiryStatusFilter !== "All" ? 1 : 0) +
    (selectedNutrientCategory !== "All" ? 1 : 0) +
    (selectedFoodGroup !== "All" ? 1 : 0) +
    (selectedHealthBenefit !== "All" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Group items by current View Mode
  const groupedCategories = viewMode === "nutrient" ? nutrientCategories : foodGroups;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Aesthetic Fresh Harvest Banner */}
      <AestheticProduceArt variant="harvest" />

      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                🌱 Vegetarian Smart Stock
              </span>
              <span className="text-xs text-stone-600 font-semibold">
                {items.length} items cataloged
              </span>
            </div>
            <h1 className="text-3xl font-serif-italic text-emerald-950 mt-2 tracking-tight font-bold">
              Pantry Inventory & Expiration Vault
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl font-medium">
              Track stock levels, expiration schedules, micro/macro benefits, and set instant grocery reminders for low or expiring stock.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 transition shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>AI List Import</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Produce Item</span>
            </button>
          </div>
        </div>

        {/* EXPIRATION & STOCK QUICK DASHBOARD SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-[#5A5A40]/10">
          <button
            onClick={() => setExpiryStatusFilter("All")}
            className={`p-3 rounded-2xl border text-left transition ${
              expiryStatusFilter === "All"
                ? "bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs"
                : "bg-[#F9F8F4] text-[#2D2D2D] border-[#5A5A40]/15 hover:border-[#5A5A40]"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">All Items</span>
            <span className="text-xl font-bold font-mono">{items.length}</span>
          </button>

          <button
            onClick={() => setExpiryStatusFilter("Expired")}
            className={`p-3 rounded-2xl border text-left transition ${
              expiryStatusFilter === "Expired"
                ? "bg-[#DC2626] text-white border-[#DC2626] shadow-xs"
                : "bg-[#DC2626]/5 text-[#DC2626] border-[#DC2626]/20 hover:border-[#DC2626]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">🔴 Expired</span>
              {expiredItems.length > 0 && <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />}
            </div>
            <span className="text-xl font-bold font-mono">{expiredItems.length}</span>
          </button>

          <button
            onClick={() => setExpiryStatusFilter("ExpiringSoon")}
            className={`p-3 rounded-2xl border text-left transition ${
              expiryStatusFilter === "ExpiringSoon"
                ? "bg-[#F59E0B] text-white border-[#F59E0B] shadow-xs"
                : "bg-[#F59E0B]/10 text-[#B45309] border-[#F59E0B]/30 hover:border-[#F59E0B]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">🟠 Expiring (≤7d)</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-xl font-bold font-mono">{expiringSoonItems.length}</span>
          </button>

          <button
            onClick={() => setExpiryStatusFilter("InDate")}
            className={`p-3 rounded-2xl border text-left transition ${
              expiryStatusFilter === "InDate"
                ? "bg-[#15803D] text-white border-[#15803D] shadow-xs"
                : "bg-[#15803D]/5 text-[#15803D] border-[#15803D]/20 hover:border-[#15803D]"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">🟢 Fresh Stock</span>
            <span className="text-xl font-bold font-mono">{freshItems.length}</span>
          </button>

          <button
            onClick={() => setExpiryStatusFilter("LowStock")}
            className={`p-3 rounded-2xl border text-left transition col-span-2 sm:col-span-1 ${
              expiryStatusFilter === "LowStock"
                ? "bg-[#F27D26] text-white border-[#F27D26] shadow-xs"
                : "bg-[#F27D26]/10 text-[#F27D26] border-[#F27D26]/30 hover:border-[#F27D26]"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">⚠️ Low Stock</span>
            <span className="text-xl font-bold font-mono">{lowStockItems.length}</span>
          </button>
        </div>

        {/* SEARCH, SORT & DETAILED PANTRY FILTERS CONTROL BAR */}
        <div className="pt-2 border-t border-[#5A5A40]/10 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#F9F8F4] border border-[#5A5A40]/15 rounded-full p-1 self-start">
              <button
                onClick={() => setViewMode("nutrient")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  viewMode === "nutrient"
                    ? "bg-[#5A5A40] text-white shadow-xs font-bold"
                    : "text-[#5A5A40]/70 hover:text-[#5A5A40]"
                }`}
              >
                Nutrient Benefits
              </button>
              <button
                onClick={() => setViewMode("food")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  viewMode === "food"
                    ? "bg-[#5A5A40] text-white shadow-xs font-bold"
                    : "text-[#5A5A40]/70 hover:text-[#5A5A40]"
                }`}
              >
                Food Groups
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5A40]/50" />
              <input
                type="text"
                placeholder="Search items, micro-nutrients, benefits (e.g., Probiotics, Zinc)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#5A5A40]/15 rounded-full pl-10 pr-8 py-2 text-xs text-[#2D2D2D] placeholder-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A40]/40 hover:text-[#5A5A40]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-[#5A5A40]/15 rounded-full px-3.5 py-2 text-xs shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#5A5A40]" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-[#2D2D2D] font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="name-asc">Sort: Name (A-Z)</option>
                <option value="name-desc">Sort: Name (Z-A)</option>
                <option value="expiry-asc">Sort: Expiry (Soonest First) ⚠️</option>
                <option value="expiry-desc">Sort: Expiry (Furthest First)</option>
                <option value="quantity-asc">Sort: Stock (Low to High)</option>
                <option value="quantity-desc">Sort: Stock (High to Low)</option>
                <option value="protein-desc">Sort: Protein (Highest)</option>
                <option value="fiber-desc">Sort: Fiber (Highest)</option>
                <option value="calories-desc">Sort: Calories (Highest)</option>
              </select>
            </div>
          </div>

          {/* SECOND ROW FILTERS: Nutrient Category, Food Group & Benefit Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            <span className="text-[#5A5A40] font-bold text-[11px] flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#5A5A40]" /> Filters:
            </span>

            {/* Nutrient Category Dropdown */}
            <select
              value={selectedNutrientCategory}
              onChange={(e) => setSelectedNutrientCategory(e.target.value)}
              className="bg-white border border-[#5A5A40]/20 rounded-full px-3 py-1 text-xs text-[#2D2D2D] font-medium focus:outline-none focus:border-[#5A5A40] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {nutrientCategories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>

            {/* Food Group Dropdown */}
            <select
              value={selectedFoodGroup}
              onChange={(e) => setSelectedFoodGroup(e.target.value)}
              className="bg-white border border-[#5A5A40]/20 rounded-full px-3 py-1 text-xs text-[#2D2D2D] font-medium focus:outline-none focus:border-[#5A5A40] cursor-pointer"
            >
              <option value="All">All Food Groups</option>
              {foodGroups.map((f) => (
                <option key={f} value={f}>
                  Group: {f}
                </option>
              ))}
            </select>

            {/* Quick Benefit Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { id: "All", label: "All Benefits" },
                { id: "Probiotic", label: "🌿 Probiotics & Gut" },
                { id: "HighProtein", label: "💪 High Protein (≥15g)" },
                { id: "HighFiber", label: "🌾 High Fiber (≥5g)" },
                { id: "LowCalorie", label: "⚡ Low Cal (≤100)" },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedHealthBenefit(b.id as any)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition whitespace-nowrap ${
                    selectedHealthBenefit === b.id
                      ? "bg-[#5A5A40] text-white font-bold shadow-xs"
                      : "bg-white text-[#5A5A40]/70 hover:text-[#5A5A40] border border-[#5A5A40]/15"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Reset Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 px-3 py-1 bg-[#E8D8C3]/50 hover:bg-[#E8D8C3] text-[#5A5A40] rounded-full text-[11px] font-bold transition border border-[#5A5A40]/15 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ({activeFiltersCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN GRID VIEW GROUPED BY CATEGORY */}
      <div className="space-y-8">
        {groupedCategories.map((category) => {
          const categoryItems = filteredItems.filter((i) =>
            viewMode === "nutrient" ? i.nutrientCategory === category : i.foodGroup === category
          );

          if (
            categoryItems.length === 0 &&
            (selectedNutrientCategory !== "All" || selectedFoodGroup !== "All" || searchQuery.trim() || expiryStatusFilter !== "All")
          ) {
            return null;
          }

          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              {/* Category Section Header with Aesthetic Produce Icon */}
              <div className="flex items-center justify-between border-b border-emerald-900/15 pb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shadow-2xs">
                    <ProduceIcon name={category} category={category} size="sm" />
                  </div>
                  <h2 className="text-xl font-serif-italic text-emerald-950 font-bold">
                    {category}
                  </h2>
                  <span className="text-xs bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                    {categoryItems.length} items
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-800/70 font-bold">
                  {viewMode === "nutrient" ? "Nutrient-based Group" : "Food Group"}
                </span>
              </div>

              {/* Items Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryItems.map((item) => {
                  const isLowStock = item.quantity <= item.threshold;
                  const categoryStyle =
                    nutrientCategoryBadgeColors[item.nutrientCategory] ||
                    nutrientCategoryBadgeColors["Other"];
                  const fillPercentage = Math.min(
                    100,
                    Math.max(10, Math.round((item.quantity / (item.threshold * 2)) * 100))
                  );

                  const expiryBadge = getExpiryBadgeInfo(item.expiryDate);
                  const ExpiryIcon = expiryBadge.icon;

                  return (
                    <PantryItemParallaxWrapper
                      key={item.id}
                      itemName={item.name}
                      category={item.nutrientCategory}
                    >
                      <div
                        className={`relative flex flex-col justify-between bg-white rounded-3xl p-5 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                          expiryBadge.type === "expired"
                            ? "border-red-300 bg-red-50/40"
                            : isLowStock
                            ? "border-amber-300 bg-amber-50/30"
                            : "border-emerald-900/10 hover:border-emerald-300"
                        }`}
                      >
                        {/* Top Row: Aesthetic Produce Icon, Name & Badges */}
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-xs">
                                <ProduceIcon name={item.name} category={item.nutrientCategory} size="md" />
                              </div>
                              <div>
                                <h3 className="font-bold text-base text-stone-900 leading-snug">
                                  {item.name}
                                </h3>
                                <p className="text-[10px] text-stone-500 font-medium">
                                  {item.foodGroup}
                                </p>
                              </div>
                            </div>

                            {isLowStock ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                                <AlertCircle className="w-3 h-3" /> Low Stock
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> In Stock
                              </span>
                            )}
                          </div>

                          {/* Category Badges + Expiration Badge */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            <span
                              className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
                            >
                              {item.nutrientCategory}
                            </span>
                            <span className="text-[10px] font-semibold bg-[#F9F8F4] text-[#5A5A40]/80 border border-[#5A5A40]/15 px-2.5 py-0.5 rounded-full">
                              {item.foodGroup}
                            </span>

                            {/* Interactive Expiry Badge */}
                            <button
                              onClick={() => {
                                setEditingExpiryItem(item);
                                setEditExpiryDateValue(item.expiryDate || "");
                              }}
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 transition ${expiryBadge.badgeClass}`}
                              title="Click to update expiration date"
                            >
                              <ExpiryIcon className="w-3 h-3" />
                              <span>{expiryBadge.label}</span>
                              <Edit3 className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                            </button>
                          </div>

                          {/* Health Notes / Tip */}
                          {item.healthNotes && (
                            <p className="text-[11px] text-[#5A5A40]/80 mt-3 leading-relaxed bg-[#F9F8F4] p-3 rounded-2xl border border-[#5A5A40]/10 italic">
                              "{item.healthNotes}"
                            </p>
                          )}

                          {/* Micro Nutrients Tags */}
                          {item.keyMicroNutrients.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-3">
                              {item.keyMicroNutrients.map((m, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] bg-[#E8D8C3]/40 text-[#5A5A40] px-2 py-0.5 rounded-full font-medium border border-[#5A5A40]/10"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Macro Summary Pill */}
                          <div className="grid grid-cols-4 gap-1 text-center mt-3 bg-[#F9F8F4] p-2.5 rounded-2xl border border-[#5A5A40]/10 text-[10px]">
                            <div>
                              <span className="block text-[#5A5A40]/60">Cals</span>
                              <span className="font-bold text-[#2D2D2D]">{item.caloriesPerUnit}</span>
                            </div>
                            <div>
                              <span className="block text-[#5A5A40]/60">Protein</span>
                              <span className="font-bold text-[#5A5A40]">{item.proteinPerUnit}g</span>
                            </div>
                            <div>
                              <span className="block text-[#5A5A40]/60">Carbs</span>
                              <span className="font-bold text-[#B45309]">{item.carbsPerUnit}g</span>
                            </div>
                            <div>
                              <span className="block text-[#5A5A40]/60">Fiber</span>
                              <span className="font-bold text-[#5A5A40]">{item.fiberPerUnit}g</span>
                            </div>
                          </div>

                          {/* Quantity Level Progress Bar */}
                          <div className="mt-4 space-y-1">
                            <div className="flex justify-between text-[11px] text-[#5A5A40]">
                              <span>Stock Level</span>
                              <span className="font-bold font-mono">
                                {item.quantity} {item.unit} / {item.threshold * 2} {item.unit}
                              </span>
                            </div>
                            <div className="h-1.5 bg-[#E8D8C3]/50 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isLowStock ? "bg-[#F27D26]" : "bg-[#5A5A40]"
                                }`}
                                style={{ width: `${fillPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Quantity Adjust Controls, Remind & Delete */}
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#5A5A40]/10">
                          <span className="text-[10px] text-[#5A5A40]/60 uppercase font-medium">
                            Alert Threshold: {item.threshold} {item.unit}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setReminderItem(item)}
                              className={`p-2.5 rounded-2xl transition min-w-[40px] min-h-[40px] flex items-center justify-center ${
                                isLowStock || expiryBadge.type === "expired" || expiryBadge.type === "expiring_soon"
                                  ? "text-amber-700 bg-amber-100/70 hover:bg-amber-200"
                                  : "text-stone-500 hover:text-emerald-800 hover:bg-emerald-50"
                              }`}
                              title="Remind me to stock up"
                            >
                              <Bell className="w-4 h-4" />
                            </button>

                            <div className="flex items-center bg-stone-100 rounded-full border border-stone-200 p-1 shadow-2xs">
                              <button
                                onClick={() => onUpdateQuantity(item.id, -50)}
                                className="w-8 h-8 flex items-center justify-center text-stone-800 hover:bg-stone-200 active:scale-95 rounded-full text-sm font-bold transition"
                                title="Decrease quantity by 50"
                              >
                                -
                              </button>
                              <span className="px-2.5 text-xs font-bold text-stone-900 font-mono">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, 50)}
                                className="w-8 h-8 flex items-center justify-center text-stone-800 hover:bg-stone-200 active:scale-95 rounded-full text-sm font-bold transition"
                                title="Increase quantity by 50"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition min-w-[40px] min-h-[40px] flex items-center justify-center"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </PantryItemParallaxWrapper>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#5A5A40]/15 p-8 shadow-xs space-y-3">
            <Apple className="w-10 h-10 text-[#5A5A40]/40 mx-auto" />
            <h3 className="text-base font-bold text-[#2D2D2D]">No matching pantry items found</h3>
            <p className="text-xs text-[#5A5A40]/70 max-w-md mx-auto">
              No items match your active search or filter selection. Try resetting filters or add new stock items!
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white rounded-full text-xs font-bold transition shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* QUICK EXPIRATION DATE EDIT MODAL */}
      {editingExpiryItem && (
        <div className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F9F8F4] border border-[#5A5A40]/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#5A5A40]/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#5A5A40]" />
                <h3 className="text-xl font-serif-italic text-[#2D2D2D]">
                  Set Expiration Date
                </h3>
              </div>
              <button
                onClick={() => setEditingExpiryItem(null)}
                className="text-[#5A5A40]/60 hover:text-[#5A5A40] p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5A5A40]/80">
              Update expiration date for <strong className="text-[#2D2D2D]">{editingExpiryItem.name}</strong> to maintain pantry freshness alerts.
            </p>

            <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#5A5A40]/15">
              <label className="block text-xs font-bold text-[#5A5A40]">Pick Expiration Date:</label>
              <input
                type="date"
                value={editExpiryDateValue}
                onChange={(e) => setEditExpiryDateValue(e.target.value)}
                className="w-full bg-[#F9F8F4] border border-[#5A5A40]/20 rounded-xl px-3.5 py-2 text-xs text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
              />

              {/* Quick Preset Buttons */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-[#5A5A40]/60 block mb-1.5">
                  Quick Expiration Shortcuts:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "+ 7 Days", days: 7 },
                    { label: "+ 14 Days", days: 14 },
                    { label: "+ 1 Month", days: 30 },
                    { label: "+ 3 Months", days: 90 },
                    { label: "+ 6 Months", days: 180 },
                    { label: "+ 1 Year", days: 365 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + p.days * 86400000);
                        setEditExpiryDateValue(d.toISOString().split("T")[0]);
                      }}
                      className="py-1.5 px-2 bg-[#F9F8F4] hover:bg-[#E8D8C3]/50 text-[#5A5A40] border border-[#5A5A40]/15 rounded-xl text-[11px] font-medium transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditExpiryDateValue("");
                }}
                className="text-xs text-[#DC2626] hover:underline font-semibold"
              >
                Clear Expiry
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingExpiryItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#5A5A40]/70 hover:text-[#5A5A40]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveExpiryDate}
                  className="px-5 py-2 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white rounded-full text-xs font-bold shadow-xs transition"
                >
                  Save Expiration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI BULK PASTE IMPORT MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F9F8F4] border border-[#5A5A40]/15 rounded-3xl p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B45309]" />
                <h3 className="text-xl font-serif-italic text-[#5A5A40]">
                  AI Pantry List Importer
                </h3>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-[#5A5A40]/60 hover:text-[#5A5A40] p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5A5A40]/80 leading-relaxed">
              Paste ingredients, grocery shopping lists, or pantry inventory notes. Gemini AI will automatically extract names, exact nutrient categories (Gut Health, Probiotics, Protein, etc.), units, and macro estimations.
            </p>

            <textarea
              rows={5}
              placeholder="E.g., 500g sauerkraut, 1kg organic sprouted quinoa, 200g chia seeds, 1 bottle apple cider vinegar with mother, 400g tempeh, turmeric powder..."
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full bg-white border border-[#5A5A40]/20 rounded-2xl p-4 text-xs text-[#2D2D2D] placeholder-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40]"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5A5A40]/70 hover:text-[#5A5A40]"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={isBulkProcessing || !bulkText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white rounded-full text-xs font-semibold shadow-xs disabled:opacity-50 transition"
              >
                {isBulkProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Categorizing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Auto-Categorize & Import</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE ITEM ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F9F8F4] border border-[#5A5A40]/15 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#5A5A40]/15 pb-3">
              <h3 className="text-xl font-serif-italic text-[#5A5A40]">
                Add New Pantry Stock Item
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#5A5A40]/60 hover:text-[#5A5A40]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSingleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Organic Fermented Kimchi"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-3.5 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A5A40] font-semibold mb-1">Nutrient Category *</label>
                  <select
                    value={newItem.nutrientCategory}
                    onChange={(e) => setNewItem({ ...newItem, nutrientCategory: e.target.value as NutrientCategory })}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-3.5 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                  >
                    {nutrientCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#5A5A40] font-semibold mb-1">Food Group *</label>
                  <select
                    value={newItem.foodGroup}
                    onChange={(e) => setNewItem({ ...newItem, foodGroup: e.target.value as FoodGroup })}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-3.5 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                  >
                    {foodGroups.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#5A5A40] font-semibold mb-1">Current Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A5A40] font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A5A40] font-semibold mb-1">Low Alert Limit</label>
                  <input
                    type="number"
                    min={0}
                    value={newItem.threshold}
                    onChange={(e) => setNewItem({ ...newItem, threshold: Number(e.target.value) })}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              {/* Expiration Date Input */}
              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">Expiration Date (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                    className="flex-1 bg-white border border-[#5A5A40]/20 rounded-xl px-3 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 30 * 86400000);
                      setNewItem({ ...newItem, expiryDate: d.toISOString().split("T")[0] });
                    }}
                    className="px-3 py-2 bg-[#E8D8C3]/50 hover:bg-[#E8D8C3] text-[#5A5A40] font-semibold rounded-xl text-[11px] border border-[#5A5A40]/15"
                  >
                    + 1 Month
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[#5A5A40]/70 mb-1">Calories</label>
                  <input
                    type="number"
                    value={newItem.caloriesPerUnit}
                    onChange={(e) => setNewItem({ ...newItem, caloriesPerUnit: Number(e.target.value) })}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-2.5 py-1.5 text-[#2D2D2D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5A5A40]/70 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={newItem.proteinPerUnit}
                    onChange={(e) => setNewItem({ ...newItem, proteinPerUnit: Number(e.target.value) })}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-2.5 py-1.5 text-[#2D2D2D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5A5A40]/70 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={newItem.carbsPerUnit}
                    onChange={(e) => setNewItem({ ...newItem, carbsPerUnit: Number(e.target.value) })}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-2.5 py-1.5 text-[#2D2D2D]"
                  />
                </div>
                <div>
                  <label className="block text-[#5A5A40]/70 mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    value={newItem.fiberPerUnit}
                    onChange={(e) => setNewItem({ ...newItem, fiberPerUnit: Number(e.target.value) })}
                    className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-2.5 py-1.5 text-[#2D2D2D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">Micro-Nutrients (comma-separated)</label>
                <input
                  type="text"
                  placeholder="E.g., Probiotics, Zinc, Vitamin B12"
                  value={newItem.keyMicroNutrients}
                  onChange={(e) => setNewItem({ ...newItem, keyMicroNutrients: e.target.value })}
                  className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-3 py-2 text-[#2D2D2D]"
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-semibold mb-1">Vegetarian Health Benefit Note</label>
                <input
                  type="text"
                  placeholder="E.g., Live bacterial cultures improve digestion and gut mucosal lining"
                  value={newItem.healthNotes}
                  onChange={(e) => setNewItem({ ...newItem, healthNotes: e.target.value })}
                  className="w-full bg-white border border-[#5A5A40]/20 rounded-xl px-3 py-2 text-[#2D2D2D]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[#5A5A40]/70 hover:text-[#5A5A40] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white font-semibold rounded-full shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK REMINDER MODAL */}
      {reminderItem && (
        <StockReminderModal
          item={reminderItem}
          onClose={() => setReminderItem(null)}
        />
      )}
    </div>
  );
};
