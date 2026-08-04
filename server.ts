import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Initialize Gemini client lazily/safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy-key",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. PANTRY CATEGORIZATION API
app.post("/api/pantry/categorize", async (req, res) => {
  try {
    const { itemsText } = req.body;
    if (!itemsText || typeof itemsText !== "string") {
      return res.status(400).json({ error: "itemsText is required" });
    }

    const ai = getGeminiClient();
    const prompt = `You are a vegetarian pantry & nutrition expert. Analyze the following list or item description: "${itemsText}".
Return a JSON array of item objects. For each item in the text, extract/infer:
1. "name": Clean item name (e.g. "Greek Yogurt", "Organic Tofu", "Kefir", "Oats", "Spinach", "Almonds", "Turmeric", "Kimchi", "Chickpeas", "Sourdough").
2. "nutrientCategory": Exactly ONE of these 9 exact categories:
   - "Gut Health" (e.g., sauerkraut, kimchi, chicory, apple cider vinegar, psyllium husk, kombucha, prebiotic fibre)
   - "Probiotics" (e.g., live yogurt, kefir, fermented foods, tempeh, miso)
   - "Protein" (e.g., tofu, paneer, lentils, chickpeas, hemp seeds, seitan, edamame, beans)
   - "Dairy" (e.g., milk, paneer, cheese, butter, ghee, plant milks)
   - "Carbohydrates" (e.g., quinoa, brown rice, oats, sweet potatoes, whole wheat pasta)
   - "Fats" (e.g., extra virgin olive oil, chia seeds, walnuts, avocado, flaxseeds, ghee)
   - "Vitamins" (e.g., kale, spinach, bell peppers, berries, oranges, carrots)
   - "Minerals" (e.g., pumpkin seeds, sesame seeds, raw cacao, sea kelp, brazil nuts)
   - "Other" (e.g., spices, salt, baking soda, condiments)
3. "foodGroup": One of: "Vegetables", "Legumes & Pulses", "Grains & Seeds", "Nuts & Healthy Fats", "Dairy & Alternatives", "Fermented & Gut Care", "Fruits", "Spices & Herbs", "Other".
4. "defaultQuantity": Number (e.g. 500)
5. "unit": String (e.g., "g", "ml", "items", "packs", "kg", "liters")
6. "threshold": Default minimum stock threshold before reordering (number, e.g. 100)
7. "caloriesPerUnit": Number (calories per 100g or per 1 item)
8. "proteinPerUnit": Number in grams
9. "carbsPerUnit": Number in grams
10. "fatsPerUnit": Number in grams
11. "fiberPerUnit": Number in grams
12. "keyMicroNutrients": Array of strings (e.g., ["Vitamin C", "Iron", "Probiotic Strains", "Omega-3", "Calcium", "Zinc"])
13. "healthNotes": Brief 1-sentence note on vegetarian health benefit.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              nutrientCategory: { type: Type.STRING },
              foodGroup: { type: Type.STRING },
              defaultQuantity: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              threshold: { type: Type.NUMBER },
              caloriesPerUnit: { type: Type.NUMBER },
              proteinPerUnit: { type: Type.NUMBER },
              carbsPerUnit: { type: Type.NUMBER },
              fatsPerUnit: { type: Type.NUMBER },
              fiberPerUnit: { type: Type.NUMBER },
              keyMicroNutrients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              healthNotes: { type: Type.STRING },
            },
            required: ["name", "nutrientCategory", "foodGroup", "unit", "threshold"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ items: parsed });
  } catch (err: any) {
    console.error("Error in /api/pantry/categorize:", err);
    return res.status(500).json({ error: err.message || "Failed to categorize pantry items" });
  }
});

// 2. URL & YOUTUBE MEDIA VAULT PARSER & HEALTH SCORE API
app.post("/api/media/parse-url", async (req, res) => {
  try {
    const { url, userProfile } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    const ai = getGeminiClient();
    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
    
    // Extract youtube video ID if available
    let youtubeId = null;
    if (isYouTube) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) youtubeId = match[1];
    }

    const profileContext = userProfile ? `
User Profile Context:
- Age: ${userProfile.age || 30}
- Food Habits: ${userProfile.dietaryPreference || "Pure Vegetarian"} (e.g. Vegan, Pure Vegetarian, Jain, Lacto-Vegetarian, Ovo-Vegetarian)
- Medical Conditions: ${(userProfile.medicalConditions || []).join(", ") || "None"}
- Calorie Goal: ${userProfile.dailyCalorieGoal || 2000} kcal/day
` : "User is a Vegetarian with general health goals.";

    const prompt = `Analyze this food/recipe URL or video link: "${url}".
${profileContext}

Perform a comprehensive nutrition analysis, extract recipe details, evaluate suitability for the user's profile, and output JSON with:
1. "title": Descriptive title of the recipe or food topic.
2. "author": Content creator / website name or channel.
3. "summary": A clean 2-3 sentence overview of the dish/concept.
4. "isVegetarian": Boolean (true if vegetarian/vegan/Jain compatible, false if it contains meat/seafood/eggs - note: if non-veg, suggest a vegetarian adaptation).
5. "recipeDetails": {
     "prepTime": String (e.g. "15 mins"),
     "cookTime": String (e.g. "20 mins"),
     "servings": Number,
     "ingredients": Array of strings,
     "instructions": Array of strings
   }
6. "nutritionPerServing": {
     "calories": Number,
     "proteinGrams": Number,
     "carbsGrams": Number,
     "fatsGrams": Number,
     "fiberGrams": Number,
     "glycemicIndex": String ("Low", "Medium", "High")
   }
7. "healthScore": Number between 1 and 10 (10 being ultra-wholesome, nutrient-dense, aligned with profile).
8. "healthVerdict": A detailed, tailored 2-4 sentence medical & nutritional verdict specifically explaining how this dish impacts the user's specific medical conditions (${(userProfile?.medicalConditions || []).join(", ") || "General health"}) and dietary habits (${userProfile?.dietaryPreference || "Vegetarian"}).
9. "keyNutrients": Array of strings (e.g. ["High Fiber", "Probiotic Rich", "Low GI", "Rich in Calcium", "Anti-inflammatory"]).
10. "warnings": Array of strings (e.g. "Higher sodium content - monitor if hypertensive", "Contains nightshades", "Contains dairy - replace with oat milk for Vegan").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            summary: { type: Type.STRING },
            isVegetarian: { type: Type.BOOLEAN },
            recipeDetails: {
              type: Type.OBJECT,
              properties: {
                prepTime: { type: Type.STRING },
                cookTime: { type: Type.STRING },
                servings: { type: Type.NUMBER },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            nutritionPerServing: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                proteinGrams: { type: Type.NUMBER },
                carbsGrams: { type: Type.NUMBER },
                fatsGrams: { type: Type.NUMBER },
                fiberGrams: { type: Type.NUMBER },
                glycemicIndex: { type: Type.STRING },
              },
            },
            healthScore: { type: Type.NUMBER },
            healthVerdict: { type: Type.STRING },
            keyNutrients: { type: Type.ARRAY, items: { type: Type.STRING } },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["title", "summary", "healthScore", "healthVerdict", "nutritionPerServing"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    parsed.url = url;
    parsed.isYouTube = isYouTube;
    parsed.youtubeId = youtubeId;

    return res.json({ result: parsed });
  } catch (err: any) {
    console.error("Error in /api/media/parse-url:", err);
    return res.status(500).json({ error: err.message || "Failed to analyze URL" });
  }
});

// 3. DIY RECIPE GENERATOR API
app.post("/api/recipes/diy-generate", async (req, res) => {
  try {
    const { selectedIngredients, userProfile, mealType, customNote } = req.body;
    if (!selectedIngredients || !Array.isArray(selectedIngredients) || selectedIngredients.length === 0) {
      return res.status(400).json({ error: "At least one ingredient must be selected" });
    }

    const ai = getGeminiClient();
    const profileContext = userProfile ? `
User Profile Context:
- Age: ${userProfile.age || 30}
- Food Habits: ${userProfile.dietaryPreference || "Pure Vegetarian"} (e.g. Vegan, Pure Vegetarian, Jain - NO onion/garlic if Jain!, Lacto-Vegetarian)
- Medical Conditions: ${(userProfile.medicalConditions || []).join(", ") || "None"}
` : "Vegetarian user.";

    const prompt = `You are a world-class vegetarian chef and nutritionist.
Selected Ingredients from Pantry: ${selectedIngredients.join(", ")}.
Meal Type: ${mealType || "Any Meal"}.
Additional Instructions: ${customNote || "None"}.
${profileContext}

Generate 2 distinct, delicious, 100% vegetarian recipes using primarily these selected ingredients plus standard kitchen staples (oil, salt, water, basic spices).
Return a JSON object containing a "recipes" array. Each recipe must include:
1. "title": Creative catchy title.
2. "tagline": Mouth-watering subtitle.
3. "dietCategory": E.g. "Vegan", "Jain-Friendly", "High-Protein Veg", "Gut Healing".
4. "prepTime": String.
5. "cookTime": String.
6. "servings": Number.
7. "difficulty": "Easy" | "Medium" | "Chef-Level".
8. "ingredients": Array of strings with exact measurements.
9. "instructions": Array of step-by-step strings.
10. "chefTips": Helpful cooking tip or gut-health secret.
11. "nutrition": { "calories": Number, "protein": Number, "carbs": Number, "fats": Number, "fiber": Number }.
12. "healthMatchScore": Number (80 to 100%).
13. "healthVerdict": How this dish benefits the user given their medical conditions (${(userProfile?.medicalConditions || []).join(", ") || "health"}).
14. "whatsappShareText": Formatted ready-to-copy text with emojis for sharing on WhatsApp or Community.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  dietCategory: { type: Type.STRING },
                  prepTime: { type: Type.STRING },
                  cookTime: { type: Type.STRING },
                  servings: { type: Type.NUMBER },
                  difficulty: { type: Type.STRING },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  chefTips: { type: Type.STRING },
                  nutrition: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.NUMBER },
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fats: { type: Type.NUMBER },
                      fiber: { type: Type.NUMBER },
                    },
                  },
                  healthMatchScore: { type: Type.NUMBER },
                  healthVerdict: { type: Type.STRING },
                  whatsappShareText: { type: Type.STRING },
                },
                required: ["title", "ingredients", "instructions", "nutrition", "whatsappShareText"],
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ recipes: parsed.recipes || [] });
  } catch (err: any) {
    console.error("Error in /api/recipes/diy-generate:", err);
    return res.status(500).json({ error: err.message || "Failed to generate DIY recipe" });
  }
});

// 4. VOICE-TO-RECIPE TRANSCRIPTION API (Multilingual Detection & English Translation)
app.post("/api/recipes/transcribe-voice", async (req, res) => {
  try {
    const { transcript, audioBase64, mimeType, userProfile } = req.body;
    if (!transcript && !audioBase64) {
      return res.status(400).json({ error: "Transcript or audioBase64 is required" });
    }

    const ai = getGeminiClient();
    const profileContext = userProfile ? `
User Profile Context:
- Food Habits: ${userProfile.dietaryPreference || "Pure Vegetarian"}
- Medical Conditions: ${(userProfile.medicalConditions || []).join(", ") || "None"}
` : "";

    let parts: any[] = [];
    if (audioBase64) {
      parts.push({
        inlineData: {
          data: audioBase64,
          mimeType: mimeType || "audio/webm",
        },
      });
      parts.push({
        text: `You are an expert multilingual culinary AI. Listen to this voice recording describing a cooking process or recipe in ANY language (e.g., Spanish, Hindi, French, Mandarin, Italian, Tamil, Gujarati, German, Japanese, Portuguese, Arabic, Russian, etc.).
${profileContext}
1. Detect the spoken language automatically.
2. Transcribe the audio in its original language verbatim as "originalTranscript".
3. Translate and transcribe the audio accurately into clear English as "englishTranscript".
4. Convert the recipe into a complete, clean, structured English recipe JSON format ready to publish.`,
      });
    } else {
      parts.push({
        text: `You are an expert multilingual culinary AI. The user provided this voice dictation or text transcript in ANY language:
"${transcript}"
${profileContext}

1. Detect the input language automatically.
2. Store the original text as "originalTranscript".
3. Translate the full text into clear, natural English as "englishTranscript".
4. Structure this into a complete, clean, published English vegetarian recipe JSON format.`,
      });
    }

    const promptSuffix = `
Extract and return JSON with:
1. "detectedLanguage": Name of detected language (e.g. "Spanish (Español)", "Hindi (हिंदी)", "French (Français)", "Mandarin (中文)", "Italian (Italiano)", "Tamil (தமிழ்)", "German (Deutsch)", "Japanese (日本語)", "English").
2. "detectedLanguageFlag": Emoji flag for the detected language (e.g. "🇪🇸", "🇮🇳", "🇫🇷", "🇨🇳", "🇮🇹", "🇩🇪", "🇯🇵", "🇧🇷", "🇺🇸").
3. "originalTranscript": Spoken text transcribed in its original detected language.
4. "englishTranscript": Full translated English transcription of the spoken text.
5. "rawTranscript": Polished summary transcript in English.
6. "title": Catchy, attractive recipe title IN ENGLISH.
7. "prepTime": String (e.g. "10 mins").
8. "cookTime": String (e.g. "15 mins").
9. "difficulty": "Easy" | "Medium" | "Advanced".
10. "servings": Number.
11. "ingredients": Array of objects { "item": string (in English), "quantity": string, "pantryMatch": string (Nutrient category e.g. Protein, Probiotics, Vitamins) }.
12. "instructions": Array of step-by-step instructions IN ENGLISH.
13. "healthScore": Number (1-10).
14. "healthVerdict": Brief 1-2 sentence nutritional verdict matching user profile IN ENGLISH.
15. "nutrition": { "calories": Number, "protein": Number, "carbs": Number, "fats": Number, "fiber": Number }.
16. "suggestedPantryAdditions": Array of items mentioned in English that can be automatically added to pantry stock.
17. "whatsappShareText": Formatted ready-to-publish message in English with emojis, formatted for 1-click sharing on WhatsApp and social media.`;

    parts[parts.length - 1].text += promptSuffix;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: { type: Type.STRING },
            detectedLanguageFlag: { type: Type.STRING },
            originalTranscript: { type: Type.STRING },
            englishTranscript: { type: Type.STRING },
            rawTranscript: { type: Type.STRING },
            title: { type: Type.STRING },
            prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            servings: { type: Type.NUMBER },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  pantryMatch: { type: Type.STRING },
                },
              },
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            healthScore: { type: Type.NUMBER },
            healthVerdict: { type: Type.STRING },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER },
                fiber: { type: Type.NUMBER },
              },
            },
            suggestedPantryAdditions: { type: Type.ARRAY, items: { type: Type.STRING } },
            whatsappShareText: { type: Type.STRING },
          },
          required: ["title", "ingredients", "instructions", "nutrition"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ result: parsed });
  } catch (err: any) {
    console.error("Error in /api/recipes/transcribe-voice:", err);
    return res.status(500).json({ error: err.message || "Failed to transcribe voice recipe" });
  }
});

// Setup Vite development middleware or static production handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌱 VegPantry Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
