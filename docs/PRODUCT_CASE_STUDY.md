# Pantry Vault AI — Product Case Study

*A product manager's build: shipping a working AI product with a no-code / AI-builder-first approach.*

**Role:** Product Manager (also acting as builder, using no-code + AI code generation)
**Status:** Private MVP, in test with 10–20 vegetarian households. Not yet open for public sign-up.
**Stack under the hood:** Google AI Studio (initial build) → React + Vite + Tailwind, Express, Supabase, Gemini, Vercel.

---

## 1. One-line summary

Pantry Vault AI helps vegetarian households stop wasting food and stop running out of staples — by tracking what's in the pantry, warning what's about to expire, and turning what you already have into recipes you can actually cook.

I took this from an idea to a deployed, account-gated MVP **without a founding engineer**, using an AI builder for the first version and layering real product infrastructure (auth, data isolation, usage limits, cost control) on top.

---

## 2. The business problem

Three everyday problems, all expensive in money and in mental load:

| Problem | Why it matters | Who feels it |
| --- | --- | --- |
| **Fresh food spoils unseen** | Produce, paneer, curd and herbs rot at the back of the fridge before anyone remembers them. That's direct money thrown away, weekly. | Every household that shops fresh |
| **"We have food but nothing to cook"** | People buy groceries and still order out because deciding *what* to make from what's on hand is friction. | Busy families, working couples |
| **Staples run out without warning** | Dal, atta, rice, oil quietly hit zero mid-week, forcing an emergency trip or a skipped meal. | Anyone running a kitchen |

**Why it's a real market, not just a nice-to-have:** food waste is a recurring cost with no current owner in the home. Existing note/list apps are passive — they don't know what's expiring, don't suggest what to cook, and don't respect dietary rules (vegetarian, Jain, vegan). The wedge is a tool that is *opinionated about vegetarian Indian kitchens specifically*, rather than a generic global pantry app.

**Constraint that shaped everything:** this is a solo, pre-revenue build. Every decision had to be cheap to ship, cheap to run, and safe to put real user data into.

---

## 3. The users

- **Primary:** the person who runs the kitchen in a vegetarian household — does the shopping, decides the meals, feels the waste.
- **Dietary segments treated as first-class:** vegetarian, Jain (no onion/garlic/root veg), and vegan. Recipes are generated *inside* these rules, not filtered after the fact.
- **Test cohort:** 10–20 households, invite-only, so I get real usage signal before opening the doors or charging.

---

## 4. The solution (what ships today)

| Feature | The job it does | The insight behind it |
| --- | --- | --- |
| **Pantry** | Add items one by one, **or paste a whole shopping list** and AI splits it into items with quantities and expiry dates. | Data entry is the #1 reason pantry apps die. Removing typing removes the churn point. |
| **Stock alerts** | Flags anything at/below its reorder level and builds a **shopping list you send on WhatsApp**. | Meet users where they already coordinate the household — WhatsApp, not another inbox. |
| **Recipes from your pantry** | Tick what you have; AI suggests two vegetarian recipes that respect your food habit. | The value isn't "recipes" — it's *recipes from what's already in the house, tonight.* |
| **Voice Studio** | Dictate a recipe in any language; it returns a structured English recipe you can share or save. | Family recipes live in people's heads and regional languages. Capture them without a keyboard. |

**Deliberately scoped out (for now):** nutrition figures are shown as rough AI estimates with an explicit disclaimer — *no medical or health advice.* Being honest about accuracy is a trust decision, not a gap.

---

## 5. Roadmap (and the reasoning)

Ordered by what compounds retention, not by what's easiest to build:

1. **Onboarding + starter staples list** — reduce the empty-state cliff so a new user has value on day one.
2. **"I cooked this" button** — reduces stock automatically and prioritizes expiring items. This closes the loop and makes the pantry *self-correcting* instead of a chore to maintain.
3. **Daily expiry reminder (email/push)** — turns the app from something you open into something that reaches out. This is the retention engine.
4. **Monetization:** rough quantities (full/half/low/out), add-from-bill/screenshot, share-recipe-with-cook-in-Hindi, then a **14-day trial → paid plan** via manual UPI.

The sequencing bet: *nail the maintenance loop (1–3) before charging (4).* A pantry app only earns money if people keep it accurate, so retention mechanics come before the paywall.

---

## 6. Key product & technical decisions

These are the decisions a PM should be able to defend in an interview:

- **No-code / AI-builder first.** The first working version was generated in Google AI Studio. This bought a shippable prototype in days instead of weeks and let me validate the *concept* before spending on engineering.
- **But not no-code forever.** Once the concept held, I added the things AI builders don't give you for free: **Supabase Auth (magic link)**, **Postgres with row-level security** so each household sees only its own data, and **usage limits** so a runaway user (or a scraper) can't run up an AI bill.
- **AI key never touches the browser.** Every Gemini call goes through the server (`server/llm.ts`), and every `/api` route requires a signed-in user and is capped (default 30 requests / 24h). This is a security and cost-control decision.
- **Provider resilience.** The AI layer falls back across free providers (Gemini → Groq → OpenRouter) and retries overloaded models, so a single provider outage doesn't take the product down. Reliability without a paid tier.
- **Errors shown in-app, not as browser pop-ups.** A small UX/trust decision that makes the MVP feel like a product.
- **Manual UPI paywall before automated billing.** Don't build Stripe until people will pay. `profiles.plan` / `trial_ends_at` are flipped by hand for now.

---

## 7. Skills this project demonstrates

Framed against the way I work — a 4-pillar model of **Delegation, Description, Discernment, Feedback.**

**Product management**
- Problem framing from a lived, recurring pain (food waste + meal friction) into a scoped MVP.
- Ruthless scoping: shipped 4 features, deferred nutrition accuracy, deferred billing, deferred Google sign-in.
- Roadmap sequencing driven by retention logic, not build-effort.
- Segment-aware design (Jain/vegan as first-class, not filters).

**Delegation (to AI + no-code tools)**
- Used an AI builder (Google AI Studio) to produce the first working version, then directed AI code generation to extend it.
- Wrote precise specs/prompts good enough to get usable output — the "Description" pillar in practice.

**Discernment**
- Knew where no-code stops being safe: added auth, RLS data isolation, and rate limits before letting real users in.
- Called out AI nutrition estimates as rough rather than presenting them as fact — judgment about what to trust and expose.

**Technical fluency (enough to lead a build)**
- Understands the shape of a modern web app: React/Vite frontend, Express API, Postgres/Supabase, serverless deploy on Vercel.
- Secured secrets server-side; designed for cost control and provider failover.

**Feedback loop**
- Chose an invite-only 10–20 household test *before* public launch and *before* charging — designing the product around learning, not vanity metrics.

---

## 8. How the product is built (architecture)

```
Browser (React + Vite + Tailwind)
        │  authenticated calls only
        ▼
Express API  ──►  Supabase (Auth: email magic link)
(server/app.ts)   Postgres + Row-Level Security
        │         tables: profiles, pantry_items, ai_usage
        ▼
AI layer (server/llm.ts)
Gemini → Groq → OpenRouter  (fallback + retry)
        │  API keys stay server-side, never in the browser
Deployed on Vercel (frontend via Vite, /api/* via api/index.ts)
```

- **Frontend:** `src/` — React 19, Vite, Tailwind, component-per-feature.
- **API:** `server/app.ts`, served by `api/index.ts` on Vercel and `server.ts` locally.
- **Accounts & data:** Supabase Auth + Postgres with RLS (`supabase/schema.sql`).
- **AI:** `@google/genai` and fallbacks, called only from the server.
- **Guardrails:** every `/api` route needs a signed-in user; `AI_DAILY_LIMIT` caps requests per user per 24h.

---

## 9. What I'd measure next

To move from "it works" to "it retains," the metrics that matter:

- **Activation:** % of new households that add ≥1 pantry item and generate ≥1 recipe in week one.
- **Maintenance:** % of items updated after purchase/consumption — the leading indicator that the pantry stays accurate (this is what the "I cooked this" button is designed to lift).
- **Waste avoided (self-reported):** the north-star proxy — did an expiry alert lead to the item being used?
- **Recipe usefulness:** % of generated recipes marked "I cooked this."
- **Willingness to pay:** trial → paid conversion once the paywall is live.

---

## 10. Retrospective (living section)

*Captured after each milestone — what worked, what didn't, what to change.*

- **Worked:** AI builder got a testable product in front of real households fast; WhatsApp as the output channel removed friction.
- **Didn't (yet):** empty-state onboarding is thin — new users hit a blank pantry (fix is roadmap item #1).
- **Change:** measure maintenance rate explicitly before building the paywall; a paywall on an unmaintained pantry won't convert.

---

*This document is a case study of a private MVP. Nutrition figures in the app are rough AI estimates and not medical advice.*
