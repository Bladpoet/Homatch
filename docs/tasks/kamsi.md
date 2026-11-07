# Kamsi: design system, shell, matches, chat, onboarding

**Read first:** [team board](README.md) → `AGENTS.md` → `docs/PRODUCT.md` (screens 1, 6, 7 and the Interaction spec).

**You own:** `src/styles/**` (except `deck.tokens.css`), `src/components/ui/**`, `src/components/chat/**`, `src/components/onboarding/**`, `src/app/kit/**`, `src/app/(app)/matches/**`, `src/app/(app)/chat/**`, `src/app/onboarding/tenant/**`.

**Your job today:** decide how Homatch **looks and feels** everywhere outside the deck. Your tokens restyle the whole app at once, because every screen already uses them. **Onboarding is now P0**: a clean, tap-and-slider flow built from your references.

**Order:** G1 → K0 (tokens) → K1a (core kit) → **K2 (onboarding)** → K1b (nav with 4 tabs, Segmented, RangeSlider; start RangeSlider inside K2) → K3 / K4 (matches, chat) → K5.

If you run short on time, K3 and K4 are already wired and work. They only need visual polish, so they can slip before K2 does.

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
- `BottomNav` has **4 tabs now: Discover · Likes · Matches · Profile**. Use a heart for the Likes icon. It gets a sliding active indicator and badges, via `matchesBadge` and the new `likesBadge` prop.
- **Segmented** (Likes tabs with counts) and **RangeSlider** (onboarding budget) come first, because Coleman's `/likes` and your K2 need them. Their props are in `CONTRACTS.md`.
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

### K2 · Tenant onboarding: "Start matching" · **P0** · by CP3 (start right after K1a)
**References are in:** `docs/design/references/onboarding/`. Read **`NOTES.md`** first: it has the measured spec, which sections we use, and their defaults. Match the layout, spacing and interaction exactly. Use our tokens, not their colours.

**Build these:**
1. **`ui/OptionGroup.tsx`**: the reference's option buttons. Equal-width grid, 48px tall, about 14px radius. Selected is the accent fill with white text and a soft accent shadow; unselected is `surface-2` with muted text. It handles single-select, multi-select, and the six-cell "Any · 1+ … 5+" row. The press animation is `scale(0.97)`, and the selection colour change takes 150ms.
2. **`ui/RangeSlider.tsx`**: dual handles, with values above both ends, a 4px track, white handles with a 28px touch area, and keyboard arrows.
3. **`components/onboarding/PreferencesForm.tsx`**: the whole "Start matching" sheet:
   - Ten icon-labelled sections, following `NOTES.md` → "How Homatch adapts it"
   - A sticky footer with **Reset** and **Start matching**
   - Start matching stays disabled until an area is picked
   - Props are in `CONTRACTS.md`
4. **`/onboarding/tenant`**:
   - `PreferencesForm` first, then the **About you** step (avatar picker, then the intro note with starters and Skip), sliding horizontally.
   - Then "Finding homes that fit you…" (about 1.5s), then `router.replace('/discover')`.

**Wiring**
- Use `useCurrentUser()`.
- Map the chips to prefs as described in `CONTRACTS.md`.
- Save with `saveTenantPrefs(user.id, prefs, { avatarUrl })` and `saveProfile(user.id, { introNote })`. If `saveProfile` hasn't landed yet (C7), pass `introNote` in the third argument of `saveTenantPrefs`.
- **Hand-off:** Coleman uses `PreferencesForm` in a `Sheet` as the **Discover filter sheet** and on Profile. Keep it free of page-specific logic.

**Accept:**
- Side by side with `ref-1`, it reads as the same pattern.
- Sam goes from `/demo` to the deck in under 30 seconds.
- Changing the budget or areas visibly changes his deck.
- It works at 390×844 with no horizontal scroll, and every control is reachable by keyboard.

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
