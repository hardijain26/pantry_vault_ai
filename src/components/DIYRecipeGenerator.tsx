import React, { useState } from "react";
import { apiPost } from "../lib/api";
import { PantryItem, UserProfile, DIYRecipe, CommunityPost } from "../types";
import {
  ChefHat,
  Sparkles,
  CheckSquare,
  Square,
  Clock,
  Flame,
  Users,
  Heart,
  Share2,
  Send,
  BookOpen,
  Check,
  Zap,
} from "lucide-react";
import { AestheticProduceArt, ProduceIcon } from "./ProduceIcons";

interface DIYRecipeGeneratorProps {
  pantryItems: PantryItem[];
  userProfile: UserProfile;
}

export const DIYRecipeGenerator: React.FC<DIYRecipeGeneratorProps> = ({
  pantryItems,
  userProfile,
}) => {
  const [selectedIngredientNames, setSelectedIngredientNames] = useState<string[]>(
    pantryItems.slice(0, 6).map((i) => i.name)
  );
  const [mealType, setMealType] = useState<string>("Dinner");
  const [customNote, setCustomNote] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<DIYRecipe[]>([]);

  const toggleIngredient = (name: string) => {
    setSelectedIngredientNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const selectAllInStock = () => {
    setSelectedIngredientNames(pantryItems.filter((i) => i.quantity > 0).map((i) => i.name));
  };

  const clearSelection = () => {
    setSelectedIngredientNames([]);
  };

  const handleGenerate = async () => {
    if (selectedIngredientNames.length === 0) return;

    setIsGenerating(true);
    setGeneratedRecipes([]);

    try {
      const data = await apiPost<{ recipes: any[] }>("/api/recipes/diy-generate", {
        selectedIngredients: selectedIngredientNames,
        dietaryPreference: userProfile.dietaryPreference,
        mealType,
        customNote,
      });
      if (data.recipes && Array.isArray(data.recipes)) {
        const formatted: DIYRecipe[] = data.recipes.map((r: any, idx: number) => ({
          id: "diy_" + Date.now() + "_" + idx,
          title: r.title || "Custom Vegetarian Recipe",
          tagline: r.tagline || "Fresh pantry creation",
          dietCategory: r.dietCategory || userProfile.dietaryPreference,
          prepTime: r.prepTime || "15 mins",
          cookTime: r.cookTime || "15 mins",
          servings: r.servings || 2,
          difficulty: r.difficulty || "Easy",
          ingredients: r.ingredients || selectedIngredientNames,
          instructions: r.instructions || [],
          chefTips: r.chefTips,
          nutrition: r.nutrition || { calories: 300, protein: 12, carbs: 40, fats: 8, fiber: 7 },
          whatsappShareText: r.whatsappShareText,
          createdAt: new Date().toISOString(),
        }));
        setGeneratedRecipes(formatted);
      }
    } catch (err) {
      console.error("Failed to generate DIY recipe:", err);
      alert((err as Error).message || "Couldn't generate recipes. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Aesthetic Produce Recipe Banner */}
      <AestheticProduceArt variant="recipes" />

      {/* Top Banner */}
      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5A5A40] bg-[#E8D8C3]/50 px-3 py-1 rounded-full border border-[#5A5A40]/15 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-[#B45309]" /> DIY Recipe Engine
              </span>
              <span className="text-xs text-[#5A5A40]/60 font-medium">
                Vegetarian Ingredient Matcher
              </span>
            </div>
            <h1 className="text-3xl font-serif-italic text-[#2D2D2D] mt-2 tracking-tight">
              Zero-Waste Pantry DIY Recipe Generator
            </h1>
            <p className="text-xs text-[#5A5A40]/70 mt-1 max-w-2xl">
              Checkmark ingredients currently sitting in your pantry. Gemini AI will craft gourmet, gut-friendly vegetarian recipes that fit your food habit ({userProfile.dietaryPreference}).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ingredient Picker & Preferences */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#5A5A40]/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#5A5A40]/10">
              <h2 className="text-base font-serif-italic text-[#5A5A40] flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#5A5A40]" />
                <span>Select Available Pantry Items ({selectedIngredientNames.length})</span>
              </h2>

              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <button
                  onClick={selectAllInStock}
                  className="text-[#5A5A40] hover:underline"
                >
                  Select All
                </button>
                <span className="text-[#5A5A40]/30">|</span>
                <button
                  onClick={clearSelection}
                  className="text-[#5A5A40]/60 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Checklist items */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {pantryItems.map((item) => {
                const isSelected = selectedIngredientNames.includes(item.name);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleIngredient(item.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs transition ${
                      isSelected
                        ? "bg-[#E8D8C3]/50 border-[#5A5A40]/30 text-[#2D2D2D]"
                        : "bg-[#F9F8F4] border-[#5A5A40]/10 text-[#5A5A40]/80 hover:text-[#2D2D2D]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#5A5A40] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-[#5A5A40]/40 shrink-0" />
                      )}
                      <span className="font-semibold">{item.name}</span>
                    </div>

                    <span className="text-[9px] font-bold bg-white px-2.5 py-0.5 rounded-full text-[#5A5A40] border border-[#5A5A40]/10">
                      {item.nutrientCategory}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Meal Type & Options */}
            <div className="pt-3 border-t border-[#5A5A40]/10 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#5A5A40] mb-1">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#5A5A40]/20 rounded-full px-4 py-2.5 text-xs text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                >
                  <option value="Dinner">Dinner Main Course</option>
                  <option value="Lunch">Healthy Lunch Bowl</option>
                  <option value="Breakfast">Probiotic / Energizing Breakfast</option>
                  <option value="High-Protein Snack">High-Protein Power Snack</option>
                  <option value="Gut Cleansing Soup">Gut-Cleansing Healing Soup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] mb-1">Special Cooking Preferences</label>
                <input
                  type="text"
                  placeholder="E.g., Under 15 mins, Air fryer, Jain (no root veggies), Spicy..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#5A5A40]/20 rounded-full px-4 py-2.5 text-xs text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || selectedIngredientNames.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white rounded-full text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Crafting Recipes...</span>
                  </>
                ) : (
                  <>
                    <ChefHat className="w-4 h-4" />
                    <span>Generate DIY Recipes ({selectedIngredientNames.length} items)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Generated DIY Recipes Output */}
        <div className="lg:col-span-7 space-y-6">
          {generatedRecipes.length === 0 && !isGenerating && (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#5A5A40]/10 p-8 shadow-xs">
              <ChefHat className="w-10 h-10 text-[#5A5A40]/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#2D2D2D]">No DIY recipes generated yet</h3>
              <p className="text-xs text-[#5A5A40]/70 mt-1 max-w-md mx-auto">
                Checkmark ingredients from your pantry on the left and click "Generate DIY Recipes" to create custom vegetarian meals.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#5A5A40]/20 p-8 space-y-3 shadow-xs">
              <Sparkles className="w-8 h-8 text-[#5A5A40] animate-spin mx-auto" />
              <h3 className="text-lg font-serif-italic text-[#2D2D2D]">
                Formulating Gourmet Vegetarian Recipes...
              </h3>
              <p className="text-xs text-[#5A5A40]/70">
                Analyzing synergistic ingredient flavor pairings and calculating micro/macro balances.
              </p>
            </div>
          )}

          {generatedRecipes.map((recipe) => {
            const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
              recipe.whatsappShareText || `🌱 *${recipe.title}*\n\n${recipe.tagline}\n\nCheck out this recipe generated with VegPantry!`
            )}`;

            return (
              <div
                key={recipe.id}
                className="bg-white rounded-3xl p-6 border border-[#5A5A40]/10 shadow-xs space-y-4"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#5A5A40]/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-[#E8D8C3] text-[#5A5A40] px-3 py-0.5 rounded-full uppercase">
                        {recipe.dietCategory}
                      </span>
                      <span className="text-[10px] text-[#5A5A40]/60 font-medium">
                        {recipe.difficulty} Difficulty
                      </span>
                    </div>
                    <h2 className="text-xl font-serif-italic text-[#2D2D2D] mt-1">
                      {recipe.title}
                    </h2>
                    {recipe.tagline && (
                      <p className="text-xs text-[#5A5A40] italic mt-0.5">{recipe.tagline}</p>
                    )}
                  </div>

                </div>

                {/* Timing & Servings info */}
                <div className="flex items-center gap-4 text-xs text-[#5A5A40] bg-[#F9F8F4] p-3 rounded-2xl border border-[#5A5A40]/10 font-medium">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#5A5A40]" /> Prep: {recipe.prepTime}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#B45309]" /> Cook: {recipe.cookTime}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#5A5A40]" /> Servings: {recipe.servings}</span>
                </div>


                {/* Ingredients List */}
                <div>
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-2">
                    Required Pantry Ingredients
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recipe.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#2D2D2D] bg-[#F9F8F4] px-3 py-2 rounded-xl border border-[#5A5A40]/10">
                        <Check className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
                        <span>{ing}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div>
                  <h3 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-2">
                    Step-by-Step Method
                  </h3>
                  <ol className="space-y-2 text-xs text-[#2D2D2D]">
                    {recipe.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 bg-[#F9F8F4] p-3 rounded-2xl border border-[#5A5A40]/10">
                        <span className="w-5 h-5 rounded-full bg-[#5A5A40] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Chef Tips */}
                {recipe.chefTips && (
                  <div className="text-xs text-[#B45309] bg-[#F27D26]/10 p-3.5 rounded-2xl border border-[#F27D26]/30">
                    <strong>👨‍🍳 Chef's Secret Tip:</strong> {recipe.chefTips}
                  </div>
                )}

                {/* Nutrition Breakdown Bar */}
                <div className="grid grid-cols-5 gap-2 text-center bg-[#F9F8F4] p-3.5 rounded-2xl border border-[#5A5A40]/10 text-xs">
                  <div>
                    <span className="block text-[10px] text-[#5A5A40]/60">Calories</span>
                    <span className="font-bold text-[#2D2D2D]">{recipe.nutrition.calories}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A5A40]/60">Protein</span>
                    <span className="font-bold text-[#5A5A40]">{recipe.nutrition.protein}g</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A5A40]/60">Carbs</span>
                    <span className="font-bold text-[#B45309]">{recipe.nutrition.carbs}g</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A5A40]/60">Fats</span>
                    <span className="font-bold text-[#78350F]">{recipe.nutrition.fats}g</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A5A40]/60">Fiber</span>
                    <span className="font-bold text-[#5A5A40]">{recipe.nutrition.fiber}g</span>
                  </div>
                </div>

                {/* Share Actions */}
                <div className="pt-3 border-t border-[#5A5A40]/10 flex flex-wrap items-center justify-between gap-3">

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-[#E8D8C3]/40 hover:bg-[#E8D8C3] text-[#5A5A40] rounded-full text-xs font-semibold border border-[#5A5A40]/15 transition"
                  >
                    <Send className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Share via WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
