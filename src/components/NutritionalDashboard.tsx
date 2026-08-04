import React from "react";
import { PantryItem, UserProfile } from "../types";
import {
  Activity,
  Heart,
  Zap,
  Sparkles,
  Apple,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Bell,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { AestheticProduceArt, ProduceIcon } from "./ProduceIcons";

interface NutritionalDashboardProps {
  items: PantryItem[];
  userProfile: UserProfile;
  onNavigateToPantry: () => void;
  onSetStockReminder?: (itemName: string) => void;
}

export const NutritionalDashboard: React.FC<NutritionalDashboardProps> = ({
  items,
  userProfile,
  onNavigateToPantry,
  onSetStockReminder,
}) => {
  // Aggregate Nutritional Metrics
  const totalItemsCount = items.length;
  const totalCalories = items.reduce((sum, item) => sum + (item.caloriesPerUnit * (item.quantity / 100)), 0);
  const totalProtein = items.reduce((sum, item) => sum + (item.proteinPerUnit * (item.quantity / 100)), 0);
  const totalCarbs = items.reduce((sum, item) => sum + (item.carbsPerUnit * (item.quantity / 100)), 0);
  const totalFats = items.reduce((sum, item) => sum + (item.fatsPerUnit * (item.quantity / 100)), 0);
  const totalFiber = items.reduce((sum, item) => sum + (item.fiberPerUnit * (item.quantity / 100)), 0);

  // Probiotic / Gut Health Stock
  const gutItems = items.filter(
    (i) => i.nutrientCategory === "Gut Health" || i.nutrientCategory === "Probiotics" || i.foodGroup === "Fermented & Gut Care"
  );
  const gutDensityPercentage = totalItemsCount > 0 ? Math.round((gutItems.length / totalItemsCount) * 100) : 0;

  // Daily target estimation
  const dailyCalorieGoal = userProfile.dailyCalorieGoal || 2000;
  const estimatedDaysOfStock = Math.max(0, Math.round((totalCalories / dailyCalorieGoal) * 10) / 10);

  // Category Distribution for Charts
  const categoryCounts: Record<string, number> = {};
  items.forEach((item) => {
    categoryCounts[item.nutrientCategory] = (categoryCounts[item.nutrientCategory] || 0) + 1;
  });

  const categoryChartData = Object.keys(categoryCounts).map((cat) => ({
    name: cat,
    count: categoryCounts[cat],
  }));

  // Macro Pie Chart Data
  const macroChartData = [
    { name: "Protein (g)", value: Math.round(totalProtein), color: "#5A5A40" },
    { name: "Carbs (g)", value: Math.round(totalCarbs), color: "#B45309" },
    { name: "Fats (g)", value: Math.round(totalFats), color: "#78350F" },
    { name: "Fiber (g)", value: Math.round(totalFiber), color: "#15803D" },
  ];

  // Micro-Nutrients Frequency Map
  const microNutrientMap: Record<string, number> = {};
  items.forEach((item) => {
    item.keyMicroNutrients.forEach((m) => {
      const trimmed = m.trim();
      if (trimmed) {
        microNutrientMap[trimmed] = (microNutrientMap[trimmed] || 0) + 1;
      }
    });
  });

  const topMicroNutrients = Object.entries(microNutrientMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Low stock items
  const lowStockItems = items.filter((i) => i.quantity <= i.threshold);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Aesthetic Ferments & Produce Hero Banner */}
      <AestheticProduceArt variant="ferments" />

      {/* Top Header Banner */}
      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5A5A40] bg-[#E8D8C3]/50 px-3 py-1 rounded-full border border-[#5A5A40]/15 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#B45309]" /> Pantry Nutritional Intelligence
              </span>
              <span className="text-xs text-[#5A5A40]/60 font-medium">
                Target Profile: {userProfile.dietaryPreference}
              </span>
            </div>
            <h1 className="text-3xl font-serif-italic text-[#2D2D2D] mt-2 tracking-tight">
              Nutritional Dashboard & Gut-Health Vault
            </h1>
            <p className="text-xs text-[#5A5A40]/70 mt-1 max-w-2xl">
              Real-time aggregation of macronutrients, gut-probiotic density, micro-nutrient diversity, and estimated daily meal endurance based on your dietary habit.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#F9F8F4] p-3.5 rounded-2xl border border-[#5A5A40]/15 shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#E8D8C3] text-[#5A5A40] flex items-center justify-center font-bold text-sm shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5A5A40]/60 block">Est. Pantry Meal Endurance</span>
              <span className="text-lg font-bold text-[#2D2D2D] font-mono">
                ~{estimatedDaysOfStock} Days <span className="text-xs text-[#5A5A40] font-sans font-normal">of stock</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Calories */}
        <div className="bg-white rounded-3xl p-5 border border-[#5A5A40]/10 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#5A5A40]">
            <span className="text-xs font-bold uppercase tracking-wider">Est. Calories</span>
            <Zap className="w-4 h-4 text-[#B45309]" />
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-[#2D2D2D]">
              {Math.round(totalCalories).toLocaleString()}
            </span>
            <span className="text-[10px] text-[#5A5A40]/60 block mt-0.5">kcal total stock</span>
          </div>
          <div className="h-1 bg-[#E8D8C3]/50 rounded-full overflow-hidden">
            <div className="h-full bg-[#B45309]" style={{ width: "75%" }} />
          </div>
        </div>

        {/* Total Protein */}
        <div className="bg-white rounded-3xl p-5 border border-[#5A5A40]/10 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#5A5A40]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Protein</span>
            <TrendingUp className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-[#2D2D2D]">
              {Math.round(totalProtein)} <span className="text-xs font-sans font-normal text-[#5A5A40]">g</span>
            </span>
            <span className="text-[10px] text-[#5A5A40]/60 block mt-0.5">Plant-based amino sources</span>
          </div>
          <div className="h-1 bg-[#E8D8C3]/50 rounded-full overflow-hidden">
            <div className="h-full bg-[#5A5A40]" style={{ width: "65%" }} />
          </div>
        </div>

        {/* Total Fiber */}
        <div className="bg-white rounded-3xl p-5 border border-[#5A5A40]/10 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#5A5A40]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Fiber</span>
            <Apple className="w-4 h-4 text-[#15803D]" />
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-[#2D2D2D]">
              {Math.round(totalFiber)} <span className="text-xs font-sans font-normal text-[#5A5A40]">g</span>
            </span>
            <span className="text-[10px] text-[#5A5A40]/60 block mt-0.5">Microbiome prebiotic fuel</span>
          </div>
          <div className="h-1 bg-[#E8D8C3]/50 rounded-full overflow-hidden">
            <div className="h-full bg-[#15803D]" style={{ width: "80%" }} />
          </div>
        </div>

        {/* Gut Health Density */}
        <div className="bg-white rounded-3xl p-5 border border-[#5A5A40]/10 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#5A5A40]">
            <span className="text-xs font-bold uppercase tracking-wider">Gut Probiotics</span>
            <Heart className="w-4 h-4 text-[#F27D26]" />
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-[#2D2D2D]">
              {gutDensityPercentage}%
            </span>
            <span className="text-[10px] text-[#5A5A40]/60 block mt-0.5">{gutItems.length} fermented/gut items</span>
          </div>
          <div className="h-1 bg-[#E8D8C3]/50 rounded-full overflow-hidden">
            <div className="h-full bg-[#F27D26]" style={{ width: `${Math.min(100, gutDensityPercentage * 2)}%` }} />
          </div>
        </div>

        {/* Cataloged Items */}
        <div className="bg-white rounded-3xl p-5 border border-[#5A5A40]/10 shadow-xs flex flex-col justify-between space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[#5A5A40]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Stock</span>
            <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-[#2D2D2D]">
              {totalItemsCount} <span className="text-xs font-sans font-normal text-[#5A5A40]">items</span>
            </span>
            <span className="text-[10px] text-[#5A5A40]/60 block mt-0.5">{lowStockItems.length} items low in stock</span>
          </div>
          <div className="h-1 bg-[#E8D8C3]/50 rounded-full overflow-hidden">
            <div className="h-full bg-[#5A5A40]" style={{ width: "90%" }} />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Macro Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#5A5A40]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#5A5A40]/10">
            <div>
              <h2 className="text-xl font-serif-italic text-[#2D2D2D]">Macronutrient Breakdown</h2>
              <p className="text-xs text-[#5A5A40]/60">Proportions of Protein, Carbs, Fats, and Fiber in current stock</p>
            </div>
            <span className="text-[10px] font-bold bg-[#E8D8C3]/50 text-[#5A5A40] px-3 py-1 rounded-full border border-[#5A5A40]/15">
              Macros (g)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} grams`, "Amount"]}
                  contentStyle={{ backgroundColor: "#F9F8F4", borderRadius: "16px", border: "1px solid rgba(90,90,64,0.2)", fontSize: "12px" }}
                />
                <Legend formatter={(value) => <span className="text-xs text-[#5A5A40] font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center bg-[#F9F8F4] p-3 rounded-2xl border border-[#5A5A40]/10 text-xs">
            <div>
              <span className="block text-[10px] text-[#5A5A40]/60">Protein</span>
              <span className="font-bold text-[#5A5A40]">{Math.round(totalProtein)}g</span>
            </div>
            <div>
              <span className="block text-[10px] text-[#5A5A40]/60">Carbs</span>
              <span className="font-bold text-[#B45309]">{Math.round(totalCarbs)}g</span>
            </div>
            <div>
              <span className="block text-[10px] text-[#5A5A40]/60">Fats</span>
              <span className="font-bold text-[#78350F]">{Math.round(totalFats)}g</span>
            </div>
            <div>
              <span className="block text-[10px] text-[#5A5A40]/60">Fiber</span>
              <span className="font-bold text-[#15803D]">{Math.round(totalFiber)}g</span>
            </div>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#5A5A40]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#5A5A40]/10">
            <div>
              <h2 className="text-xl font-serif-italic text-[#2D2D2D]">Nutrient Category Count</h2>
              <p className="text-xs text-[#5A5A40]/60">Distribution of stock items per health classification</p>
            </div>
            <button
              onClick={onNavigateToPantry}
              className="text-xs text-[#5A5A40] font-semibold hover:underline"
            >
              View All Items →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#5A5A40" }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: "#5A5A40" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#F9F8F4", borderRadius: "16px", border: "1px solid rgba(90,90,64,0.2)", fontSize: "12px" }}
                />
                <Bar dataKey="count" fill="#5A5A40" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-[#5A5A40]/70 italic bg-[#F9F8F4] p-3 rounded-2xl border border-[#5A5A40]/10">
            💡 <strong>Nutritional Tip:</strong> Aim for a balanced distribution across <strong>Gut Health</strong>, <strong>Protein</strong>, and <strong>Carbohydrates</strong> to maintain digestive gut flora stability.
          </p>
        </div>
      </div>

      {/* Micro-Nutrients Matrix & Smart Health Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Micro-Nutrient Diversity Badges */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#5A5A40]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#5A5A40]/10">
            <h2 className="text-xl font-serif-italic text-[#2D2D2D] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#B45309]" />
              <span>Micro-Nutrient Diversity Vault</span>
            </h2>
            <span className="text-[10px] text-[#5A5A40]/60 font-semibold uppercase">Key Minerals & Vitamins</span>
          </div>

          <p className="text-xs text-[#5A5A40]/80">
            These essential micro-nutrients are present in your current inventory items. Diverse micro-nutrients support immune response and gut barrier integrity.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {topMicroNutrients.map(([nutrient, count]) => (
              <div
                key={nutrient}
                className="flex items-center gap-2 bg-[#F9F8F4] border border-[#5A5A40]/15 px-3.5 py-2 rounded-2xl text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
                <span className="font-bold text-[#2D2D2D]">{nutrient}</span>
                <span className="text-[10px] font-bold bg-[#E8D8C3] text-[#5A5A40] px-2 py-0.5 rounded-full">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </div>
            ))}
          </div>

          {topMicroNutrients.length === 0 && (
            <p className="text-xs text-[#5A5A40]/60 italic">No micro-nutrients cataloged yet. Add items with detailed micro-nutrient info!</p>
          )}
        </div>

        {/* Low Stock Restock Reminder Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#5A5A40]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#5A5A40]/10">
            <h2 className="text-xl font-serif-italic text-[#2D2D2D] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#F27D26]" />
              <span>Restock Reminders ({lowStockItems.length})</span>
            </h2>
            <span className="text-[10px] text-[#F27D26] bg-[#F27D26]/10 px-2.5 py-0.5 rounded-full font-bold border border-[#F27D26]/20">
              Low Stock Action Needed
            </span>
          </div>

          <p className="text-xs text-[#5A5A40]/80">
            Since we don't deliver products directly, set instant stock reminders or Restock Checklists so you remember to stock up on your next grocery trip!
          </p>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-[#F9F8F4] p-3 rounded-2xl border border-[#5A5A40]/15 text-xs"
              >
                <div>
                  <span className="font-bold text-[#2D2D2D] block">{item.name}</span>
                  <span className="text-[10px] text-[#F27D26] font-semibold">
                    Current: {item.quantity} {item.unit} (Limit: {item.threshold} {item.unit})
                  </span>
                </div>

                {onSetStockReminder && (
                  <button
                    onClick={() => onSetStockReminder(item.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white rounded-full text-[11px] font-semibold transition shadow-xs"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Remind Me</span>
                  </button>
                )}
              </div>
            ))}

            {lowStockItems.length === 0 && (
              <div className="text-center py-6 text-xs text-[#5A5A40]/70 bg-[#F9F8F4] rounded-2xl border border-[#5A5A40]/10">
                🎉 All items in your pantry are currently above minimum stock thresholds!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
