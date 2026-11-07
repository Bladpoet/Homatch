# Coleman: data, deploy, realtime, merge captain

**Read first:** [team board](README.md) → `AGENTS.md` → `docs/CONTRACTS.md`.

**You own:** `src/lib/**`, `supabase/**`, `src/app/demo/**`, `src/app/api/**`, `src/app/(app)/discover/**`, `src/app/(app)/layout.tsx` and `AppShell.tsx`, `src/app/(app)/profile/**`, `src/app/onboarding/landlord/**`.

**Your job today:** keep `main` green and demoable, get the app onto a URL, and make it work across **two real phones** (Supabase). The data layer is already done, so you're mostly integrating and hardening.

## Where your lane stands
- ✅ **C0** Scaffold, types, config, format, stubs, and every page
- ✅ **C2** `swipe()` with match creation, undo, events, and chat. Tested in two tabs.
- ✅ **C3** Discover wiring: optimistic swipes, rewind, live landlord refetch, the listing switcher, and match overlay dedupe
- 🟡 **C1** The engine, mock adapter, and `/demo` are done. The photos and seed size are still to do.

**What you need to know about the code:**
- **`engine.ts`** is pure logic: `tenantDeck`, `landlordDeck`, `applySwipe`, `undoLastSwipe`, `matchSummary`. Reuse it in the Supabase adapter: load rows, build a `DbState`-shaped object, and call the engine.
- **`adapters/mock.ts`** stamps every write with `DbState.rev`, and events wait for storage to catch up before reading. Chromium's cross-tab localStorage is asynchronous; that caused a real bug, so don't remove the revision wait.
- **`api.ts` → `pickAdapter()`** is where Supabase plugs in.
- **Engine sanity check:** open `/playground` and use the deck, or write a quick `tsx` script that imports `engine` and `createSeed()`.

---

## Your tasks, in order

### C5a · Link Vercel · P0 · do first (about 5 min)
Import `Bladpoet/Homatch` on vercel.com with the default Next.js settings. You don't need any environment variables for mock mode. Share the URL in the team chat, and turn on preview deployments for PRs.
**Accept:** `main` deploys, and every PR gets a preview URL that the designers can open on their phones.

### C1 · Photos, seed, /demo polish · P0 · by CP3
- **Photos.** Replace the stock photos in `src/lib/fixtures.ts` (the `P` map) with Irish-looking rentals: red-brick terraces, Georgian doors, modern Dublin apartments, and Cork/Galway flats. Each listing needs at least 3 photos in the right order: hero, living room, bedroom, kitchen or exterior. Check each URL loads, and add any new image host to `next.config.ts`.
- **Seed size.** Grow it to about 20 tenants. Keep the demo story intact: Maya fits `l-sunny` at about 92% and hasn't swiped it, `l-sunny` has 3 likes, and about 6 Discover renters fit it.
- **`/demo`.** Polish it. It's the first screen judges see. A short "How to demo" hint is fine.
- If you change the seed's shape, bump `SEED_VERSION`.

**Accept:**
- Every card looks like a real Irish rental.
- Reset puts you back at the exact start of the demo script.

### C4 · Supabase adapter · P0 (it's now the critical path for real phones) · by CP3
1. Create the project and apply `supabase/schema.sql` (from `CONTRACTS.md`). RLS stays off: the data is fake.
2. Write a seed script (`npm run seed`) that loads `createSeed()`.
3. Write `adapters/supabase.ts` implementing `DataAdapter`:
   - Reads load rows and use `engine` for ordering.
   - `swipe()` writes and then creates the match. Use an RPC or a unique constraint to avoid a race.
   - `subscribe()` uses Realtime on `swipes`, `matches`, and `messages`, maps rows to `AppEvent` for the viewer, and **fires in the sender's own tab too**, as the mock does.
   - The session stays in `sessionStorage`.
4. Switch it on with `NEXT_PUBLIC_DATA_MODE=supabase` in Vercel.

**Accept:** the full loop works between **two phones** on the Vercel URL. If it isn't solid by CP3, demo on mock (two tabs) and stop working on this.

### C5 · Demo reliability · P0 · by CP4
- Error boundaries per route with a friendly fallback
- Preload the seed images on `/demo`
- A toast and reload if a swipe fails (use Kamsi's Toast once it lands)
- Make sure Reset works in both modes

**Accept:** fresh `/demo` → Reset → the demo script runs clean 3 times in a row on the deployed URL.

### C2+ · Hardening · P1 · when there's a gap
- Undo straight after a match: the overlay is already open, so it should close
- Reset while a chat is open: go back to `/matches`
- Double-tapping ♥: there should be no double swipe

### C6 · Create listing + profile editing · P2
- `/onboarding/landlord`: a stepper for photos (pick from a seeded gallery), basics, rent and dates, rules, and description, using `createListing`
- `/profile`: edit tenant preferences by reusing Kamsi's onboarding controls

### G4 · Backup video · at CP4
See the [team board](README.md).

---

## Devin prompt (paste this, then fill in the task)
```
You're working on Homatch (repo root). Before writing code, read AGENTS.md, docs/PRODUCT.md, docs/CONTRACTS.md and docs/tasks/coleman.md.
Your task is [ID] from docs/tasks/coleman.md: <paste the whole task card>.
Only edit files in: src/lib/**, supabase/**, src/app/demo/**, src/app/(app)/discover/**, src/app/(app)/AppShell.tsx, src/app/(app)/profile/**, src/app/onboarding/landlord/**, next.config.ts, package.json.
Do not change existing signatures in src/lib/types.ts or src/lib/adapters/types.ts, only add optional fields. Keep the mock adapter's rev/waitForRev logic.
Done when every acceptance criterion passes. Run `npm run build && npm run lint`, test the two-tab loop on /demo (Maya + David), then open a PR titled "[ID] <name>" from branch coleman/<id>-<slug>.
```
