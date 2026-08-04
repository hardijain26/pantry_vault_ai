import React, { useState, useMemo } from "react";
import {
  PantryItem,
  UserProfile,
} from "../types";
import {
  Calendar,
  Sparkles,
  Search,
  Filter,
  TrendingDown,
  Info,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  MapPin,
  Flame,
  Sun,
  Snowflake,
  Leaf,
  X,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { ProduceIcon, AestheticProduceArt } from "./ProduceIcons";
import { motion, AnimatePresence } from "motion/react";

interface SeasonalHarvestMapProps {
  pantryItems: PantryItem[];
  userProfile?: UserProfile;
  onAddIngredientToPantry: (item: Omit<PantryItem, "id">) => void;
  onNavigateToPantry?: () => void;
}

// 12 Months Metadata
const MONTHS = [
  { short: "Jan", name: "January", season: "Winter", icon: Snowflake },
  { short: "Feb", name: "February", season: "Winter", icon: Snowflake },
  { short: "Mar", name: "March", season: "Spring", icon: Leaf },
  { short: "Apr", name: "April", season: "Spring", icon: Leaf },
  { short: "May", name: "May", season: "Spring", icon: Leaf },
  { short: "Jun", name: "June", season: "Summer", icon: Sun },
  { short: "Jul", name: "July", season: "Summer", icon: Sun },
  { short: "Aug", name: "August", season: "Summer", icon: Sun },
  { short: "Sep", name: "September", season: "Autumn", icon: Flame },
  { short: "Oct", name: "October", season: "Autumn", icon: Flame },
  { short: "Nov", name: "November", season: "Autumn", icon: Flame },
  { short: "Dec", name: "December", season: "Winter", icon: Snowflake },
];

export interface HarvestProduce {
  id: string;
  name: string;
  category: "Vegetables & Greens" | "Herbs & Aromatics" | "Fruits & Berries" | "Roots & Squash" | "Legumes & Staples";
  produceIcon: string;
  availability: number[]; // 12 numbers: 100 = Peak, 60 = Moderate, 20 = Low/Off-season
  peakMonthsText: string;
  flavorProfile: string;
  preservationTip: string;
  priceDiscount: string; // e.g. "35% - 50% Cheaper"
  microNutrients: string[];
  foodGroup: string;
  caloriesPerUnit: number;
  proteinPerUnit: number;
}

const HARVEST_DATABASE: HarvestProduce[] = [
  {
    id: "tomatoes",
    name: "Heirloom & Vine Tomatoes",
    category: "Vegetables & Greens",
    produceIcon: "tomato",
    availability: [20, 20, 20, 40, 60, 100, 100, 100, 100, 60, 30, 20],
    peakMonthsText: "June - September",
    flavorProfile: "Rich Umami, Sweet, Low Acid",
    preservationTip: "Roast with olive oil & garlic, then vacuum freeze or store as rich paste.",
    priceDiscount: "40% - 60% Cheaper in Late Summer",
    microNutrients: ["Lycopene", "Vitamin C", "Potassium"],
    foodGroup: "Vegetables & Greens",
    caloriesPerUnit: 25,
    proteinPerUnit: 1.2,
  },
  {
    id: "basil",
    name: "Fresh Sweet Basil",
    category: "Herbs & Aromatics",
    produceIcon: "basil",
    availability: [20, 20, 30, 50, 80, 100, 100, 100, 90, 50, 20, 20],
    peakMonthsText: "June - September",
    flavorProfile: "Aromatic, Piquant, Anise-sweet",
    preservationTip: "Blend into extra virgin olive oil and freeze in ice cube trays for pesto.",
    priceDiscount: "50% Cheaper / Abundant Garden Yield",
    microNutrients: ["Eugenol", "Vitamin K", "Flavonoids"],
    foodGroup: "Herbs & Spices",
    caloriesPerUnit: 10,
    proteinPerUnit: 0.8,
  },
  {
    id: "avocado",
    name: "Hass & Hass Organic Avocados",
    category: "Fruits & Berries",
    produceIcon: "avocado",
    availability: [80, 80, 100, 100, 100, 90, 80, 70, 60, 50, 60, 70],
    peakMonthsText: "March - June",
    flavorProfile: "Creamy, Nutty, Velvety Fat",
    preservationTip: "Freeze mashed avocado pulp with 1 tsp lemon juice to prevent oxidation.",
    priceDiscount: "30% Cheaper in Spring Harvest",
    microNutrients: ["Monounsaturated Fats", "Folate", "Vitamin E"],
    foodGroup: "Fruits & Healthy Fats",
    caloriesPerUnit: 160,
    proteinPerUnit: 2.0,
  },
  {
    id: "garlic",
    name: "Hardneck & Softneck Garlic",
    category: "Herbs & Aromatics",
    produceIcon: "garlic",
    availability: [60, 60, 50, 40, 60, 80, 100, 100, 100, 90, 80, 70],
    peakMonthsText: "July - October",
    flavorProfile: "Pungent, Spicy, Warm Depth",
    preservationTip: "Cure heads in dry dark space for 6-month shelf life or ferment in raw honey.",
    priceDiscount: "40% Cheaper Fresh Bulbs",
    microNutrients: ["Allicin", "Selenium", "Sulphur Compounds"],
    foodGroup: "Herbs & Spices",
    caloriesPerUnit: 15,
    proteinPerUnit: 0.6,
  },
  {
    id: "spinach",
    name: "Baby & Savoy Spinach",
    category: "Vegetables & Greens",
    produceIcon: "spinach",
    availability: [80, 80, 100, 100, 80, 50, 40, 50, 80, 100, 100, 90],
    peakMonthsText: "March - May & Oct - Nov",
    flavorProfile: "Mild, Tender, Mineral-rich",
    preservationTip: "Blanch for 30 sec in boiling water, shock in ice water, and freeze balls.",
    priceDiscount: "35% Cheaper in Cool Weather",
    microNutrients: ["Non-Heme Iron", "Lutein", "Folate"],
    foodGroup: "Vegetables & Greens",
    caloriesPerUnit: 23,
    proteinPerUnit: 2.9,
  },
  {
    id: "broccoli",
    name: "Organic Tenderstem Broccoli",
    category: "Vegetables & Greens",
    produceIcon: "broccoli",
    availability: [70, 80, 90, 100, 90, 60, 40, 50, 80, 100, 100, 80],
    peakMonthsText: "March - April & Oct - Nov",
    flavorProfile: "Earthy, Slightly Sweet, Crunchy",
    preservationTip: "Chop into florets, steam for 2 minutes, freeze flat on baking sheet.",
    priceDiscount: "30% Cheaper in Spring & Autumn",
    microNutrients: ["Sulforaphane", "Vitamin C", "Glucosinolates"],
    foodGroup: "Vegetables & Greens",
    caloriesPerUnit: 34,
    proteinPerUnit: 2.8,
  },
  {
    id: "lemon",
    name: "Meyer & Eureka Lemons",
    category: "Fruits & Berries",
    produceIcon: "lemon",
    availability: [100, 100, 100, 80, 60, 50, 40, 40, 50, 70, 90, 100],
    peakMonthsText: "December - March",
    flavorProfile: "Zesty, Tangy, Bright Citrus",
    preservationTip: "Preserve whole lemons in coarse sea salt and juice for Moroccan tagines.",
    priceDiscount: "45% Cheaper Winter Citrus Harvest",
    microNutrients: ["Vitamin C", "Bioflavonoids", "Citric Acid"],
    foodGroup: "Fruits & Berries",
    caloriesPerUnit: 17,
    proteinPerUnit: 0.6,
  },
  {
    id: "berries",
    name: "Wild Blueberries & Blackberries",
    category: "Fruits & Berries",
    produceIcon: "berry",
    availability: [20, 20, 30, 50, 80, 100, 100, 100, 70, 40, 20, 20],
    peakMonthsText: "June - August",
    flavorProfile: "Sweet-Tart, Juicy, Antioxidant Deep",
    preservationTip: "Freeze unwashed berries on tray, transfer to airtight container.",
    priceDiscount: "50% - 60% Cheaper Local Harvest",
    microNutrients: ["Anthocyanins", "Polyphenols", "Vitamin C"],
    foodGroup: "Fruits & Berries",
    caloriesPerUnit: 57,
    proteinPerUnit: 0.7,
  },
  {
    id: "bellpepper",
    name: "Sweet Bell & Romano Peppers",
    category: "Vegetables & Greens",
    produceIcon: "bellpepper",
    availability: [20, 20, 30, 50, 80, 100, 100, 100, 90, 60, 30, 20],
    peakMonthsText: "July - September",
    flavorProfile: "Crisp, Juicy, Naturally Sweet",
    preservationTip: "Slice into strips, flash freeze, ideal for instant winter fajitas.",
    priceDiscount: "40% Cheaper Peak Harvest",
    microNutrients: ["Vitamin C", "Beta-Carotene", "Vitamin B6"],
    foodGroup: "Vegetables & Greens",
    caloriesPerUnit: 30,
    proteinPerUnit: 1.0,
  },
  {
    id: "squash",
    name: "Butternut & Kabocha Squash",
    category: "Roots & Squash",
    produceIcon: "pumpkin",
    availability: [60, 50, 40, 20, 20, 30, 50, 80, 100, 100, 100, 80],
    peakMonthsText: "September - November",
    flavorProfile: "Nutty, Caramelized Sweetness",
    preservationTip: "Store whole in dry cool cellar (10-15°C) for up to 6 months.",
    priceDiscount: "45% Cheaper Autumn Crop",
    microNutrients: ["Beta-Carotene", "Potassium", "Fiber"],
    foodGroup: "Roots & Tubers",
    caloriesPerUnit: 45,
    proteinPerUnit: 1.0,
  },
  {
    id: "carrot",
    name: "Rainbow & Heirloom Carrots",
    category: "Roots & Squash",
    produceIcon: "carrot",
    availability: [70, 70, 70, 80, 90, 100, 90, 80, 90, 100, 100, 80],
    peakMonthsText: "June & Oct - Nov",
    flavorProfile: "Earthy, Sweet, Crunchy Root",
    preservationTip: "Store buried in moist sand in cold cellar or pickle in apple cider vinegar.",
    priceDiscount: "30% Cheaper Fresh Dig",
    microNutrients: ["Pro-Vitamin A", "Lutein", "Biotin"],
    foodGroup: "Roots & Tubers",
    caloriesPerUnit: 41,
    proteinPerUnit: 0.9,
  },
  {
    id: "ginger",
    name: "Fresh Young Ginger Root",
    category: "Herbs & Aromatics",
    produceIcon: "ginger",
    availability: [60, 60, 60, 70, 80, 80, 70, 80, 90, 100, 90, 70],
    peakMonthsText: "September - November",
    flavorProfile: "Pungent, Warm Zest, Anti-inflammatory",
    preservationTip: "Peel and freeze whole root; grate directly while frozen into stir-fries.",
    priceDiscount: "25% Cheaper Autumn Dig",
    microNutrients: ["Gingerols", "Magnesium", "Potassium"],
    foodGroup: "Herbs & Spices",
    caloriesPerUnit: 80,
    proteinPerUnit: 1.8,
  },
  {
    id: "chickpeas",
    name: "Whole Dry Garbanzo & Lentils",
    category: "Legumes & Staples",
    produceIcon: "chickpeas",
    availability: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    peakMonthsText: "All Year Staple (Peak Harvest: Aug-Sep)",
    flavorProfile: "Nutty, Starchy, High-Protein",
    preservationTip: "Store in airtight glass jars with bay leaf to prevent moisture & pests.",
    priceDiscount: "Stable Low Bulk Cost Year-Round",
    microNutrients: ["Plant Protein", "Dietary Fiber", "Iron"],
    foodGroup: "Legumes & Pulses",
    caloriesPerUnit: 364,
    proteinPerUnit: 19.3,
  },
  {
    id: "mushrooms",
    name: "Wild Shiitake & Oyster Mushrooms",
    category: "Vegetables & Greens",
    produceIcon: "kimchi",
    availability: [60, 60, 70, 80, 70, 50, 40, 60, 90, 100, 100, 80],
    peakMonthsText: "September - November",
    flavorProfile: "Deep Savory Umami, Earthy",
    preservationTip: "Dehydrate slices at 45°C or sauté in olive oil and freeze.",
    priceDiscount: "40% Cheaper Autumn Forage",
    microNutrients: ["Ergothioneine", "Vitamin D", "Beta-Glucans"],
    foodGroup: "Vegetables & Greens",
    caloriesPerUnit: 22,
    proteinPerUnit: 3.1,
  },
];

export const SeasonalHarvestMap: React.FC<SeasonalHarvestMapProps> = ({
  pantryItems,
  onAddIngredientToPantry,
  onNavigateToPantry,
}) => {
  const currentMonthIdx = new Date().getMonth(); // 0 to 11
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduce, setSelectedProduce] = useState<HarvestProduce | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  // Filtered Produce List
  const filteredProduce = useMemo(() => {
    return HARVEST_DATABASE.filter((item) => {
      const matchCat = selectedCategory === "All" || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.flavorProfile.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.foodGroup.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Overall Monthly Abundance Chart Data for Recharts
  const monthlyAbundanceData = useMemo(() => {
    return MONTHS.map((m, idx) => {
      const avgScore = Math.round(
        HARVEST_DATABASE.reduce((sum, item) => sum + item.availability[idx], 0) /
          HARVEST_DATABASE.length
      );
      return {
        month: m.short,
        fullMonth: m.name,
        abundance: avgScore,
        isCurrent: idx === currentMonthIdx,
        isSelected: idx === selectedMonth,
      };
    });
  }, [selectedMonth, currentMonthIdx]);

  // User's Pantry Seasonal Breakdown Analysis
  const pantrySeasonalAnalysis = useMemo(() => {
    let peakCount = 0;
    let moderateCount = 0;
    let offSeasonCount = 0;
    const matchedItems: { name: string; score: number; status: string }[] = [];

    pantryItems.forEach((pItem) => {
      const match = HARVEST_DATABASE.find(
        (h) =>
          h.name.toLowerCase().includes(pItem.name.toLowerCase()) ||
          pItem.name.toLowerCase().includes(h.name.toLowerCase()) ||
          h.id === pItem.name.toLowerCase()
      );

      if (match) {
        const score = match.availability[selectedMonth];
        let status = "Moderate";
        if (score >= 80) {
          status = "Peak Harvest";
          peakCount++;
        } else if (score >= 50) {
          status = "Moderate";
          moderateCount++;
        } else {
          status = "Off-Season";
          offSeasonCount++;
        }
        matchedItems.push({ name: pItem.name, score, status });
      }
    });

    return {
      peakCount,
      moderateCount,
      offSeasonCount,
      matchedItems,
      totalMatched: matchedItems.length,
    };
  }, [pantryItems, selectedMonth]);

  const pieChartData = [
    { name: "Peak Season 🌟", value: pantrySeasonalAnalysis.peakCount, color: "#15803D" },
    { name: "Moderate 🌤️", value: pantrySeasonalAnalysis.moderateCount, color: "#D97706" },
    { name: "Off-Season ❄️", value: pantrySeasonalAnalysis.offSeasonCount, color: "#9CA3AF" },
  ].filter((d) => d.value > 0);

  const handleQuickAdd = (produce: HarvestProduce) => {
    onAddIngredientToPantry({
      name: produce.name,
      nutrientCategory: produce.category === "Legumes & Staples" ? "Protein" : "Vitamins",
      foodGroup: produce.foodGroup,
      quantity: 500,
      unit: "g",
      threshold: 150,
      caloriesPerUnit: produce.caloriesPerUnit,
      proteinPerUnit: produce.proteinPerUnit,
      carbsPerUnit: 12,
      fatsPerUnit: 1,
      fiberPerUnit: 4,
      keyMicroNutrients: produce.microNutrients,
      healthNotes: `Harvested in peak season (${produce.peakMonthsText}). ${produce.preservationTip}`,
      lastUpdated: new Date().toISOString(),
    });

    setAddedItems((prev) => new Set(prev).add(produce.id));
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Banner */}
      <AestheticProduceArt variant="spring" />

      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-800" /> Organic Seasonal Harvest Map
              </span>
              <span className="text-xs text-stone-600 font-semibold">
                Interactive Farm Cycle & Market Price Intelligence
              </span>
            </div>
            <h1 className="text-3xl font-serif-italic text-stone-900 mt-2 tracking-tight font-bold">
              Pantry Harvest Cycles & Seasonal Shopping Map
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl font-medium">
              Shopping in tune with natural farm harvest cycles ensures maximum nutrient density, vibrant natural flavor, and up to <strong>60% market savings</strong>. Cross-reference your pantry stock below to see what's in peak harvest this month.
            </p>
          </div>

          {/* Current Month Active Badge */}
          <div className="bg-emerald-900 text-white p-4 rounded-2xl border border-emerald-800 flex items-center gap-3.5 shadow-md">
            <div className="p-3 bg-white/10 rounded-xl text-amber-300">
              <Sun className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider block">
                Selected Harvest Season
              </span>
              <span className="text-lg font-bold text-white">
                {MONTHS[selectedMonth].name} ({MONTHS[selectedMonth].season})
              </span>
            </div>
          </div>
        </div>

        {/* 12-Month Selector Bar */}
        <div className="mt-6 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-800" /> Select Month to View Seasonal Availability:
            </span>

            {selectedMonth !== currentMonthIdx && (
              <button
                onClick={() => setSelectedMonth(currentMonthIdx)}
                className="text-[11px] font-bold text-emerald-800 hover:underline bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200"
              >
                Reset to Current Month ({MONTHS[currentMonthIdx].short})
              </button>
            )}
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {MONTHS.map((m, idx) => {
              const isSelected = idx === selectedMonth;
              const isCurrent = idx === currentMonthIdx;
              const MonthIcon = m.icon;
              return (
                <button
                  key={m.short}
                  onClick={() => setSelectedMonth(idx)}
                  className={`py-2 px-1 rounded-2xl text-center text-xs font-bold transition flex flex-col items-center gap-1 min-h-[50px] ${
                    isSelected
                      ? "bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/50"
                      : isCurrent
                      ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold"
                      : "bg-stone-50 hover:bg-emerald-50 text-stone-700 border border-stone-200"
                  }`}
                >
                  <MonthIcon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-200" : "text-stone-500"}`} />
                  <span>{m.short}</span>
                  {isCurrent && (
                    <span className="text-[8px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-black">
                      NOW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Recharts Visualizer: Regional Harvest Abundance Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-800" />
                <span>Annual Organic Abundance Curve (12-Month Trend)</span>
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Peak fresh harvest density reaches maximum abundance between June and October.
              </p>
            </div>

            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              Temperate Climate Zone
            </span>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAbundanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: "#444" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#777" }} domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-white p-2.5 rounded-xl text-xs font-medium shadow-xl">
                          <p className="font-bold text-amber-300">{data.fullMonth}</p>
                          <p>Abundance Rating: <strong className="text-emerald-400">{data.abundance}%</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="abundance" radius={[6, 6, 0, 0]}>
                  {monthlyAbundanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.isSelected
                          ? "#065F46" // Emerald-800
                          : entry.isCurrent
                          ? "#F59E0B" // Amber-500
                          : "#10B981" // Emerald-500
                      }
                      opacity={entry.isSelected ? 1 : 0.65}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pantry Seasonal Stock Alignment Widget */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-2 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-800" />
                <span>Pantry Stock vs {MONTHS[selectedMonth].short} Harvest</span>
              </h3>
              <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                {pantrySeasonalAnalysis.totalMatched} items matched in database
              </p>
            </div>

            <div className="my-4 flex items-center justify-around">
              {pieChartData.length > 0 ? (
                <div className="w-28 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={45}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic py-6">Add produce to pantry to analyze alignment</p>
              )}

              <div className="space-y-1.5 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                  <span>{pantrySeasonalAnalysis.peakCount} Peak Season</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>{pantrySeasonalAnalysis.moderateCount} Moderate</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
                  <span>{pantrySeasonalAnalysis.offSeasonCount} Off-Season</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToPantry}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>View Full Pantry Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Harvest Heatmap Matrix & Produce Explorer */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-5">
        {/* Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-serif-italic text-stone-900 font-bold flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-800" />
              <span>{MONTHS[selectedMonth].name} Produce Availability Matrix</span>
            </h2>
            <p className="text-xs text-stone-600 font-medium mt-0.5">
              Click on any produce card to inspect farm flavor profile, storage tips, and instant pantry restock options.
            </p>
          </div>

          {/* Search & Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search produce or nutrient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-full pl-9 pr-4 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:border-emerald-600 min-h-[38px] w-48 sm:w-60"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center bg-stone-100 p-1 rounded-full border border-stone-200 text-[11px] font-bold overflow-x-auto no-scrollbar">
              {["All", "Vegetables & Greens", "Herbs & Aromatics", "Fruits & Berries", "Roots & Squash", "Legumes & Staples"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                      selectedCategory === cat
                        ? "bg-emerald-800 text-white shadow-2xs"
                        : "text-stone-700 hover:text-stone-900"
                    }`}
                  >
                    {cat.split(" ")[0]}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Produce Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProduce.map((produce) => {
            const currentScore = produce.availability[selectedMonth];
            const isPeak = currentScore >= 80;
            const isModerate = currentScore >= 50 && currentScore < 80;
            const isAdded = addedItems.has(produce.id);

            return (
              <div
                key={produce.id}
                onClick={() => setSelectedProduce(produce)}
                className={`relative bg-stone-50 hover:bg-white rounded-3xl p-5 border transition-all duration-300 hover:shadow-lg cursor-pointer group flex flex-col justify-between ${
                  isPeak
                    ? "border-emerald-300/80 hover:border-emerald-600"
                    : isModerate
                    ? "border-amber-200 hover:border-amber-400"
                    : "border-stone-200 hover:border-stone-400"
                }`}
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <ProduceIcon name={produce.produceIcon} size="md" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm leading-tight group-hover:text-emerald-900 transition">
                          {produce.name}
                        </h4>
                        <span className="text-[10px] text-stone-500 font-medium">
                          {produce.foodGroup}
                        </span>
                      </div>
                    </div>

                    {isPeak ? (
                      <span className="text-[9px] uppercase font-extrabold bg-emerald-700 text-white px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3 text-amber-300" /> Peak Harvest
                      </span>
                    ) : isModerate ? (
                      <span className="text-[9px] uppercase font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full shrink-0">
                        Moderate
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full shrink-0">
                        Off-Season
                      </span>
                    )}
                  </div>

                  {/* Monthly Mini Bar Heatmap */}
                  <div className="space-y-1 my-3 bg-white p-2.5 rounded-2xl border border-stone-200/80">
                    <div className="flex justify-between text-[10px] font-semibold text-stone-600">
                      <span>Peak Season: {produce.peakMonthsText}</span>
                      <span className="font-bold text-emerald-800">{currentScore}%</span>
                    </div>

                    <div className="grid grid-cols-12 gap-0.5 h-2 bg-stone-100 rounded-full overflow-hidden">
                      {produce.availability.map((score, mIdx) => (
                        <div
                          key={mIdx}
                          title={`${MONTHS[mIdx].name}: ${score}%`}
                          className={`h-full ${
                            mIdx === selectedMonth ? "ring-1 ring-stone-900 z-10 scale-y-125" : ""
                          }`}
                          style={{
                            backgroundColor:
                              score >= 80 ? "#15803D" : score >= 50 ? "#F59E0B" : "#E5E7EB",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Key Flavor & Price Discount */}
                  <p className="text-[11px] text-stone-600 font-medium line-clamp-2 italic">
                    "{produce.flavorProfile}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    🏷️ {produce.priceDiscount}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAdd(produce);
                    }}
                    disabled={isAdded}
                    className="p-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full transition shadow-2xs disabled:bg-stone-300 min-w-[34px] min-h-[34px] flex items-center justify-center"
                    title="Add to Pantry Stock"
                  >
                    {isAdded ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Produce Inspection Modal */}
      {selectedProduce && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-emerald-900/20 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProduce(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 p-2 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300 flex items-center justify-center shadow-xs">
                <ProduceIcon name={selectedProduce.produceIcon} size="lg" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {selectedProduce.category}
                </span>
                <h3 className="text-xl font-serif-italic font-bold text-stone-900 mt-1">
                  {selectedProduce.name}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Peak Harvest Window: <strong>{selectedProduce.peakMonthsText}</strong>
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Flavor Profile & Culinary Notes</span>
                <p className="text-stone-900 font-medium italic mt-0.5">"{selectedProduce.flavorProfile}"</p>
              </div>

              <div className="pt-2 border-t border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Preservation & Curing Method</span>
                <p className="text-stone-900 font-medium mt-0.5">{selectedProduce.preservationTip}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span>Harvest Price Index:</span>
              </div>
              <span className="font-bold text-emerald-950 bg-white px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                {selectedProduce.priceDiscount}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Rich Micro-Nutrient Boosts:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProduce.microNutrients.map((nut, idx) => (
                  <span key={idx} className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
                    🌱 {nut}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
              <button
                onClick={() => {
                  handleQuickAdd(selectedProduce);
                  setSelectedProduce(null);
                }}
                className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-bold shadow-md transition flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add {selectedProduce.name} to Pantry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
