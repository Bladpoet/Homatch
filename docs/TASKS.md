# Homatch: task board

**P0** means the demo needs it. **P1** means it makes the demo good. **P2** is only if we're ahead.
Times are relative to kickoff (H+0). If the demo slot moves, move the checkpoints with it.

## Checkpoints
| When | Checkpoint | Done when |
|---|---|---|
| **H+0:45** | **CP1: Foundations** | The scaffold, types, mock API, and seed are on `main`. Tokens v0 are on `main`. The five key frames are agreed (deck card, detail, match overlay, matches, chat). The Vercel project is linked. |
| **H+2:30** | **CP2: Ugly loop** | In two tabs on mock data: Maya swipes right on David's listing → she shows up in David's deck → he swipes right → both tabs show the match → a message goes back and forth. Unstyled is fine. |
| **H+4:00** | **CP3: Looks real** | All P0 screens are styled with tokens. Vercel is deployed. **Decide here:** demo on Supabase (if it's solid) or on mock (two tabs). |
| **H+5:00** | **CP4: Feature freeze** | Bug fixes and polish only from here. Record the backup demo video. |
| **H+5:30** | **CP5: Rehearse** | Run the script in `PRODUCT.md` 3 times. Reset the seed. Close every other tab. |

## Status: read this first
**C0, plus most of C1, C2 and C3, is already done and on `main`.** The CP2 loop already passes on mock data in two tabs, and an automated browser test confirms each step:
1. Maya likes the listing.
2. She appears live at the top of David's deck.
3. The match overlay shows in both tabs.
4. Quick replies and messages arrive live both ways.
5. The divider card appears after the liked-you cards.

What that means for each lane:
- **Coleman:** the data layer is done. Finish **C1** (photos and seed), then go straight to **C4** (Supabase). That's now the critical path for demoing on real phones.
- **Jazz and Kamsi:** every component you own exists as a working stub with the final props, already wired into real pages and data. **Replace the stub's internals and keep its props.** Look for `STUB(C0)` comments.
- Wiring that's done (Discover, Matches, Chat, AppShell): restyle the visuals freely, but keep the data flow.

## Parallel lanes
Everyone works at the same time. **Nobody waits on another person's PR**, because C0 creates a stub for every shared component and data function from `CONTRACTS.md` → Component contracts. You code against the stub, and the real version replaces it when it merges.

| Time | Coleman | Jazz | Kamsi |
|---|---|---|---|
| H+0:00–0:45 | **C0** scaffold, fixtures, all stubs | **J0** visual direction and card frames (human, in Figma) | **K0** visual direction (human). Push tokens as soon as C0 lands |
| H+0:45–1:30 | **C1** mock adapter, full seed, `/demo` | **J1** deck engine in `/playground` | **K1a** core UI: Button, Chip, Sheet, Avatar |
| H+1:30–2:30 | **C2** swipe, match, events → **C3** wiring | **J2** ListingCard ‖ **J3** TenantCard (2 Devin sessions) | **K1b** shell ‖ **K3** Matches (2 Devin sessions) |
| H+2:30–4:00 | **C4** Supabase ‖ **C5** deploy | **J5** match overlay → **J4** detail sheets | **K4** Chat → **K2** onboarding |
| H+4:00–5:00 | **C5** reliability, **C6** if there's time | **J6** deck polish | **K5** empty states and copy |

`‖` means run both in parallel Devin sessions. `→` means one after the other.

**What each task needs, and what to use until it's merged:**
| Task | Needs | Until then, use |
|---|---|---|
| Everything | C0 | (nothing: C0 is the only hard blocker, which is why it's tiny) |
| J1, J2, J3, K3, K4 | data | `src/lib/fixtures.ts` (static seed, ships in C0) |
| C3 | J1, J2, J3 | the stub components, which render the right props as plain boxes |
| K3, K4 | C2 events | fixtures. Live updates appear automatically once C2 merges |
| J5 | C2 match events | a "Trigger match" button in `/playground` |
| Everyone's UI | K1a | the stub components (plain HTML elements with the agreed props) |

## Merging
- Open a PR to `main` as soon as your acceptance criteria pass. **Merge within 15 minutes of it going green.** Long-lived branches are what break hackathons.
- **Coleman is the merge captain.** He keeps `main` building and resolves any conflicts in shared files.
- **Shared files** need care. Edit only your own section, and pull `main` first:
  - `package.json`: say so in the team chat before adding a dependency.
  - `src/lib/types.ts` and `src/lib/api.ts`: Coleman only.
  - `src/styles/tokens.css`: Kamsi only. Jazz's deck-specific values go in `src/styles/deck.tokens.css`, which `tokens.css` imports.
- Replacing a stub means **keeping its props exactly**. If you need a new prop, make it optional.
- After CP2, `main` must always be demoable. Check that before every merge.

## How we work with Devin
- Use **one Devin session per task card.** Each person can run about 2 sessions in parallel, as long as the tasks touch different folders.
- **Start every session with this prompt** (fill in the blanks):
  ```
  You're working on Homatch (repo root). Before writing code, read AGENTS.md, docs/PRODUCT.md and docs/CONTRACTS.md.
  Your task is [ID] from docs/TASKS.md: <paste the whole task card>.
  Only edit files in: <paths>. Use tokens from src/styles/tokens.css, the API from src/lib/api.ts, and the motion values from PRODUCT.md → Interaction spec.
  Done when every acceptance criterion passes. Run `npm run build && npm run lint`, then open a PR titled "[ID] <name>" from branch <name>/<id>-<slug>, with screenshots or a screen recording at 390×844.
  ```
- **Review on the Vercel preview, on your phone.** Give Devin feedback with numbers, not adjectives: "radius 24, not 16", "the spring feels floaty, use stiffness 500", "the stamp should start fading in at 40px".
- **Merge small and often.** Pull `main` before starting each new task. Only Coleman changes `types.ts` and `api.ts` signatures.
- Got a UI nit that isn't worth a task? Add it to **Polish list** at the bottom of this file.

---

## Coleman: data, matching, realtime, deploy

### C0 · Scaffold, contracts, and stubs · ✅ done
Set up:
- Next.js (App Router, TypeScript, `src/`), Tailwind v4, `motion`, and ESLint
- The folder skeleton from `AGENTS.md`
- `types.ts` exactly as in `CONTRACTS.md`
- `config.ts` exactly as in `CONTRACTS.md` → Config (Ireland, EUR, `en-IE`, REGIONS/AREAS)
- `format.ts` (rent, dates, relative time)
- `src/styles/tokens.css` (empty sections plus an import of `deck.tokens.css`)

Then:
- **`src/lib/fixtures.ts`**: a small static dataset with 4 listings (with photos), 4 tenants (including Maya and David), and 1 match with 4 messages.
- **`src/lib/api.ts` stubbed**: every function from `CONTRACTS.md` returns fixture data, and `subscribe` is a no-op.
- **Every component in `CONTRACTS.md` → Component contracts stubbed**: the right file, the exact props, and a plain box as the render.
- Placeholder pages for every route
- A bare `PhoneFrame` and `BottomNav`
- `(app)/layout.tsx` rendering them

Then link Vercel.
**Accept:** `npm run dev` shows every route inside the phone frame, and the build passes. Pushed to `main`, and the team has been told.

### C1 · Seed curation + /demo polish · P0 · by H+1:30
✅ Already done: `score.ts`, `engine.ts`, `adapters/mock.ts` (every API function, session in sessionStorage, BroadcastChannel with a revision wait), and a working `/demo` with Reset. The seed is in `src/lib/fixtures.ts` (3 landlords, 12 listings, 16 tenants).
**Still to do:**
- **Curate the photos.** All the Unsplash URLs load, but they aren't Irish homes, and nobody has checked that each one shows what it's labelled as.
- Grow the seed to about 20 tenants.
- Polish `/demo`.

If you change the seed's shape, bump `SEED_VERSION` so every browser re-seeds.
**Accept:** every card photo looks like an Irish rental, and Reset restores the exact starting point of the demo script.

### C2 · Swipe → match → events · ✅ done (hardening only)
✅ Done and tested in two tabs. If you have spare time, harden the edge cases:
- a swipe that fails, which should show a toast and then reload
- undo straight after a match
- reset while a chat is open

### C3 · Discover page wiring · ✅ done
✅ Done in `src/app/(app)/discover/page.tsx` and `(app)/AppShell.tsx`. Swipes are optimistic, rewind works, the landlord deck refetches live when a `like` event arrives, the listing switcher sheet works, and the match overlay is deduped. The original spec is kept below for reference.
Don't wait for Jazz: wire against the stub `SwipeDeck` and card components, and the real ones drop in when they merge. Wire `(app)/discover` to the right deck for the current role. For landlords, add the active-listing state (the switcher UI comes from Kamsi's `Sheet`/`Chip`). Mount the global `subscribe()` in `(app)/layout.tsx` and pass `match` events to `MatchOverlay`. When a `like` event arrives for the active listing, refetch the landlord deck.
**Accept:** the deck renders real seed data for both roles. Maya's like appears in David's deck without a page reload.

### C4 · Supabase adapter · P1 · by CP3
Apply `schema.sql`. Write a seed script that loads `fixtures.ts` into Supabase, `adapters/supabase.ts` with the same behavior as the mock adapter, and Realtime for `subscribe()`. `resetDemo()` re-seeds.
**Accept:** the CP2 loop works across **two different devices** on the Vercel URL with `NEXT_PUBLIC_DATA_MODE=supabase`. If it isn't solid by CP3, we demo on mock and stop working on this.

### C5 · Deploy and demo reliability · P0 · by CP4
Set up the Vercel environment variables. Add error boundaries on each route with a friendly fallback, and preload the seed images. Make sure Reset demo restores the exact starting state of the demo script.
**Accept:** a fresh `/demo` → Reset → the demo script runs clean 3 times in a row.

### C6 · Landlord listing flow + profile · P2
`/onboarding/landlord` (create listing) and `/profile` (tenant: edit preferences using Kamsi's controls; landlord: my listings with like counts).

---

## Jazz: the swipe experience (the deck, cards, and match moment)

### J0 · Visual direction (with Kamsi) · P0 · by CP1
In about 30 minutes, agree on the mood, color, type, and **card anatomy**. Then mock up five frames in Figma: ListingCard, TenantCard, ListingDetail, MatchOverlay, and DividerCard. Jazz leads the card and overlay frames.
**Accept:** the frames are exported or linked in `docs/design/`, and Kamsi has what's needed for tokens v0.

### J1 · SwipeDeck engine · P0 · by H+2:00
A generic `<SwipeDeck items renderCard onSwipe onRewind emptyState />` with `useSwipe`, built to the **Interaction spec** exactly: drag and rotation, stamps, the commit threshold or velocity, fly-out, spring back, the next card scaling up, the top-3 render, buttons (`DeckControls`), keyboard, rewind, and reduced motion. Build it in `/playground` with dummy colored cards first. It can start before C1 lands.
**Accept:** it holds 60fps on a phone. A fast flick commits even below 120px. A slow drag past 120px commits. A release under the threshold springs back. Buttons and arrow keys animate the same way as a drag. Rewind returns the card.

### J2 · ListingCard + FitPill + reason chips · P0 · by CP2
Build the card from `PRODUCT.md` §3: photo carousel with tap zones, segment bar, and end nudge; the gradient info block; the FitPill; up to 3 reason chips. Muted styling for reasons that fail.
**Accept:** it looks right with a long title (2 lines, then truncate), a 1-photo listing, and a 6-photo listing.

### J3 · TenantCard + DividerCard + "Likes your place" badge · P0 · by CP2
The landlord-side card and the divider card. The divider is swipeable either way, or tappable to continue, and it isn't recorded as a swipe.
**Accept:** David's deck reads clearly as: liked-you cards with badges → the divider → discover cards.

### J4 · Detail sheets · P1 · by CP3
`ListingDetail` and `TenantDetail`: a shared-element expand from the card, drag down to dismiss, and pinned Pass/Interested buttons that trigger the deck swipe when used.
**Accept:** opening and closing a sheet doesn't jump, and liking from the sheet closes it and then flies the card out.

### J5 · MatchOverlay · P0 · by CP3
Built to the spec: both photos, the headline, Send a message (goes to chat) and Keep swiping, plus haptics. It must work when triggered by a remote event as well as by your own swipe.
**Accept:** it fires in both tabs during the CP2 loop. Esc and Keep swiping close it.

### J6 · Deck polish · P1 · by CP4
Image preloading, no flash between cards, the empty state, stamp typography, shadow depth on the stack, and testing on a real phone.

---

## Kamsi: design system, shell, onboarding, matches, chat

### K0 · Tokens v0 (with Jazz) · P0 · by CP1
Write `src/styles/tokens.css` and the Tailwind theme mapping: color (bg, surface, surface-2, text, text-muted, accent, accent-ink, like, pass, border), type scale (display, title, body, caption, and a stamp style), radius, shadow (card, sheet, button), spacing, and **motion tokens** (the springs and durations from the Interaction spec). Add a font via `next/font`.
**Accept:** tokens are on `main` by CP1 and `/playground` uses them. Values can keep changing after that, but token names can't.

### K1a · Core UI kit · P0 · by H+1:30 (others use these, so ship them first)
Button (primary/secondary/ghost), IconButton (round, 3 sizes), Chip (selectable, with tones), Sheet (bottom sheet with drag to dismiss), and Avatar. Each replaces its C0 stub, keeping the props.
**Accept:** each component is shown on `/kit` with visible pressed, focus, and disabled states. Merge immediately.

### K1b · Shell + remaining kit · P0 · by CP2
Restyle `PhoneFrame` and build `BottomNav` (sliding active indicator, badge). Then add Segmented, Input, RangeSlider, Stepper, and Toast to `/kit`.
**Accept:** navigating between the three tabs feels native. The indicator slides, and nothing jumps.

### K2 · Tenant onboarding · P1 · by CP3 (a floater: whoever is free first after CP3 takes it)
The 5-step stepper from `PRODUCT.md` §1, with horizontal step transitions, saving through `saveTenantPrefs`, and the "Finding homes that fit you…" moment before the deck.
**Accept:** Sam can go from `/demo` to the deck in under 30 seconds, and the preferences visibly change the deck.

### K3 · Matches screen · P0 · by CP3
The New matches row and the conversations list from `PRODUCT.md` §6, with skeleton loading and an empty state. Live updates come from the `match` and `message` events.
**Accept:** a match made in the other tab shows up in the New matches row without a reload.

### K4 · Chat · P0 · by CP3
The header with the listing chip, grouped bubbles, quick replies on an empty thread, and the auto-growing composer. Live incoming messages animate in. `markRead` runs on open.
**Accept:** in the CP2 loop, messages show up in both tabs within 1 second, and the quick replies send in one tap.

### K5 · Empty, loading, and copy pass · P1 · by CP4
Every screen gets a designed empty state and a skeleton. Do one copy pass across the whole app.

### K6 · Propose viewing card · P2
A structured chat message (date and time, with Accept/Decline).

---

## P2 ideas (only after CP4 is safe, which it usually isn't)
- Tenants see "Landlord interested" on a listing whose landlord already swiped right on them
- "AI write my description" on create listing
- A "Likes you" grid for tenants (see the open questions in `PRODUCT.md`)
- Landlord matches filtered by listing

## Polish list
_Add one line per nit: `[screen] what's wrong → what it should be (who)`_
-
