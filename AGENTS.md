# Homatch: agent guide

**Read this first.** Then read, in order:
1. `docs/PRODUCT.md`: what we're building, every screen, and the interaction spec
2. `docs/CONTRACTS.md`: types, the data API, DB schema, and matching rules
3. `docs/TASKS.md`: find your task card (ID like `J1`, `K5`, `C2`) and do only that

## The product in one paragraph
Homatch is swipe-to-match for renting. **Tenants** (house hunters) set their preferences once, then swipe on homes. **Landlords** (and anyone listing a room) swipe on tenants. Their deck starts with the tenants who already liked their listing, then continues into a **discovery pool** of renters whose preferences fit, so a landlord never runs out of cards. When both sides swipe right on the same (listing, tenant) pair, they **match** and can chat. We're building it in one day for a hackathon demo (Devin × give(a)go). **Priority order: 1) the demo loop works, 2) UI and interactions feel great, 3) everything else.**

## Stack
- **Next.js (App Router) + TypeScript** under `src/`
- **Tailwind CSS v4**. All design tokens are CSS variables in `src/styles/tokens.css`
- **`motion`** (Framer Motion) for gestures, springs, and shared-element transitions
- **Data:** `src/lib/api.ts` is the **only** entry point for data. It has two adapters:
  - `mock` (the default): localStorage plus `BroadcastChannel`, so two browser tabs side by side act like two live users. Works offline.
  - `supabase`: Postgres and Realtime, for the deployed version.
  - Switch with `NEXT_PUBLIC_DATA_MODE=mock|supabase`
- **No real auth.** `/demo` is a persona picker that sets the current user.
- **Deploy:** Vercel. Every PR gets a preview URL, so review UI there on a phone.

## Rules for every agent
1. UI code never imports Supabase and never reads localStorage directly. It calls functions from `src/lib/api.ts`.
2. Shared types live in `src/lib/types.ts`. **Don't change existing shapes.** Adding optional fields is fine. Anything else goes through Coleman.
3. **Stay inside the folders your task owns** (see the ownership table below). If you must touch another folder, keep the change minimal and call it out in the PR.
4. **Mobile first at 390×844.** On desktop the app renders centered inside `PhoneFrame`, because we demo on a laptop.
5. **Tokens only.** Don't hardcode hex colors, radii, shadows, font sizes, or motion durations. If a token is missing, add it to `tokens.css` and mention that in the PR.
6. **Motion values come from `docs/PRODUCT.md` → Interaction spec.** Every animation must respect `prefers-reduced-motion`.
7. Tap targets are at least 44×44px. Interactive elements need visible focus states.
8. Before you open a PR: `npm run build` and `npm run lint` must pass. **UI PRs must include screenshots, or a short screen recording for anything animated, at 390×844.**
9. One task per PR. Title format: `[J1] Swipe deck engine`. Branch format: `jazz/j1-swipe-deck`.
10. Don't add dependencies outside the stack without giving a one-line reason in the PR.
11. **Never break `/demo`.** The seeded personas and the "Reset demo" button must always work.
12. Copy is short, warm, and plain. No lorem ipsum: use realistic seed content.

## Ownership
| Area | Owner | Paths |
|---|---|---|
| Data, matching, realtime, seed, deploy | **Coleman** | `src/lib/**`, `supabase/**`, `src/app/demo/**`, `src/app/api/**` |
| Swipe deck, cards, detail sheets, match overlay | **Jazz** | `src/components/deck/**`, `src/components/cards/**`, `src/components/match/**`, `src/app/playground/**` |
| Tokens, UI kit, app shell, onboarding, matches, chat | **Kamsi** | `src/styles/**`, `src/components/ui/**`, `src/components/chat/**`, `src/app/(app)/matches/**`, `src/app/(app)/chat/**`, `src/app/onboarding/**` |
| Discover page and app layout wiring | **Coleman** (renders Jazz's and Kamsi's components) | `src/app/(app)/discover/**`, `src/app/(app)/layout.tsx` |
| UI kit showcase | **Kamsi** | `src/app/kit/**` |
| Deck-specific tokens | **Jazz** | `src/styles/deck.tokens.css` |
| Landlord listing flows and profile | **Coleman** (uses Kamsi's UI kit) | `src/app/(app)/profile/**`, `src/app/onboarding/landlord/**` |

**Shared files** (`package.json`, `types.ts`, `api.ts`, `tokens.css`): see `docs/TASKS.md` → Merging. **When you replace a stub component, keep its props exactly** as in `CONTRACTS.md` → Component contracts.

## Target folder map
```
src/
  app/
    demo/page.tsx                 persona picker + "Reset demo"
    playground/page.tsx           isolated component sandbox (deck, cards)
    onboarding/tenant/page.tsx    preference stepper
    onboarding/landlord/page.tsx  create-listing stepper
    (app)/layout.tsx              PhoneFrame + BottomNav + global event listener (match overlay)
    (app)/discover/page.tsx       the deck (tenant: homes; landlord: renters for the active listing)
    (app)/matches/page.tsx        new matches row + conversations
    (app)/chat/[matchId]/page.tsx
    (app)/profile/page.tsx        tenant prefs / landlord listings
  components/
    deck/    SwipeDeck.tsx, useSwipe.ts, DeckControls.tsx
    cards/   ListingCard.tsx, TenantCard.tsx, DividerCard.tsx, ListingDetail.tsx, TenantDetail.tsx, FitPill.tsx
    match/   MatchOverlay.tsx
    chat/    ChatThread.tsx, MessageBubble.tsx, Composer.tsx, QuickReplies.tsx
    ui/      Button, IconButton, Chip, Segmented, Sheet, Avatar, Input, RangeSlider, Stepper, PhoneFrame, BottomNav, Toast
  lib/
    types.ts  api.ts  config.ts  score.ts  seed.ts  format.ts
    adapters/mock.ts  adapters/supabase.ts
  styles/tokens.css
supabase/schema.sql
```

## Commands
- `npm run dev`: start the app locally (mock mode)
- `npm run build && npm run lint`: required before every PR
- Reset the demo data: open `/demo` → **Reset demo**
