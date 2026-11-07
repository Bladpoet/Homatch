# Homatch: contracts

This file is the source of truth for data shapes. **The UI codes against these interfaces, not against Supabase.** Coleman owns this file and `src/lib/types.ts`.

## Types (`src/lib/types.ts`)
```ts
export type Role = 'tenant' | 'landlord';
export type Direction = 'right' | 'left';

export interface Profile {
  id: string;
  role: Role;
  name: string;
  avatarUrl: string;
  bio: string;
  age?: number;
  occupation?: string;
  onboarded: boolean;
}

export interface TenantPrefs {
  budgetMin: number;        // monthly rent, whole currency units
  budgetMax: number;
  areas: string[];          // area names from config.AREAS (e.g. "Rathmines", "Galway City")
  moveInBy: string;         // ISO date
  bedroomsMin: number;
  leaseMonths: number;      // 6 | 12 | 18
  pets: boolean;
  smoker: boolean;
  householdSize: number;
}

export interface Tenant extends Profile {
  role: 'tenant';
  prefs: TenantPrefs;
}

export interface Listing {
  id: string;
  ownerId: string;
  title: string;            // "Sunny 2-bed with garden"
  photos: string[];         // at least 3
  rent: number;             // € per month
  area: string;             // one of config.AREAS
  region: string;           // county/city group, e.g. "Dublin", "Cork"
  addressLine: string;      // street-level only, e.g. "Leinster Road, Rathmines, Dublin 6"
  ber?: string;             // Irish energy rating, e.g. "B2". Shown as a small badge
  bedrooms: number;
  bathrooms: number;
  availableFrom: string;    // ISO date
  leaseMonths: number;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  furnished: boolean;
  description: string;
  amenities: string[];      // "Garden", "Washer", "Bike storage"
}

export interface Swipe {
  actor: Role;              // who swiped
  tenantId: string;
  listingId: string;        // every swipe is about a (listing, tenant) pair
  direction: Direction;
  createdAt: string;
}

export interface Match {
  id: string;
  tenantId: string;
  listingId: string;
  landlordId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface FitReason { label: string; ok: boolean }
export interface Fit { score: number; reasons: FitReason[] }   // score 0–100

export interface TenantDeckItem {
  kind: 'listing';
  listing: Listing;
  owner: Profile;
  fit: Fit;
}

export type LandlordDeckItem =
  | { kind: 'tenant'; tenant: Tenant; fit: Fit; source: 'liked-you' | 'discover' }
  | { kind: 'divider' };

export interface MatchSummary {
  match: Match;
  listing: Listing;
  other: Profile;           // the person on the other side
  lastMessage?: Message;
  unread: boolean;
}

export type AppEvent =
  | { type: 'match'; match: Match; summary: MatchSummary }
  | { type: 'message'; message: Message }
  | { type: 'like'; listingId: string; tenantId: string };  // a tenant liked a listing → refresh the landlord deck
```

## Data API (`src/lib/api.ts`)
All functions are async. The UI imports **only** from here.
```ts
// session (persona switcher)
listPersonas(): Promise<Profile[]>
getCurrentUser(): Promise<Profile | null>
setCurrentUser(profileId: string): Promise<void>
resetDemo(): Promise<void>

// tenant
getTenant(id: string): Promise<Tenant>
saveTenantPrefs(tenantId: string, prefs: TenantPrefs, profile?: Partial<Profile>): Promise<void>
getTenantDeck(tenantId: string): Promise<TenantDeckItem[]>

// landlord
getLandlordListings(landlordId: string): Promise<Listing[]>
getListing(id: string): Promise<Listing>
createListing(input: Omit<Listing, 'id'>): Promise<Listing>
getLandlordDeck(listingId: string): Promise<LandlordDeckItem[]>
getLikeCount(listingId: string): Promise<number>

// swiping
swipe(input: { actor: Role; tenantId: string; listingId: string; direction: Direction }): Promise<{ match?: MatchSummary }>
undoLastSwipe(actorId: string): Promise<void>

// matches and chat
getMatches(userId: string): Promise<MatchSummary[]>
getMessages(matchId: string): Promise<Message[]>
sendMessage(matchId: string, senderId: string, body: string): Promise<Message>
markRead(matchId: string, userId: string): Promise<void>

// realtime
subscribe(userId: string, handler: (e: AppEvent) => void): () => void   // returns unsubscribe
```

## Component contracts
C0 creates a stub for each of these, with exactly these props. Owners replace the stubs with the real components and **keep the props**. You may add optional props, but never change existing ones.
```ts
// components/deck  (Jazz)
SwipeDeck<T>: {
  items: T[];
  getKey: (item: T) => string;
  renderCard: (item: T, state: { isTop: boolean }) => React.ReactNode;
  onSwipe: (item: T, dir: Direction) => void;
  canSwipe?: (item: T) => boolean;          // false → the divider card: dismissable, but not recorded
  onRewind?: () => void;
  onOpenDetail?: (item: T) => void;
  labels: { like: string; pass: string };   // tenant "LIKE"/"NOPE", landlord "YES"/"PASS"
  emptyState: React.ReactNode;
}
DeckControls: { onPass: () => void; onLike: () => void; onRewind?: () => void; disabled?: boolean }

// components/cards  (Jazz)
ListingCard:   { listing: Listing; fit: Fit; onOpenDetail: () => void }
TenantCard:    { tenant: Tenant; fit: Fit; likedYou: boolean; onOpenDetail: () => void }
DividerCard:   { onContinue: () => void }
FitPill:       { score: number }
ListingDetail: { listing: Listing; owner: Profile; fit: Fit; open: boolean; onClose: () => void; onPass?: () => void; onLike?: () => void }
TenantDetail:  { tenant: Tenant; fit: Fit; open: boolean; onClose: () => void; onPass?: () => void; onLike?: () => void }

// components/match  (Jazz)
MatchOverlay:  { summary: MatchSummary | null; viewerRole: Role; onMessage: (matchId: string) => void; onClose: () => void }

// components/ui  (Kamsi)
Button:     React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'md' | 'lg' }
IconButton: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: 'sm' | 'md' | 'lg'; tone?: 'default' | 'like' | 'pass' }
Chip:       { children: React.ReactNode; selected?: boolean; onToggle?: () => void; tone?: 'default' | 'muted' | 'success' }
Sheet:      { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }
Avatar:     { src: string; alt: string; size?: number; ring?: boolean }
PhoneFrame: { children: React.ReactNode }
BottomNav:  { matchesBadge?: number }

// components/chat  (Kamsi)
ChatThread: { messages: Message[]; meId: string }
Composer:   { onSend: (body: string) => void; quickReplies?: string[] }
```

## Rules
- **Match:** a match exists for `(listingId, tenantId)` when there is a tenant swipe `right` **and** a landlord swipe `right` on that pair. Whichever swipe completes the pair creates the match. Both parties receive a `match` event. `swipe()` also returns the match, so the swiper can show the overlay immediately without waiting for the event.
- **Tenant deck:** listings the tenant hasn't swiped yet, sorted by `fit.score` (highest first). Hide listings with `score < 30`.
- **Landlord deck** for a listing:
  1. **liked-you:** tenants who swiped right on this listing and whom the landlord hasn't swiped yet, sorted by fit (highest first)
  2. one `{ kind: 'divider' }` item, **only if** both sections are non-empty
  3. **discover:** tenants with `fit.score >= 50` who aren't in section 1 and whom the landlord hasn't swiped for this listing, sorted by fit (highest first)
- **Undo** removes the actor's most recent swipe. If that swipe created a match, delete the match too. Demo only.

## Fit score (`src/lib/score.ts`)
`fit(prefs: TenantPrefs, listing: Listing): Fit` is a pure function used by both decks. It starts at 0 and adds the points for each criterion that passes:

| Criterion | Points | Passes when | Reason label (ok / not ok) |
|---|---|---|---|
| Budget | 35 | `rent <= budgetMax`. If it's within 10% over, give partial points (scaled). | "Within budget" / "€{amount} over budget" |
| Area | 20 | `areas.includes(listing.area)`. Give half points if the listing's `region` matches the region of any preferred area. | "In {area}" / "Elsewhere in {region}" / "Outside your areas" |
| Bedrooms | 15 | `bedrooms >= bedroomsMin` | "{n} bed" / "Fewer beds" |
| Move-in | 15 | `availableFrom <= moveInBy` | "Free from {date}" / "Available later" |
| Pets | 10 | `!pets \|\| petsAllowed` | "Pets OK" / "No pets" |
| Lease | 5 | `leaseMonths <= prefs.leaseMonths + 6` | "{n}-month lease" |

The UI shows the top 3 reasons, with `ok: true` reasons first.

## Database (`supabase/schema.sql`)
```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('tenant','landlord')),
  name text not null, avatar_url text, bio text default '',
  age int, occupation text, onboarded boolean default false,
  prefs jsonb            -- TenantPrefs, tenants only
);
create table listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  title text, photos text[], rent int, area text, address_line text,
  bedrooms int, bathrooms int, available_from date, lease_months int,
  pets_allowed boolean, smoking_allowed boolean, furnished boolean,
  description text, amenities text[]
);
create table swipes (
  id uuid primary key default gen_random_uuid(),
  actor text not null check (actor in ('tenant','landlord')),
  tenant_id uuid references profiles(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  direction text not null check (direction in ('right','left')),
  created_at timestamptz default now(),
  unique (actor, tenant_id, listing_id)
);
create table matches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references profiles(id) on delete cascade,
  listing_id uuid references listings(id) on delete cascade,
  landlord_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (tenant_id, listing_id)
);
create table messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  sender_id uuid references profiles(id),
  body text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);
alter publication supabase_realtime add table matches, messages, swipes;
```
This is a hackathon demo with only seeded, fake data, so **row-level security is off**. Say so in the README and never put real user data in it.

## Mock adapter (`src/lib/adapters/mock.ts`)
- State lives in localStorage under the key `homatch:v1`. If the key is empty, it's initialized from `seed.ts`.
- Events go through `BroadcastChannel('homatch')`, which lets the tenant tab and the landlord tab update each other live.
- The session is stored **per tab** in `sessionStorage`, so two tabs can be two different people.

## Config (`src/lib/config.ts`)
We're covering **all of Ireland**, with prices in **euros**.
```ts
export const COUNTRY = 'Ireland';
export const LOCALE = 'en-IE';
export const CURRENCY = 'EUR';   // format with Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 }) → "€1,850"
export const RENT_SUFFIX = '/mo';

// Areas are grouped by region. Onboarding shows them as chip groups under region headings.
export const REGIONS: { region: string; areas: string[] }[] = [
  { region: 'Dublin',    areas: ['Dublin City Centre', 'Rathmines', 'Ranelagh', 'Drumcondra', 'Phibsborough', 'Stoneybatter', 'Clontarf', 'Dún Laoghaire', 'Tallaght', 'Swords'] },
  { region: 'Cork',      areas: ['Cork City', 'Ballincollig', 'Douglas'] },
  { region: 'Galway',    areas: ['Galway City', 'Salthill'] },
  { region: 'Limerick',  areas: ['Limerick City', 'Castletroy'] },
  { region: 'Leinster',  areas: ['Maynooth', 'Bray', 'Kilkenny', 'Drogheda', 'Athlone'] },
  { region: 'Elsewhere', areas: ['Waterford City', 'Sligo', 'Letterkenny', 'Killarney'] },
];
export const AREAS = REGIONS.flatMap(r => r.areas);
```
Dates use the Irish format (`7 Nov`, `1 Dec 2026`). Write the copy in Irish/UK English: "flat", "neighbourhood", "bills", "viewing".

## Seed data (`src/lib/seed.ts`)
- Make prices realistic for Ireland: about €1,700–2,600 for a 1–2 bed in Dublin, €1,300–1,900 in Cork and Galway, €1,000–1,500 in smaller towns, and €650–950 for a room in a shared house. Give most listings a BER (A3–D1). Spread the listings across regions, but put about half of them in Dublin.
- **3 landlords** with 2–4 listings each, **12 listings** in total. Use real-looking photos (each designer curates their own set; check the image URLs are stable).
- **20 tenants** with varied preferences. About 8 of them should fit David's "Sunny 2-bed with garden" with a score of 50 or more.
- **Demo personas**, fully onboarded:
  - **Maya** (tenant). Her preferences fit David's listing at about 90%. She **hasn't** swiped it yet.
  - **David** (landlord). "Sunny 2-bed with garden" is in Rathmines, Dublin 6, at €2,150/mo with a BER of B2. It has **3 pre-seeded likes** from other tenants.
  - Maya's preferences: €1,800–2,300, Rathmines / Ranelagh / Drumcondra, 2 bed, moving in by 1 Dec, a 12-month lease, no pets.
  - **Sam** (a new tenant with `onboarded: false`), for showing onboarding live.
- Seed **one existing match** with a short conversation for each persona, so the Matches screen isn't empty.
