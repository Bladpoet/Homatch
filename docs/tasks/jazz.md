# Jazz: the swipe experience

**Read first:** [team board](README.md) → `AGENTS.md` → `docs/PRODUCT.md` → **Interaction spec** (this is your bible).

**You own:** `src/components/deck/**`, `src/components/cards/**`, `src/components/match/**`, `src/app/playground/**`, `src/styles/deck.tokens.css`.

**Your job today:** make swiping **feel incredible**. The drag, the stamps, the fly-out, the card behind growing, and the "It's a match" moment are what judges remember. Everything else in the app already works around you.

## Where your lane stands
Every component you own exists as a **working stub with its final props**, already used by the real pages:

| File | What the stub does now | What you build |
|---|---|---|
| `deck/SwipeDeck.tsx` | Stacks the top 3 cards; buttons and arrow keys commit | J1: drag physics, stamps, fly-out, spring-back, back-card scale |
| `deck/DeckControls.tsx` | Pass, Undo, and Like buttons | J1: press feel and sizing |
| `deck/deck.config.ts` | ✅ All the gesture numbers from the spec | Tune them |
| `cards/ListingCard.tsx` | First photo, gradient, rent, title, BER, fit, and chips | J2: photo carousel and design |
| `cards/TenantCard.tsx` | Photo, name, budget, "Likes your place" badge | J3 |
| `cards/DividerCard.tsx` | Plain card with a button | J3 |
| `cards/FitPill.tsx`, `ReasonChips.tsx` | Basic | J2 |
| `cards/ListingDetail.tsx`, `TenantDetail.tsx` | Content inside Kamsi's `Sheet` | J4: shared-element expand |
| `match/MatchOverlay.tsx` | Static overlay that already fires in **both tabs** | J5: the animation |

**Rules for the deck (already wired, so don't break them):**
- `SwipeDeck` is **controlled**. `items[0]` is the top card. Call `onSwipe(item, dir)` **after** the fly-out finishes, and the parent removes the item.
- Rewind: the parent puts the item back at `items[0]`. Animate it flying back in from the side it left on.
- Drag, buttons, and keyboard must all go through **one** commit function.
- `canSwipe(item) === false` (the divider card): show no stamps, but it can still be dismissed.
- Use `motion` (already installed). `spring` and `duration` live in `src/styles/motion.ts`, and the gesture numbers in `deck.config.ts`.

**Work in `/playground` first.** It runs both decks on static data, has a "Trigger match" button, and writes nothing to the demo data. Then check `/discover` in two tabs.

---

## Your tasks, in order

### G1 · Visual direction (with Kamsi) · P0 · first 30 min
See the [team board](README.md). You lead the **card anatomy** and the **match overlay** frames.

### J1 · SwipeDeck engine · P0 · by T+1:30
Replace the stub internals of `SwipeDeck.tsx` (and add `useSwipe.ts` if it helps), built to the **Interaction spec** exactly:
- The drag follows the pointer 1:1. Rotation is `x/20`, clamped to ±15°.
- LIKE/NOPE (or YES/PASS) stamps fade in with `|x|/100`. Use `labels` from the props.
- Commit at `|x| > 120` **or** `|vx| > 600`. Fly out with velocity to 1.5× the viewport width over about 250ms. Below that, spring back (400/30).
- The back card goes from scale 0.95, y 8 to scale 1, y 0 as the top card is dragged.
- Buttons and arrow keys play the same fly-out with ±10° rotation. Rewind flies the card back in.
- Haptics: `navigator.vibrate(10)` on commit; the page already calls it.
- **Reduced motion:** no rotation or fly-out, and a 150ms crossfade instead.
- Touch: `touch-action: none` on the card, and make sure vertical scrolling in detail sheets isn't hijacked.

**Accept:**
- It runs at 60fps on a real phone.
- A fast flick commits even under 120px. A slow drag past 120px commits. A release under the threshold springs back.
- Buttons and keys look identical to a drag. Rewind works.
- `/discover` still passes the two-tab loop.

### J2 · ListingCard + FitPill + ReasonChips · P0 · by CP3
- A photo carousel. Tap the left or right half to change photo instantly (no slide), with a segment bar at the top and a 4px nudge at either end.
- The gradient info block: rent, title (2 lines, then truncate), area · beds · baths · from date, BER badge.
- FitPill and up to 3 reason chips, with failed ones muted.
- Taps on the photo must not fire while dragging.

**Accept:** it looks right with a long title, a 1-photo listing, and a 4-photo listing.

### J3 · TenantCard + DividerCard + badge · P0 · by CP3
The landlord-side card, styled to match ListingCard, with a clear **"Likes your place"** badge. The divider card should feel like a moment: "That's everyone who liked this place. Here are renters who'd fit it."
**Accept:** David's deck reads clearly as liked-you cards with badges → the divider → Discover.

### J5 · MatchOverlay animation · P0 · by CP3
- The backdrop fades in over 200ms.
- Two circles spring in from x = ±120px with a 60ms stagger.
- The headline scales 0.9 → 1, delayed 150ms.
- Play `navigator.vibrate([30,50,30])`. AppShell already calls it; you can move the call here.

Props stay `{ summary, viewerRole, onMessage, onClose }`.
**Accept:** it plays in **both** tabs during the loop. Esc and Keep swiping close it.

### J4 · Detail sheets · P1 · by CP4
A shared-element expand from the card photo (`layoutId`) into `ListingDetail` and `TenantDetail`. Drag down to dismiss. The pinned Pass and Interested buttons close the sheet, **then** fly the card out.
**Coordinate with Kamsi:** she owns `Sheet` (K1a). Either build on her Sheet, or use your own motion container for these two and tell her.
**Accept:** opening and closing doesn't jump, and liking from the sheet animates the card out.

### J6 · Deck polish · P1 · by CP4
Preload the next 2 cards' photos, so there's no flash between cards. Also do the empty-state design, stamp typography, stack shadow depth, and a test on a real phone.

---

## Devin prompt (paste this, then fill in the task)
```
You're working on Homatch (repo root). Before writing code, read AGENTS.md, docs/PRODUCT.md (especially "Interaction spec"), docs/CONTRACTS.md ("Component contracts") and docs/tasks/jazz.md.
Your task is [ID] from docs/tasks/jazz.md: <paste the whole task card>.
Only edit files in: src/components/deck/**, src/components/cards/**, src/components/match/**, src/app/playground/**, src/styles/deck.tokens.css.
Replace STUB(C0) internals but keep every component's props exactly as they are. Use the motion library (already installed), tokens from src/styles/tokens.css, springs from src/styles/motion.ts, gesture numbers from src/components/deck/deck.config.ts. Respect prefers-reduced-motion.
Done when every acceptance criterion passes. Run `npm run build && npm run lint`, check /playground and the two-tab loop on /demo (Maya + David), then open a PR titled "[ID] <name>" from branch jazz/<id>-<slug> with a screen recording at 390×844.
```
