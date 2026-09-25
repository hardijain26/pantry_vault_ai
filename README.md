# Pantry Vault AI 🌿

> **Built with Google AI Studio — An AI-Powered No-Code Solution for Smart Vegetarian Pantry Management & Recipe Creation**

---

## 🎯 Problem Statement

Managing a household pantry, especially for **vegetarian and plant-based diets**, presents several subtle yet frustrating challenges every day:

1. **Food Waste & Overbuying**: Fresh produce, herbs, and plant-based protein items spoil quickly. Without real-time tracking, items sit hidden in shelves until they expire, leading to wasted food and money.
2. **Nutritional Imbalances in Plant-Based Diets**: Vegetarian diets require conscious balancing of complete proteins, iron, B12, and essential micro-nutrients. Tracking macro and micro-nutrient coverage across stored pantry items is often complex and time-consuming.
3. **The "What Should I Cook?" Dilemma**: People frequently buy groceries but still struggle to cook meals because they don't know what recipes can be made strictly from the items currently in stock.
4. **Restock Friction & Forgotten Staples**: Running out of essential cooking staples (like lentils, spices, or plant milk) causes last-minute ordering stress.
5. **Loss of Hands-Free Convenience**: Manually typing or logging inventory while cooking or unpacking groceries with wet/dirty hands is cumbersome.

---

## 💡 The Solution: Pantry Vault AI

**Pantry Vault AI** was built using a **No-Code / Natural Language AI Workflow** via Google AI Studio. By translating natural language prompts into a fully functional, real-time web application powered by Gemini AI models, **Pantry Vault AI** transforms passive grocery lists into an intelligent, interactive kitchen assistant.

---

## ✨ Key Features & Problem Solvers

### 🥑 1. Intelligent Pantry Inventory Management
* **Solves**: Food waste and forgotten expiration dates.
* **Feature**: Real-time tracking of vegetarian inventory with visual freshness status indicators (Fresh, Approaching Expiry, Low Stock) and automated category organization.

### 🥗 2. AI Micronutrient & Macro Evaluator
* **Solves**: Plant-based dietary gaps and nutritional guesswork.
* **Feature**: Powered by Gemini AI, it analyzes the total nutritional profile of your stored pantry, highlighting protein sources, dietary fiber ratios, essential micro-nutrients, and actionable health suggestions.

### 🍳 3. Dynamic DIY Recipe Studio
* **Solves**: Decision fatigue and "what's for dinner" stress.
* **Feature**: Generates custom vegetarian and vegan recipes tailored strictly to what is currently available in your pantry, matching dietary goals (High Protein, Quick 15-Min, Low Calorie, Whole Food) while minimizing waste.

### 📲 4. Low-Stock WhatsApp Alert Engine
* **Solves**: Restock friction and forgotten household staples.
* **Feature**: Detects depleted items and automatically constructs formatted WhatsApp restock messages with one-click sharing for quick grocery ordering or roommate coordination.

### 🗺️ 5. Seasonal Harvest & Locavore Tracker
* **Solves**: Overpaying for out-of-season produce and lower nutritional quality.
* **Feature**: Displays optimal seasonal fruits and vegetables, guiding smarter, sustainable, and cost-effective grocery shopping.

### 🎙️ 6. Hands-Free Voice Studio
* **Solves**: Manual typing hassle while cooking or unpacking groceries.
* **Feature**: Uses voice recognition to transcribe dictated ingredient updates and quick culinary notes seamlessly.

---

## 🚀 Built as a No-Code Solution with Google AI Studio

This entire application was conceptualized, designed, and constructed through **natural language prompting** in **Google AI Studio**:

* **Zero Manual Boilerplate**: Built from conversational prompts without writing raw framework configurations manually.
* **Integrated Gemini Intelligence**: Uses Google's `@google/genai` SDK on a secure server-side layer to provide nutrition evaluations, recipe logic, and natural language understanding.
* **Modern Visual Experience**: High-contrast, responsive UI styled with Tailwind CSS, custom produce visual icons, and Motion animations.

---

## Setup

### 1. Database (once)
In Supabase: **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, click **Run**.
This creates the `profiles`, `pantry_items` and `ai_usage` tables with row-level security, so each account sees only its own data.

### 2. Run locally
```bash
git clone https://github.com/hardijain26/pantry_vault_ai.git
cd pantry_vault_ai
bun install            # or npm install
cp .env.example .env   # then add your GEMINI_API_KEY
bun run dev            # http://localhost:3000
```

### 3. Deploy on Vercel
Import the repo in Vercel. Add these environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `GEMINI_API_KEY`.
`vercel.json` builds the frontend with Vite and serves `/api/*` from `api/index.ts`.
Then in Supabase: **Authentication → URL Configuration**, set **Site URL** to your Vercel URL.

### Accounts and limits
- Sign-in is by email magic link (Supabase Auth). Google sign-in comes next.
- Every `/api` route needs a signed-in user and is capped at `AI_DAILY_LIMIT` requests per 24 hours (default 30).
- `profiles.plan` / `trial_ends_at` are for the manual UPI paywall; only you can change them, from the Supabase Table Editor.

---

## 📄 License

Distributed under the [MIT License](LICENSE).
