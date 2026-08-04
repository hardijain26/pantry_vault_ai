export type NutrientCategory =
  | "Gut Health"
  | "Probiotics"
  | "Protein"
  | "Dairy"
  | "Carbohydrates"
  | "Fats"
  | "Vitamins"
  | "Minerals"
  | "Other";

export type FoodGroup =
  | "Vegetables"
  | "Legumes & Pulses"
  | "Grains & Seeds"
  | "Nuts & Healthy Fats"
  | "Dairy & Alternatives"
  | "Fermented & Gut Care"
  | "Fruits"
  | "Spices & Herbs"
  | "Other";

export type DietaryPreference =
  | "Pure Vegetarian"
  | "Vegan"
  | "Jain"
  | "Lacto-Vegetarian"
  | "Ovo-Vegetarian"
  | "High-Protein Veg";

export type MedicalCondition =
  | "Diabetes"
  | "Hypertension"
  | "IBS"
  | "High Cholesterol"
  | "Celiac / Gluten Intolerance"
  | "PCOS"
  | "Acid Reflux"
  | "None";

export interface PantryItem {
  id: string;
  name: string;
  nutrientCategory: NutrientCategory;
  foodGroup: FoodGroup;
  quantity: number;
  unit: string;
  threshold: number;
  caloriesPerUnit: number;
  proteinPerUnit: number; // in grams
  carbsPerUnit: number;   // in grams
  fatsPerUnit: number;    // in grams
  fiberPerUnit: number;   // in grams
  keyMicroNutrients: string[];
  healthNotes?: string;
  expiryDate?: string;
  lastUpdated?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  dietaryPreference: DietaryPreference;
  medicalConditions: MedicalCondition[];
  dailyCalorieGoal: number;
  whatsappPhone: string;
  theme: "organic-light" | "sage-dark";
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  author?: string;
  summary: string;
  isYouTube: boolean;
  youtubeId?: string | null;
  isVegetarian: boolean;
  recipeDetails?: {
    prepTime: string;
    cookTime: string;
    servings: number;
    ingredients: string[];
    instructions: string[];
  };
  nutritionPerServing: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    fiberGrams: number;
    glycemicIndex?: string;
  };
  healthScore: number; // 1 to 10
  healthVerdict: string;
  keyNutrients: string[];
  warnings: string[];
  createdAt: string;
}

export interface DIYRecipe {
  id: string;
  title: string;
  tagline?: string;
  dietCategory: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: "Easy" | "Medium" | "Chef-Level";
  ingredients: string[];
  instructions: string[];
  chefTips?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  healthMatchScore: number;
  healthVerdict: string;
  whatsappShareText?: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorDiet: DietaryPreference;
  recipeTitle: string;
  recipeDescription: string;
  dietCategory: string;
  prepTime: string;
  healthScore: number;
  ingredients: string[];
  instructions: string[];
  likes: number;
  likedByMe?: boolean;
  comments: { id: string; author: string; text: string; time: string }[];
  createdAt: string;
}

export interface VoiceRecipeResult {
  detectedLanguage?: string;
  detectedLanguageFlag?: string;
  originalTranscript?: string;
  englishTranscript?: string;
  rawTranscript?: string;
  title: string;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  servings: number;
  ingredients: { item: string; quantity: string; pantryMatch: string }[];
  instructions: string[];
  healthScore: number;
  healthVerdict: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  suggestedPantryAdditions: string[];
  whatsappShareText?: string;
}
