# Homatch: product spec

## Pitch
Renting is a one-way street. Tenants send dozens of enquiries into the void, and landlords dig through an inbox of strangers. **Homatch makes it two-way.** Tenants swipe on homes and landlords swipe on tenants. Both sides only talk once both have said yes.

**What sets us apart:** landlords don't just wait for likes. Their deck starts with **renters who liked their place**, then flows into a **discovery pool** of renters whose preferences fit the listing. A landlord never hits an empty screen.

## Roles
- **Tenant**: someone looking for a place. Sets preferences once and swipes on listings.
- **Landlord**: anyone with a place to fill. That covers landlords, agents, and tenants subletting or replacing a roommate; in the UI they're all just "landlord". They own one or more listings and swipe on tenants **per listing**.

## Core loop
1. A tenant onboards with their preferences: budget, areas, move-in date, bedrooms, lease length, pets, smoking, household size, photo, and bio.
2. The tenant swipes on listings, ranked by **fit** (see `CONTRACTS.md` → Fit score).
3. A landlord picks one of their listings and swipes on renters: **Likes you** first, then a divider card, then **Discover**.
4. When both sides swipe right on the same (listing, tenant) pair, it's a **match**. Both screens show the match overlay in real time.
5. Matched users chat. They keep swiping if they want.

A match can complete from either side. If the landlord swipes right on a renter from Discover first, it becomes a match when that renter later swipes right on the listing.

## Screens

### 0. `/demo`: persona picker
Our stand-in for login. It shows a grid of seeded personas with a role tag (Tenant/Landlord) and a **Reset demo** button. Picking a persona goes to `/discover`, or to onboarding if that persona hasn't finished it.

### 1. Tenant onboarding (`/onboarding/tenant`)
One question per screen, big tappable chips, a progress bar at the top, and Back/Continue. Steps slide horizontally.
1. Budget: a dual-handle range slider with live values
2. Areas: multi-select chips across Ireland, grouped under region headings (Dublin, Cork, Galway, …), plus an "Anywhere in {region}" chip for each region
3. Move-in date and lease length (chips: 6 / 12 / 18+ months)
4. Household: number of people, pets (yes/no), smoker (yes/no)
5. Photo and a one-line bio ("Product designer, quiet, plants everywhere")

It ends on a short "Finding homes that fit you…" moment, then the deck.

### 2. Landlord onboarding / create listing (`/onboarding/landlord`) (P2)
A stepper: photos (pick from a seeded gallery for the demo), basics (title, area, beds/baths, furnished), rent and dates, rules (pets, smoking), and description. Stretch goal: an "AI write my description" button.

### 3. Discover: the deck (`/discover`)
**Tenant view:** a stack of `ListingCard`s.
- A full-bleed photo with segmented progress bars at the top. Tap the left or right half to go to the previous or next photo.
- A bottom gradient with the rent ("€2,150/mo"), the title, area · beds · baths, the available date, and a small BER badge (e.g. "B2")
- A `FitPill` (e.g. "92% fit") and 2–3 **reason chips** ("Within budget", "Pets OK", "Free from Dec 1"). A failed reason shows muted, not red.
- Tapping the info area opens `ListingDetail`.
- Controls: **Pass** (×), **Rewind** (↺, small), **Interested** (♥). Info (i) sits on the card.

**Landlord view:** the header has a **listing switcher** (a pill with the listing thumbnail and title, and a ▾ that opens a sheet with the other listings). Below it is a stack of `TenantCard`s:
- Photo, name, age, occupation
- Budget range, move-in date, household ("2 people · no pets")
- A **"Likes your place"** badge when `source === 'liked-you'`
- `FitPill` and reason chips, computed against the active listing
- After the last liked-you card comes a `DividerCard`: *"That's everyone who liked this place. Here are renters who'd fit it."* Discover cards follow.

**Empty state:** an illustration or icon plus copy. Tenant: "You've seen every home that fits. Widen your budget or areas?" with a button to Profile. Landlord: "No more renters right now. We'll let you know when someone likes this place."

### 4. Detail sheets
- **`ListingDetail`:** the card expands into a full-screen sheet (shared-element transition from the card photo). It shows a photo gallery, specs grid, amenities chips, description, the landlord mini-profile, and fit reasons. Swiping down dismisses it, and Pass/Interested stay pinned at the bottom.
- **`TenantDetail`:** the same pattern. It shows a bigger photo, bio, all preferences, and the "why they fit" reasons.

### 5. Match overlay
It's global, mounted in `(app)/layout.tsx` and triggered by the API `match` event, so it fires for **both** users at once. It shows:
- A blurred, dimmed backdrop
- Two circles that slide in from the sides and overlap: the tenant's photo and the listing's first photo
- The headline "It's a match", with the subline "{Name} and {Listing title}"
- A primary button, **Send a message** (goes to the chat), and a secondary one, **Keep swiping**

### 6. Matches (`/matches`)
- **A New matches row**: a horizontal scroll of avatars (tenants see the listing photo, landlords see the tenant photo) for matches with no messages yet
- **A Conversations list**: avatar, name, listing title (small), last message preview, relative time, and an unread dot
- Landlords: a small filter chip row by listing (P2)
- Empty state: "No matches yet. Keep swiping."

### 7. Chat (`/chat/[matchId]`)
- A header with a back button, the other party's avatar and name, and a listing thumbnail chip. Tapping the chip opens the detail sheet.
- Bubbles: mine on the right in the accent color, theirs on the left in the surface color. Consecutive bubbles group, with timestamps on groups.
- On an empty thread, **quick replies** appear above the composer:
  - Tenant: "Is it still available?" · "Could I view it this week?" · "Are bills included?"
  - Landlord: "When would you like to move in?" · "Want to come for a viewing?" · "Tell me a bit about yourself"
- A composer with an auto-growing input. The send button scales in when the input has text.
- Realtime: new messages animate in (they fade and rise 8px).
- Stretch goal: a **Propose viewing** action that sends a structured card with a date and time and Accept/Decline buttons.

### 8. Profile (`/profile`)
- Tenant: edit preferences, reusing the onboarding controls in a single scroll
- Landlord: a "My listings" list with like counts. "Add listing" goes to landlord onboarding.

### Bottom nav
Discover · Matches (with a badge for unread or new matches) · Profile. The active tab gets a sliding indicator.

## Interaction spec
These are the shared motion values. Use the motion tokens in `tokens.css`, which should match these.

**Swipe deck**
- The drag follows the pointer 1:1 on both axes. Rotation is `x / 20` degrees, clamped to ±15°.
- Stamps: **LIKE / NOPE** for tenants and **YES / PASS** for landlords. Their opacity is `clamp(|x| / 100, 0, 1)` and they tilt with the card.
- **Commit** when `|x| > 120px` **or** `|velocity.x| > 600px/s`. The card flies out with its current velocity to ±1.5× the viewport width, taking about 250ms.
- Below that threshold, the card springs back to center (`stiffness: 400, damping: 30`).
- The next card waits underneath at `scale: 0.95, y: 8`. As the top card is dragged it interpolates toward `scale: 1, y: 0` (progress = `|x| / 120`, clamped).
- Only the top 3 cards render. Preload the photos of the next 2.
- Buttons trigger the same fly-out animation (with a ±10° rotation). Buttons scale to 0.92 on press.
- **Keyboard:** ← pass, → like, ↑ or Space opens detail, Z or Backspace rewinds. This matters for the laptop demo.
- **Rewind:** the last card flies back in from the side it left on, using the same spring.
- **Haptics:** call `navigator.vibrate(10)` on commit and `[30, 50, 30]` on a match, but only if the browser supports it.
- **Reduced motion:** skip rotation and fly-out. Cards crossfade instead, over 150ms.

**Photo carousel:** tapping the left or right half changes the photo instantly (no slide) and updates the segment bar. At either end, the card does a 4px nudge.

**Sheets:** they open with a spring (`stiffness: 300, damping: 30`). Drag down to dismiss: if the drag is more than 25% of the height or the velocity is above 500px/s, the sheet closes. Otherwise it springs back.

**Match overlay:** the backdrop fades in over 200ms. The circles spring in from x = ±120px with a 60ms stagger. The headline scales from 0.9 to 1 and fades in, delayed 150ms.

**General**
- Page transitions in the shell are a fade plus a 4px rise over 180ms. Don't animate the nav itself.
- Buttons press to 0.97 (0.92 for the round deck controls). The hover state only applies on devices with a real pointer (`@media (hover: hover)`).
- Lists load with skeletons, never spinners.

## Demo script (about 2.5 minutes)
**Setup:** a laptop with two browser windows side by side. Left: tenant **Maya**. Right: landlord **David**, with the listing *"Sunny 2-bed with garden"* (Rathmines, Dublin 6, €2,150/mo) active. It has 3 pre-seeded likes. If Supabase is live, use a phone for Maya instead, which is more impressive.

1. **Hook (15s):** "Renting is a one-way street. Homatch makes it two-way."
2. **Tenant (40s):** Show Maya's preferences (already completed). Swipe left on one home. Tap a card to show the detail transition and fit reasons. Close it, then swipe right on David's listing.
3. **Landlord (30s):** David's deck now shows Maya at the top with "Likes your place" and her fit reasons. David swipes right, and **"It's a match" appears on both screens at once.**
4. **Chat (20s):** Maya taps the quick reply "Could I view it this week?", and it appears on David's side instantly. David replies.
5. **What sets us apart (30s):** David keeps swiping, reaches the divider "That's everyone who liked this place…", and continues into **Discover**: renters who fit, so he's never stuck. He swipes right on one.
6. **Close (15s):** "Built today with Devin by Jazz, Kamsi, and Coleman."

**Backup:** at feature freeze, record a clean run of this script. If the network or the demo dies, play the video.

## Non-goals today
Real auth, payments, identity verification, maps, push notifications, moderation, and real image upload (pick from the seeded gallery). Don't build these. Fake them in seed data if the story needs them.

## Open questions for the team
- **The "page where you see your matches"** from the original brief: we've interpreted it as the **Matches** screen (new matches plus conversations). The part about *"completing someone that you like … with a random person"* didn't come through clearly in the dictation. Possible meanings: (a) a tenant can see **who liked them** (a "Likes you" grid), or (b) a "send a note with your like" action (a super-like). Decide which, if either, and add it as a P2 task.
- ~~City and currency~~ **Decided:** all of Ireland, prices in euros. See `CONTRACTS.md` → Config.
- **Name:** we're going with Homatch unless someone objects.
