# Kamsi: design system, shell, matches, chat, onboarding

**Read first:** [team board](README.md) → `AGENTS.md` → `docs/PRODUCT.md` (screens 1, 6, 7 and the Interaction spec).

**You own:** `src/styles/**` (except `deck.tokens.css`), `src/components/ui/**`, `src/components/chat/**`, `src/app/kit/**`, `src/app/(app)/matches/**`, `src/app/(app)/chat/**`, `src/app/onboarding/tenant/**`.

**Your job today:** decide how Homatch **looks and feels** everywhere outside the deck. Your tokens restyle the whole app at once, because every screen already uses them.

## Where your lane stands
| File | What exists now | What you build |
|---|---|---|
| `styles/tokens.css` | ✅ Every token name, with **neutral placeholder values** | K0: real values. Keep the names. |
| `styles/motion.ts` | ✅ Springs and durations from the spec | Tune them |
| `styles/globals.css` | Base styles and reduced motion | As needed |
| `app/layout.tsx` font | Inter as a placeholder (`--font-body`) | K0: the real typeface (it's the one file in `app/` you edit for this) |
| `ui/Button`, `IconButton`, `Chip`, `Avatar` | Working stubs with final props | K1a |
| `ui/Sheet.tsx` | Works (Esc and backdrop close it); no animation or drag | K1a: spring open, drag to dismiss |
| `ui/PhoneFrame.tsx`, `BottomNav.tsx` | Work; plain | K1b |
| `(app)/matches/page.tsx` | ✅ **Fully wired**: new matches row, conversations, live updates | K3: design it |
| `(app)/chat/[matchId]/page.tsx` | ✅ **Fully wired**: header, listing chip, quick replies, live messages | K4: design it |
| `chat/ChatThread.tsx`, `Composer.tsx` | Work; plain | K4 |
| `onboarding/tenant/page.tsx` | One "use demo preferences" button | K2: the real stepper |

**Rules:**
- **Token names are a contract.** Change values freely, never rename. If you need a new token, add it.
- **Keep every component's props** (see `CONTRACTS.md` → Component contracts). New props must be optional.
- On desktop, `PhoneFrame` has `transform`, so `fixed inset-0` stays inside the phone. Portals go into `#overlay-root`. Don't break either.
- Matches and Chat are already wired to live data. **Restyle freely, but keep the data calls and event handlers.**

**Work in `/kit`.** It shows every component and color token. `/playground` shows Jazz's cards using your tokens.

---

## Your tasks, in order

### G1 · Visual direction (with Jazz) · P0 · first 30 min
See the [team board](README.md). You lead **type, color, and the shell**.

### K0 · Tokens v1 · P0 · by T+0:45
Put real values into `tokens.css`: color, the type scale (including the `stamp` style for Jazz), radii, shadows, and motion. Swap the font in `src/app/layout.tsx`, keeping the `--font-body` variable. Merge it fast, because everyone's screens pick it up.
**Accept:** `/kit`, `/discover`, and `/matches` all show the new direction, and text contrast passes AA.

### K1a · Core kit · P0 · by T+1:30
Button, IconButton, Chip, Avatar, and **Sheet** (spring open at 300/30; drag down past 25% of its height or at more than 500px/s to close). Give each one pressed, focus, and disabled states on `/kit`. Merge fast, because Jazz's detail sheets sit inside your Sheet.
**Accept:** every state is visible on `/kit`. Sheets open and close smoothly on a phone.

### K1b · Shell + remaining kit · P0 · by CP3
- `BottomNav` with a sliding active indicator and the badge
- `PhoneFrame`: the desktop frame should look good on the demo laptop
- New components on `/kit`: Segmented, Input, RangeSlider (dual handle), Stepper, Toast

Coleman needs Toast for swipe errors, and you need RangeSlider and Stepper for K2.
**Accept:** switching between the three tabs feels native, with no jumps.

### K3 · Matches screen · P0 · by CP3
Design the existing page: the New matches row (tenants see the home photo, landlords see the person), the conversation rows with an unread dot, skeletons, and the empty state.
**Accept:** a match made in the other tab appears in New matches without a reload. That already works, so keep it working.

### K4 · Chat · P0 · by CP3
- Grouped bubbles with timestamps on groups
- New messages fade and rise 8px
- An auto-growing composer, with a send button that scales in
- Quick replies that feel tappable
- A header with the listing chip

**Accept:** messages appear in both tabs within 1 second (already true), quick replies send in one tap, and it looks great.

### K2 · Tenant onboarding · P1 · by CP4 (a floater, so hand it off if someone's free)
The 5-step stepper from `PRODUCT.md` §1:
1. Budget (RangeSlider)
2. Areas (chips grouped by region from `config.REGIONS`)
3. Move-in and lease
4. Household, pets, smoker
5. Photo and bio

Steps slide horizontally. Save with `saveTenantPrefs(user.id, prefs)`, then show "Finding homes that fit you…" and go to `/discover`. Use `useCurrentUser()` from `src/lib/hooks.ts`.
**Accept:** Sam goes from `/demo` to a deck in under 30 seconds, and his choices change what's in his deck.

### K5 · Empty states, loading, copy · P1 · by CP4
Every screen gets a designed empty state and a skeleton. Do one copy pass in Irish/UK English: flat, viewing, bills.

### K6 · Propose viewing card · P2
A structured chat message with a date and time, and Accept/Decline.

---

## Devin prompt (paste this, then fill in the task)
```
You're working on Homatch (repo root). Before writing code, read AGENTS.md, docs/PRODUCT.md (screens + "Interaction spec"), docs/CONTRACTS.md ("Component contracts") and docs/tasks/kamsi.md.
Your task is [ID] from docs/tasks/kamsi.md: <paste the whole task card>.
Only edit files in: src/styles/** (not deck.tokens.css), src/components/ui/**, src/components/chat/**, src/app/kit/**, src/app/(app)/matches/**, src/app/(app)/chat/**, src/app/onboarding/tenant/**, and the font setup in src/app/layout.tsx.
Never rename tokens; change values or add new ones. Keep every component's props. Keep existing data calls and event handlers on Matches and Chat. Use the motion library for animation and respect prefers-reduced-motion.
Done when every acceptance criterion passes. Run `npm run build && npm run lint`, check /kit and the two-tab loop on /demo (Maya + David), then open a PR titled "[ID] <name>" from branch kamsi/<id>-<slug> with screenshots or a recording at 390×844.
```
