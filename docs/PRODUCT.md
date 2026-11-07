# Homatch: product spec

## Pitch
Renting is a one-way street. Tenants send dozens of enquiries into the void, and landlords dig through an inbox of strangers. **Homatch makes it two-way.** Tenants swipe on homes and landlords swipe on tenants. Both sides only talk once both have said yes.

**What sets us apart:**
1. Landlords don't just wait for likes. Their deck starts with **renters who liked their place**, then flows into a **discovery pool** of renters whose preferences fit the listing. A landlord never hits an empty screen.
2. **AI fit** reads what people actually wrote, not just the numbers. "Works nights, so the quiet street suits her" is something a budget filter can't tell you.
3. **Both sides see who liked them.** One tap on the Likes tab turns a like into an instant match.

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

### 1. Tenant onboarding (`/onboarding/tenant`) (P0)
**Follow the references:** `docs/design/references/onboarding/` (the screenshots plus `NOTES.md`, which has the measured spec). Take their layout and interactions, not their colours.

The flow is **one "Start matching" sheet, then "About you"**, and it's almost typing-free.

**Screen 1: Start matching.** One scrolling screen of icon-labelled sections, each with sensible defaults, so it can be done in a few taps:
1. Where in Ireland? (search, then area chips by region)
2. Place type
3. Property type
4. Monthly budget (range slider)
5. Min bedrooms (Any · 1+ … 5+)
6. Min bathrooms
7. Moving in
8. Lease
9. Household
10. Pets and smoker

Selected options are filled in the accent colour with a soft shadow, and unselected ones sit on a light grey fill. The sticky footer has **Reset** and **Start matching**. "Start matching" stays disabled until at least one area is picked.

**Screen 2: About you.** Pick an avatar, then write the **intro note** (140 characters, with tappable starters like "Quiet professional, home most evenings" and "Long-term renter, great references"). It's optional and has Skip.

**Finish:** a short "Finding homes that fit you…" moment (an AI sparkle and 3 house thumbnails shuffling), then the deck.

**One component, three places:** `PreferencesForm` is the Start matching sheet in onboarding, **the Discover filter sheet** (the sliders icon in the Discover header), and Profile → Edit preferences. Changing preferences from Discover refetches the deck straight away.

Everything saves through `saveTenantPrefs()` and `saveProfile()`.

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

**AI fit on cards:** the card first shows the instant rule-based score, then quietly upgrades to the AI score:
- A small sparkle appears in the FitPill (e.g. "✦ 94% fit"), and a one-line **headline** fades in above the reason chips.
  - Tenant view: "Quiet street, garden for your plants"
  - Landlord view: "Works nights, so your quiet street suits her"
- If the AI is slow or offline, the rule-based score simply stays. Nothing ever waits on AI. See **AI fit** below.

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

### 5b. Likes (`/likes`) (P0)
Who's interested in you, and who you're waiting on. It has two tabs in a segmented control at the top, each showing its count: **Liked you (3)** and **You liked (5)**.

**Tenant view**
- **Liked you:** homes whose landlord has said yes to you, but that you haven't swiped yet.
  - Each item shows the home's photo, rent, title, "{Landlord} likes you", and the fit.
  - Tapping it opens `ListingDetail` with Pass and Interested. **Interested is an instant match**: the overlay fires straight away, because the landlord already said yes.
- **You liked:** homes you swiped right on.
  - Each one is either **Waiting** or **Matched**. Matched items show a "Message" button that opens the chat.
  - We never show "the landlord passed". It just stays as Waiting, which is kinder and the industry norm.

**Landlord view**
- **Liked you:** renters who liked any of your listings, but whom you haven't swiped for that listing yet.
  - A chip row filters by listing.
  - Tapping a renter opens `TenantDetail` with Pass and Yes. **Yes is an instant match.**
- **You liked:** renters you said yes to, marked **Waiting** or **Matched**.

**Both views**
- A **sort** control (a small pill that opens a sheet): Newest (the default), Best fit, and Price (tenant: low to high) or Budget (landlord: high to low).
- A **2-column grid** of photo tiles, with the name or rent, a fit chip, and a status chip.
- The **intro note** shows on the tile as a one-line quote, when the other person has written one.
- Empty states:
  - Liked you: "No likes yet. Keep swiping, people see you when you like them."
  - You liked: "Homes you like will wait here."
- **Live updates:** a new like animates into Liked you, and the Likes tab in the nav shows a badge with the Liked you count.

### Intro note (P1)
A short personal note (up to 140 characters) on your profile. Tenants write one to landlords during onboarding, and landlords write one to renters on their Profile.

**Who sees it:** only people **you've liked**. It shows on their Likes tile, in the detail sheet ("A note from Maya: …"), and as a quoted card at the top of a new chat. It's a personalised message without anyone having to send one.

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
Four tabs: **Discover · Likes** (badge: the Liked you count) **· Matches** (badge: unread messages or new matches) **· Profile**. The active tab gets a sliding indicator.

## AI fit (P0)
The number on every card is real. The **rule-based score** (`score.ts`) is instant and always available. **AI fit** refines it using what rules can't read: the renter's bio and intro note, and the listing's description and amenities.

**How it works**
- A server route, `POST /api/fit`, calls Claude with the tenant's preferences, bio, note and household, plus the listing and the rule-based score. It returns a `Fit` with `source: 'ai'`: a score, a headline, and 3–4 reasons.
- **The AI may move the rule score by at most ±15 points.** That keeps it sensible and consistent with the deck's ordering and filters, which stay rule-based.
- The headline is written for whoever is looking:
  - To a tenant: "Garden and quiet street, ideal for you"
  - To a landlord: "Long-term renter with references, wants exactly this"
- The client asks for the AI fit of the **top 3 cards** when the deck loads, then for the next card after each swipe, and caches every result per (tenant, listing, viewer). Cards upgrade in place.
- **Fallback:** a timeout (6s), an error, a refusal or no API key all keep the rule-based fit. The demo pair (Maya × Sunny 2-bed, in both directions) also ships with a **pre-computed AI fit in the seed**, so the key moment works even offline.

**Where it shows:** the FitPill sparkle and headline on cards, the "Why it fits" section in detail sheets, and Likes tiles.

## Decisions
- **No Explore tab, no "Top houses" tab (for now).** Tinder's Explore exists because it has millions of profiles and many dating intents. Renting has one intent, which onboarding already captures, and our seed has 12 homes, so an Explore grid would look empty. Every extra tab is screens we'd need to design and polish today. Instead:
  - **Quick filters on Discover (P2):** a scrollable chip row above the deck: All · Under €1,500 · Pets OK · House shares · Available now · Near me. Each one filters the same deck. It's cheap, uses the existing engine, and still feels like categories.
  - **"Top pick" badge (P2):** cards with AI fit of 90 or more get a small "Top pick" label. That gives us "top houses" without a separate screen.
  - Revisit Explore only after the demo, with real inventory.
- **Likes is its own tab**, separate from Matches. It answers "who's interested?", while Matches answers "who am I talking to?". Tinder splits them the same way, and it's also our clearest differentiator in the demo.

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
2. **Tenant (40s):** Show Maya's deck, with the AI headline on the top card ("Garden and quiet street, ideal for you"). Swipe left on one home. Tap a card to show the detail transition and the AI "Why it fits". Close it, then swipe right on David's listing.
   - *Optional (20s): open Sam's onboarding and tap through four steps to show how quick it is.*
3. **Landlord (30s):** David's deck now shows Maya at the top with "Likes your place" and her fit reasons. David swipes right, and **"It's a match" appears on both screens at once.**
4. **Chat (20s):** Maya taps the quick reply "Could I view it this week?", and it appears on David's side instantly. David replies.
5. **What sets us apart (30s):** David keeps swiping, reaches the divider "That's everyone who liked this place…", and continues into **Discover**: renters who fit, so he's never stuck. He swipes right on one.
6. **Likes (20s):** Maya opens **Likes → Liked you** and sees a landlord who already likes her. She taps Interested, and it's an instant match.
7. **Close (15s):** "Built today with Devin by Jazz, Kamsi, and Coleman."

**Backup:** at feature freeze, record a clean run of this script. If the network or the demo dies, play the video.

## Non-goals today
Real auth, payments, identity verification, maps, push notifications, moderation, and real image upload (pick from the seeded gallery). Don't build these. Fake them in seed data if the story needs them.

## Open questions for the team
- ~~Who liked you / a note with your like~~ **Decided:** both. The **Likes tab** (Liked you / You liked) and the **intro note** on your profile.
- **AI fit model:** the spec uses `claude-opus-5-5` at low effort. If card upgrades feel too slow on stage, switching to `claude-haiku-5-5` is a one-line change. That's the team's call.
- ~~City and currency~~ **Decided:** all of Ireland, prices in euros. See `CONTRACTS.md` → Config.
- **Name:** we're going with Homatch unless someone objects.
