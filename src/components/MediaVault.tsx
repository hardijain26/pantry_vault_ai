import React, { useState } from "react";
import { MediaItem, UserProfile } from "../types";
import {
  Youtube,
  Globe,
  Sparkles,
  Heart,
  AlertTriangle,
  Flame,
  Clock,
  Users,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MediaVaultProps {
  savedVault: MediaItem[];
  userProfile: UserProfile;
  onSaveMedia: (media: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
}

export const MediaVault: React.FC<MediaVaultProps> = ({
  savedVault,
  userProfile,
  onSaveMedia,
  onDeleteMedia,
}) => {
  const [inputUrl, setInputUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedItem, setAnalyzedItem] = useState<MediaItem | null>(null);
  const [searchVault, setSearchVault] = useState("");
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsAnalyzing(true);
    setAnalyzedItem(null);

    try {
      const res = await fetch("/api/media/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: inputUrl.trim(),
          userProfile: userProfile,
        }),
      });

      const data = await res.json();
      if (data.result) {
        const item: MediaItem = {
          id: "m_" + Date.now(),
          url: data.result.url,
          title: data.result.title || "Analyzed Food & Recipe Link",
          author: data.result.author || "Web Source",
          summary: data.result.summary || "Parsed food article summary.",
          isYouTube: !!data.result.isYouTube,
          youtubeId: data.result.youtubeId,
          isVegetarian: data.result.isVegetarian !== false,
          recipeDetails: data.result.recipeDetails,
          nutritionPerServing: data.result.nutritionPerServing || {
            calories: 250,
            proteinGrams: 10,
            carbsGrams: 30,
            fatsGrams: 8,
            fiberGrams: 6,
          },
          healthScore: data.result.healthScore || 8.5,
          healthVerdict: data.result.healthVerdict || "Tailored health verdict generated.",
          keyNutrients: data.result.keyNutrients || [],
          warnings: data.result.warnings || [],
          createdAt: new Date().toISOString(),
        };

        setAnalyzedItem(item);
      }
    } catch (err) {
      console.error("Failed to parse URL:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToVault = () => {
    if (analyzedItem) {
      onSaveMedia(analyzedItem);
      setAnalyzedItem(null);
      setInputUrl("");
    }
  };

  const filteredVault = savedVault.filter(
    (item) =>
      item.title.toLowerCase().includes(searchVault.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchVault.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#5A5A40]/10 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5A5A40] bg-[#E8D8C3]/50 px-3 py-1 rounded-full border border-[#5A5A40]/15 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-[#B45309]" /> Web & YouTube Parser
              </span>
              <span className="text-xs text-[#5A5A40]/60 font-medium">
                Personalized Health Verdict Engine
              </span>
            </div>
            <h1 className="text-3xl font-serif-italic text-[#2D2D2D] mt-2 tracking-tight">
              URL & YouTube Recipe Media Vault
            </h1>
            <p className="text-xs text-[#5A5A40]/70 mt-1 max-w-2xl">
              Paste any web or YouTube recipe link. Gemini AI extracts nutritional macros, checks vegetarian authenticity, calculates a 1–10 AI Health Score, and gives a tailored health verdict matching your age ({userProfile.age}), food habit ({userProfile.dietaryPreference}), and conditions ({(userProfile.medicalConditions || []).join(", ") || "None"}).
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5A40]/50" />
            <input
              type="url"
              required
              placeholder="Paste YouTube video or recipe blog URL (e.g. https://www.youtube.com/watch?v=...)"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#5A5A40]/20 rounded-full pl-11 pr-4 py-3 text-xs text-[#2D2D2D] placeholder-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40] transition"
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzing || !inputUrl.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white rounded-full text-xs font-semibold shadow-xs transition disabled:opacity-50 whitespace-nowrap"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Evaluating Nutrition...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze with AI</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* AI Analysis Result Card (If present) */}
      {analyzedItem && (
        <div className="bg-white rounded-3xl p-6 border-2 border-[#5A5A40]/30 shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#5A5A40]/10 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] bg-[#E8D8C3]/50 px-3 py-1 rounded-full border border-[#5A5A40]/15 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B45309]" /> Fresh AI Nutrition Analysis
            </span>
            <button
              onClick={handleSaveToVault}
              className="px-5 py-2 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white text-xs font-semibold rounded-full shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save to Vault
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: YouTube Player / Image */}
            <div className="lg:col-span-5 space-y-3">
              {analyzedItem.isYouTube && analyzedItem.youtubeId ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#5A5A40]/15 bg-black shadow-xs">
                  <iframe
                    src={`https://www.youtube.com/embed/${analyzedItem.youtubeId}`}
                    title={analyzedItem.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-[#E8D8C3]/30 border border-[#5A5A40]/15 flex items-center justify-center p-6 text-center">
                  <div>
                    <Globe className="w-10 h-10 text-[#5A5A40] mx-auto mb-2" />
                    <span className="text-xs text-[#5A5A40] font-serif-italic">Web Recipe Article Parsed</span>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-serif-italic text-[#2D2D2D] leading-snug">
                {analyzedItem.title}
              </h2>
              {analyzedItem.author && (
                <p className="text-xs font-semibold text-[#5A5A40]">By {analyzedItem.author}</p>
              )}
              <p className="text-xs text-[#5A5A40]/80 leading-relaxed bg-[#F9F8F4] p-4 rounded-2xl border border-[#5A5A40]/10">
                {analyzedItem.summary}
              </p>
            </div>

            {/* Right: AI Score, Tailored Verdict & Macros */}
            <div className="lg:col-span-7 space-y-4">
              {/* Score & Health Verdict Box */}
              <div className="bg-[#F9F8F4] p-4 rounded-2xl border border-[#5A5A40]/15 flex items-start gap-4">
                <div className="text-center p-3 bg-white rounded-2xl border border-[#5A5A40]/15 min-w-[90px] shadow-xs">
                  <span className="block text-[10px] text-[#5A5A40]/60 uppercase font-semibold">AI Score</span>
                  <span className="text-2xl font-black text-[#5A5A40] font-mono">
                    {analyzedItem.healthScore}/10
                  </span>
                  <span className="block text-[9px] text-[#5A5A40] font-bold mt-0.5">
                    {analyzedItem.healthScore >= 8 ? "Highly Healthy" : "Moderate Choice"}
                  </span>
                </div>

                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#5A5A40] block mb-1">
                    Tailored Health Verdict ({userProfile.dietaryPreference})
                  </span>
                  <p className="text-xs text-[#2D2D2D] leading-relaxed">
                    {analyzedItem.healthVerdict}
                  </p>
                </div>
              </div>

              {/* Warnings / Cautions if present */}
              {analyzedItem.warnings && analyzedItem.warnings.length > 0 && (
                <div className="bg-[#F27D26]/10 border border-[#F27D26]/30 p-3.5 rounded-2xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-[#B45309] block">Health Cautions:</span>
                    <ul className="list-disc list-inside text-xs text-[#B45309]/90 space-y-0.5 mt-0.5">
                      {analyzedItem.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Macro Nutrition Breakdown */}
              <div>
                <span className="text-xs font-bold text-[#5A5A40] block mb-2">
                  Estimated Nutrition Per Serving
                </span>
                <div className="grid grid-cols-5 gap-2 text-center bg-[#F9F8F4] p-3.5 rounded-2xl border border-[#5A5A40]/10">
                  <div>
                    <span className="block text-[10px] text-[#5A5A40]/60">Calories</span>
                    <span className="text-sm font-bold text-[#2D2D2D]">{analyzedItem.nutritionPerServing.calories}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A5A40]/60">Protein</span>
                    <span className="text-sm font-bold text-[#5A5A40]">{analyzedItem.nutritionPerServing.proteinGrams}g</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A5A40]/60">Carbs</span>
                    <span className="text-sm font-bold text-[#B45309]">{analyzedItem.nutritionPerServing.carbsGrams}g</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A5A40]/60">Fats</span>
                    <span className="text-sm font-bold text-[#78350F]">{analyzedItem.nutritionPerServing.fatsGrams}g</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#5A5A40]/60">Fiber</span>
                    <span className="text-sm font-bold text-[#5A5A40]">{analyzedItem.nutritionPerServing.fiberGrams}g</span>
                  </div>
                </div>
              </div>

              {/* Recipe Ingredients & Method if extracted */}
              {analyzedItem.recipeDetails && (
                <div className="bg-[#F9F8F4] p-4 rounded-2xl border border-[#5A5A40]/10 space-y-2 text-xs">
                  <div className="flex items-center gap-4 text-[#5A5A40]/70 text-[11px] font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Prep: {analyzedItem.recipeDetails.prepTime}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Cook: {analyzedItem.recipeDetails.cookTime}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Servings: {analyzedItem.recipeDetails.servings}</span>
                  </div>
                  {analyzedItem.recipeDetails.ingredients?.length > 0 && (
                    <div>
                      <span className="font-semibold text-[#5A5A40] block mb-1">Extracted Ingredients:</span>
                      <div className="flex flex-wrap gap-1">
                        {analyzedItem.recipeDetails.ingredients.map((ing, idx) => (
                          <span key={idx} className="bg-white text-[#5A5A40] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/10 text-[10px] font-medium">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved Media Vault Repository */}
      <div className="bg-white rounded-3xl p-6 border border-[#5A5A40]/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#5A5A40]/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#5A5A40]" />
            <h2 className="text-xl font-serif-italic text-[#5A5A40]">
              Saved Media Vault Library ({savedVault.length})
            </h2>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A5A40]/50" />
            <input
              type="text"
              placeholder="Filter saved videos & blogs..."
              value={searchVault}
              onChange={(e) => setSearchVault(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#5A5A40]/15 rounded-full pl-9 pr-3 py-1.5 text-xs text-[#2D2D2D] placeholder-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40]"
            />
          </div>
        </div>

        {filteredVault.length === 0 ? (
          <div className="text-center py-10 bg-[#F9F8F4] rounded-2xl border border-[#5A5A40]/10 p-6">
            <Youtube className="w-8 h-8 text-[#5A5A40]/40 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#2D2D2D]">No saved media in vault yet</h3>
            <p className="text-xs text-[#5A5A40]/70 mt-1">
              Paste a recipe blog or YouTube link above to analyze and store in your personal health vault.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredVault.map((item) => {
              const isExpanded = expandedRecipeId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-[#F9F8F4] rounded-2xl p-5 border border-[#5A5A40]/15 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-[#2D2D2D] line-clamp-1">
                        {item.title}
                      </h3>
                      <span className="text-xs font-bold text-[#5A5A40] bg-[#E8D8C3] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/20 shrink-0">
                        {item.healthScore}/10
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5A5A40]/70 mt-1 line-clamp-2">
                      {item.summary}
                    </p>

                    <p className="text-[11px] text-[#5A5A40] mt-2 italic bg-white p-3 rounded-xl border border-[#5A5A40]/10">
                      "{item.healthVerdict}"
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-[10px] text-[#5A5A40]/70 font-medium">
                      <span>Cals: <strong>{item.nutritionPerServing.calories}</strong></span>
                      <span>Protein: <strong className="text-[#5A5A40]">{item.nutritionPerServing.proteinGrams}g</strong></span>
                      <span>Fiber: <strong className="text-[#5A5A40]">{item.nutritionPerServing.fiberGrams}g</strong></span>
                    </div>
                  </div>

                  {/* Expandable Recipe Details */}
                  {isExpanded && item.recipeDetails && (
                    <div className="mt-3 pt-3 border-t border-[#5A5A40]/10 space-y-2 text-xs animate-fadeIn">
                      <span className="font-bold text-[#5A5A40] block">Ingredients:</span>
                      <ul className="list-disc list-inside text-[11px] text-[#5A5A40]/80 space-y-0.5">
                        {item.recipeDetails.ingredients?.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>

                      <span className="font-bold text-[#5A5A40] block mt-2">Instructions:</span>
                      <ol className="list-decimal list-inside text-[11px] text-[#5A5A40]/80 space-y-1">
                        {item.recipeDetails.instructions?.map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Card Footer Actions */}
                  <div className="pt-2 border-t border-[#5A5A40]/10 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedRecipeId(isExpanded ? null : item.id)}
                      className="text-[11px] font-bold text-[#5A5A40] hover:underline flex items-center gap-1"
                    >
                      <span>{isExpanded ? "Hide Recipe" : "View Recipe Details"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#5A5A40]/60 hover:text-[#5A5A40] p-1"
                        title="Open Original Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onDeleteMedia(item.id)}
                        className="text-[#5A5A40]/40 hover:text-[#F27D26] p-1"
                        title="Delete from Vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
