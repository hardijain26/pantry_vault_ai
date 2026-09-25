# Pantry Vault AI

A pantry app for vegetarian households. Track what you have, see what expires soon, and get recipes that use it up. Built with React, Express, Supabase and Gemini.

**Status:** private MVP, being tested with 10 to 20 households. Not open for public sign-up yet.

## The problem

Fresh produce, paneer, curd and herbs go off before anyone remembers they're there. People buy groceries and still don't know what to cook with them, and staples like dal or atta run out without warning.

## What the app does today

| Feature | What it does |
| --- | --- |
| Pantry | Add items one by one, or paste a shopping list and Gemini splits it into items with quantities and expiry dates. Each household sees only its own pantry. |
| Stock alerts | Lists items at or below their reorder level and builds a shopping list you can send on WhatsApp. |
| Recipes from your pantry | Tick the items you have; Gemini suggests two vegetarian recipes that follow your food habit (including Jain and vegan rules). |
| Voice Studio | Dictate a recipe in any language; it comes back as a structured English recipe you can share or add to the pantry. |

Nutrition figures are rough AI estimates. The app does not give medical or health advice.

## Coming next

1. Onboarding for new users, with a starter list of common staples.
2. "I cooked this" button that reduces stock, and recipes that use expiring items first.
3. Daily email or push reminder for items about to expire.
4. Rough quantities (full / half / low / out), adding items from a bill or order screenshot, sharing a recipe with a cook in Hindi, and a 14-day trial followed by a paid plan.

## How it's built

- **Frontend:** React + Vite + Tailwind (`src/`)
- **API:** Express routes in `server/app.ts`, served by `api/index.ts` on Vercel and by `server.ts` locally
- **Accounts and data:** Supabase Auth (email magic link) and Postgres with row-level security (`supabase/schema.sql`)
- **AI:** Gemini via `@google/genai`, called only from the server so the API key never reaches the browser

The first version was generated in Google AI Studio; accounts, storage and API protection were added afterwards.

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
