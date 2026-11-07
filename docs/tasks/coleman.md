# Coleman: data, deploy, realtime, merge captain

**Read first:** [team board](README.md) → `AGENTS.md` → `docs/CONTRACTS.md`.

**You own:** `src/lib/**`, `supabase/**`, `src/app/demo/**`, `src/app/api/**`, `src/app/(app)/discover/**`, `src/app/(app)/layout.tsx` and `AppShell.tsx`, `src/app/(app)/profile/**`, `src/app/onboarding/landlord/**`.

**Your job today:** keep `main` green and demoable, get the app onto a URL, and build the two new data features: **AI fit** (Claude) and the **Likes tab**. After that comes Supabase for real phones. The core data layer is already done.

**Order:** C5a (Vercel) → C8 (AI fit) → C7 (Likes) → C9 (new preference fields, filter sheet) → C1 (photos) → C4 (Supabase) → C5 (reliability).

You also own `src/app/(app)/likes/**` and `src/app/api/fit/**`.

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

### C8 · AI fit · P0 · by T+1:45
Full spec: `docs/CONTRACTS.md` → AI fit, and `docs/PRODUCT.md` → AI fit.
1. `npm i @anthropic-ai/sdk zod` (say so in the chat). Add `ANTHROPIC_API_KEY` to `.env.local` and to Vercel (server-only).
2. **Server route** `src/app/api/fit/route.ts`:
   - Call `client.messages.parse` with `zodOutputFormat(FitSchema)`, using `claude-opus-5-5`, `output_config.effort: "low"`, and `max_tokens: 2000`.
   - Clamp the result to the rule score ±15.
   - Use a 6s timeout. On any error, a refusal or a missing key, return the rule fit.
   - Don't send `temperature` or a thinking budget; this model rejects both.
3. **Types:** add the optional `Fit.source` and `Fit.headline` to `types.ts`.
4. **Adapter:**
   - Add `getAiFit({ tenantId, listingId, viewer })` to `DataAdapter` and `mock.ts`.
   - Cache in localStorage and deduplicate requests already in flight.
   - Read the pre-computed `seed.aiFits` first.
5. **Seed:** add `aiFits` to `DbState` and the fixtures, with hand-written AI fits for **Maya × l-sunny**, both as tenant and as landlord viewer. This keeps the money shot working offline.
6. **Discover wiring:**
   - After a deck loads, upgrade the top 3 items.
   - After each swipe, upgrade the next unupgraded item.
   - Use `setData(prev => …)` and match by id.

**Accept:**
- With a key, the top card's pill gains the AI marker and a headline within about 3s.
- With no key or offline, nothing breaks, and Maya × Sunny still shows its AI headline.
- No request ever blocks a swipe.

### C7 · Likes tab (data and page) + intro note data · P0 · by CP3
Full spec: `docs/PRODUCT.md` → 5b Likes and Intro note, and `docs/CONTRACTS.md` → Likes rules.
1. **Types:** add `Profile.introNote?`, plus `LikeItem` and `Likes`.
2. **Engine:** add `likesFor(state, userId, opts)`.
3. **Adapter:** add `getLikes()` and `saveProfile()`. Emit `{ type: 'like', by: 'landlord' }` to the tenant when a landlord likes them, and deliver it in `toAppEvent`.
4. **Seed:** give Maya **one landlord like** for her demo beat. Suggested: David says yes to Maya for `l-ranelagh` (the studio). Give a few tenants and landlords `introNote`s, including Maya's: "Designer, quiet, home most evenings. Looking for 12+ months."
5. **The `/likes` page** at `src/app/(app)/likes/page.tsx`:
   - Segmented tabs, Liked you and You liked, each with its count.
   - A sort sheet with Newest, Best fit, and Price or Budget.
   - For landlords, a listing filter chip row.
   - A 2-column grid of `LikeTile`s.
   - Tapping a tile opens `ListingDetail` or `TenantDetail`. Liking from there calls `swipe()`, and the AppShell overlay fires.
   - Live updates come from `like` and `match` events.
   - If `LikeTile` (Jazz) or `Segmented` (Kamsi) isn't merged yet, **create a minimal stub with the contract's props** in their folder and tell them.
6. **AppShell:** pass `likesBadge` (the Liked you count) to `BottomNav`, and add the Likes tab to the nav if Kamsi hasn't yet. That's a one-line change in `BottomNav`'s tabs array.
7. **Intro note editing** on `/profile`: a 140-character field with a counter, saved through `saveProfile`.

**Accept:**
- Maya → Likes → Liked you shows David's studio with his note. Tapping Interested matches instantly in both tabs.
- David → Likes → Liked you shows the renters who liked any of his listings, filterable by listing.

### C9 · New preference fields + Discover filter sheet · P0 · by CP3
The onboarding references added new fields (`CONTRACTS.md` → TenantPrefs and Listing).
- Add the optional `bathroomsMin`, `placeType` and `propertyType` to `TenantPrefs`.
- Add `propertyType` and `isRoom` to `Listing`, and seed them for all 12 listings.
- In the engine and score: `placeType` and `propertyType` are hard filters in the tenant deck, and `bathroomsMin` folds into the Bedrooms criterion.
- **Discover filter sheet:** the sliders icon in the Discover header opens Kamsi's `PreferencesForm` inside a `Sheet`. Saving calls `saveTenantPrefs` and refetches the deck. Until her component lands, keep the icon linking to `/profile`.
- On `/profile`, Edit preferences opens the same sheet.

**Accept:** in Maya's tab, changing her budget from the Discover sheet changes the deck immediately, and the engine check script still passes the demo story.

### C1 · Photos, seed, /demo polish · P0 · by CP3
- **Photos.** Replace the stock photos in `src/lib/fixtures.ts` (the `P` map) with Irish-looking rentals: red-brick terraces, Georgian doors, modern Dublin apartments, and Cork/Galway flats. Each listing needs at least 3 photos in the right order: hero, living room, bedroom, kitchen or exterior. Check each URL loads, and add any new image host to `next.config.ts`.
- **Seed size.** Grow it to about 20 tenants. Keep the demo story intact: Maya fits `l-sunny` at about 92% and hasn't swiped it, `l-sunny` has 3 likes, and about 6 Discover renters fit it.
- **`/demo`.** Polish it. It's the first screen judges see. A short "How to demo" hint is fine.
- If you change the seed's shape, bump `SEED_VERSION`.

**Accept:**
- Every card looks like a real Irish rental.
- Reset puts you back at the exact start of the demo script.

### C4 · Supabase adapter · P1 (moved down: AI fit and Likes are more visible in the demo) · start after C7 and C8
1. Create the project and apply `supabase/schema.sql` (from `CONTRACTS.md`). RLS stays off: the data is fake.
2. Write a seed script (`npm run seed`) that loads `createSeed()`.
3. Write `adapters/supabase.ts` implementing `DataAdapter`:
   - Reads load rows and use `engine` for ordering.
   - `swipe()` writes and then creates the match. Use an RPC or a unique constraint to avoid a race.
   - `subscribe()` uses Realtime on `swipes`, `matches`, and `messages`, maps rows to `AppEvent` for the viewer, and **fires in the sender's own tab too**, as the mock does.
   - The session stays in `sessionStorage`.
4. Switch it on with `NEXT_PUBLIC_DATA_MODE=supabase` in Vercel.

**Accept:** the full loop works between **two phones** on the Vercel URL. If it isn't solid by CP4, demo on mock (two tabs) and stop working on this. Add tables for `ai_fits` and `profiles.intro_note`, and include `getLikes` in the adapter.

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
Only edit files in: src/lib/**, supabase/**, src/app/demo/**, src/app/api/**, src/app/(app)/discover/**, src/app/(app)/likes/**, src/app/(app)/AppShell.tsx, src/app/(app)/profile/**, src/app/onboarding/landlord/**, next.config.ts, package.json. (Exception: you may create a minimal stub of a missing component in another folder, with exactly the props from CONTRACTS.md.)
For Claude API calls: use @anthropic-ai/sdk with client.messages.parse + zodOutputFormat, model "claude-opus-5-5", output_config.effort "low"; never send temperature or a thinking budget; keep the key server-side.
Do not change existing signatures in src/lib/types.ts or src/lib/adapters/types.ts, only add optional fields. Keep the mock adapter's rev/waitForRev logic.
Done when every acceptance criterion passes. Run `npm run build && npm run lint`, test the two-tab loop on /demo (Maya + David), then open a PR titled "[ID] <name>" from branch coleman/<id>-<slug>.
```
