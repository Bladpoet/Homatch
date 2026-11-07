# Homatch: team board (everyone reads this)

**Your own tasks:** [Coleman](coleman.md) · [Jazz](jazz.md) · [Kamsi](kamsi.md)

**P0** means the demo needs it. **P1** means it makes the demo good. **P2** is only if we're ahead.

---

## Where we are
The **skeleton is built, tested, and on `main`.** The whole demo loop works today on mock data in two browser tabs. An automated browser test confirms each step:
1. Maya likes David's flat.
2. She appears live at the top of David's deck.
3. David says yes, and "It's a match" shows in **both** tabs.
4. Quick replies and messages arrive live both ways.
5. David keeps swiping and reaches the divider card, then Discover.

**What exists:**
- The data layer, matching engine, fit score, and Irish seed data
- Every page: `/demo`, Discover, Matches, Chat, Profile, onboarding placeholders, `/playground`, `/kit`
- **A working stub for every component**, with its final props, already wired to real data. Look for `STUB(C0)` comments.

**What doesn't exist yet** (this is the work that makes the demo win):
- **The swipe feel.** There's no drag, stamps, fly-out, or spring yet; buttons and arrow keys work.
- **The visual design.** Colors, font, and radii are neutral placeholders.
- The match moment animation, sheet drag, chat bubble animation, and real onboarding
- **Supabase**, so no real phones yet, and a **Vercel deploy**
- Irish-looking photos. The current ones are generic stock.

| Task | Owner | Priority | Status |
|---|---|---|---|
| C0 Scaffold, contracts, stubs | Coleman | P0 | ✅ done |
| C2 Swipe, match, events | Coleman | P0 | ✅ done (hardening optional) |
| C3 Discover wiring | Coleman | P0 | ✅ done |
| C5a Link Vercel | Coleman | P0 | 🔴 **do first, 5 min** |
| **C8 AI fit** (API route, cache, deck upgrade) | Coleman | **P0 (new)** | 🔴 to do |
| **C7 Likes tab** (data, page, intro note data) | Coleman | **P0 (new)** | 🔴 to do |
| **C9 New preference fields + Discover filter sheet** | Coleman | **P0 (new)** | 🔴 to do |
| C1 Photos, seed, /demo polish | Coleman | P0 | 🟡 to do |
| C4 Supabase (real phones) | Coleman | P1 (was P0) | 🔴 after C7/C8 |
| G1 Visual direction | Jazz + Kamsi | P0 | 🔴 **do first, 30 min** |
| J1–J6 Deck, cards, overlay, sheets | Jazz | P0/P1 | 🔴 to do (stubs in place) |
| **J7 Like tiles + AI fit on cards** | Jazz | **P0 (new)** | 🔴 to do |
| K0–K1 Tokens, kit, shell (now 4 tabs) | Kamsi | P0 | 🔴 to do (stubs in place) |
| **K2 Onboarding: "Start matching" sheet + About you** | Kamsi | **P0 (was P1)** | 🔴 to do. **References are in**: `docs/design/references/onboarding/` |
| K3–K5 Matches, chat, polish | Kamsi | P0/P1 | 🔴 to do (wired, needs design) |

_Update this table when you merge._

### New since the skeleton: read `docs/PRODUCT.md`
- **AI fit** (PRODUCT → AI fit): Claude refines the fit score and writes a one-line headline for each card. Rules stay as the instant fallback.
- **Likes tab** (PRODUCT → 5b): two tabs, **Liked you** and **You liked**, with sorting. Liking back is an instant match.
- **Intro note** (PRODUCT → Intro note): a 140-character note on your profile, which only people you've liked can see.
- **Onboarding** becomes P0: one **"Start matching" sheet** of tap options and a budget slider, following the references in `docs/design/references/onboarding/` (read `NOTES.md` there), then a short "About you" step. The same form doubles as the **Discover filter sheet** and Profile editing.
- **Nav is now 4 tabs:** Discover · Likes · Matches · Profile.
- **No Explore or Top houses tab.** See PRODUCT → Decisions. Quick-filter chips and a "Top pick" badge (P2) cover it instead.

---

## Start working in 3 minutes
```bash
git pull
npm install
npm run dev
```
1. Open http://localhost:3000/demo in **two tabs**. Pick **Maya** in one and **David** in the other.
2. Play the loop: ♥ or → in Maya's tab, then ♥ in David's tab. You'll get a match in both tabs, and then you can chat.
   - Keys: ← → to swipe, ↑ for details, Z to undo.
   - Reset at any time: `/demo` → **Reset demo**.
3. Open **your own file** (linked at the top), and start your first task in a Devin session using the prompt in that file.

**Sandboxes:**
- `/playground` (Jazz): the deck and cards on static data, plus a "Trigger match" button
- `/kit` (Kamsi): every UI component and every color token

---

## Checkpoints
Times are relative to now (T). If the demo slot moves, move these with it.

| When | Checkpoint | Done when |
|---|---|---|
| ~~CP1~~ | ~~Foundations~~ | ✅ The scaffold, stubs, and seed are on `main` |
| ~~CP2~~ | ~~Ugly loop~~ | ✅ The full loop works in two tabs |
| **T+0:45** | **CP2.5: Direction set** | The visual direction is agreed (G1), tokens v1 are merged (K0), and the Vercel URL is live (C5a) |
| **T+2:30** | **CP3: Looks real** | Real swiping (J1), real cards with AI headlines (J2, J3, C8), match overlay (J5), core kit (K1a), Likes tab working (C7, J7), onboarding flow (K2), Matches and Chat styled (K3, K4). **Decide here:** demo on Supabase or on mock (two tabs). |
| **T+3:30** | **CP4: Feature freeze** | Bug fixes and polish only from here. Record the backup video (G4). |
| **T+4:00** | **CP5: Rehearse** | Run the demo script 3 times (G5). Reset the seed. |

---

## Tasks for everyone

### G1 · Visual direction · Jazz + Kamsi · P0 · first 30 min
Agree on the mood, color, type, and **card anatomy**. Mock up five frames in Figma: ListingCard, TenantCard, the match overlay, Matches, and Chat. Put the exports or a link in `docs/design/`.
- Jazz leads the cards and the overlay. Kamsi leads the type, color, and shell.
- **Don't copy Tinder's look** (the flame, the pink-orange gradient). Take the interaction patterns only.

**Accept:** Kamsi can write tokens v1 from it, and Jazz can build cards from it.

### G2 · Remaining open questions · whole team · 5 min
- ~~Likes grid / note with a like~~ **Decided:** we're building the Likes tab and the intro note.
- **AI fit model:** `claude-opus-5-5` at low effort is the default. If card upgrades feel slow on stage, switch to `claude-haiku-5-5`.
- ~~Onboarding references~~ **Done:** they're in `docs/design/references/onboarding/`.
- **The name needs a decision.** The reference screenshots come from an existing app called **HomeMatch**, and "Homatch" is one letter away. Judges may assume we copied it. Either own it in the pitch ("inspired by HomeMatch's filters, but two-sided"), or pick a distinct name now, before the visual direction is locked. A rename is cheap today: `APP_NAME` in `src/lib/config.ts`, the wordmark, and the README.

### G3 · Polish list · everyone · ongoing
Add one line per nit you notice at the bottom of this file, in the form `[screen] what's wrong → what it should be (who)`. Owners sweep it after CP3.

### G4 · Backup video · Coleman · at CP4
Record one clean run of the demo script (`docs/PRODUCT.md` → Demo script). If the network or the app dies on stage, play it.

### G5 · Rehearse · everyone · CP5
Run the demo script 3 times, and agree who drives which screen. Before you go on: **Reset demo**, close all other tabs, and turn on Do Not Disturb.

### G6 · Pitch frame · whoever is free first after CP4 · P1
2–3 slides or a title screen covering the problem (renting is one-way), how Homatch works, and the "never an empty deck" idea for landlords. Keep the demo as the centrepiece.

---

## Merging
- **Small PRs, merged within 15 minutes of going green.** Long-lived branches are what break hackathons.
- **Coleman is the merge captain.** He keeps `main` building and demoable.
- Before every PR: `npm run build && npm run lint`, plus the two-tab loop still works.
- **Shared files:**
  - `package.json`: announce new dependencies in the chat.
  - `src/lib/types.ts`, `api.ts`, `engine.ts`: Coleman only.
  - `src/styles/tokens.css`: Kamsi only. Jazz's deck values go in `deck.tokens.css`.
- Replacing a stub means **keeping its props exactly**. New props must be optional.
- Branch format: `jazz/j1-swipe-deck`. PR title format: `[J1] Swipe deck engine`. UI PRs need a screenshot or screen recording at 390×844.

## Working with Devin
- **One Devin session per task.** You can run about 2 at once if they touch different folders.
- Each person's file has a **ready-to-paste prompt** with your folders already filled in.
- **Review on the Vercel preview, on your phone.** Give feedback with numbers: "radius 24, not 16", "spring stiffness 500, it feels floaty", "the stamp should start at 40px".
- Pull `main` before starting each new task.

## P2 ideas (only if CP4 is safe)
- **Quick filters on Discover:** a chip row with All · Under €1,500 · Pets OK · House shares · Available now. This replaces an Explore tab.
- **"Top pick" badge** on cards with AI fit ≥ 90
- "Landlord interested" hint on a card whose landlord already liked you (the Likes tab covers this already)
- "AI write my description" on create listing
- Landlord matches filtered by listing
- A "Propose viewing" card in chat (K6)

## Polish list
_Add one line per nit: `[screen] what's wrong → what it should be (who)`_
-
