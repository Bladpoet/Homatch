// Source of truth for data shapes. Mirrors docs/CONTRACTS.md.
// Owner: Coleman. Adding OPTIONAL fields is fine; anything else goes through Coleman.

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
  /** ≤140 chars. Shown only to people this user has liked. */
  introNote?: string;
}

export interface TenantPrefs {
  budgetMin: number; // € per month
  budgetMax: number;
  areas: string[]; // from config.AREAS
  moveInBy: string; // ISO date
  bedroomsMin: number;
  leaseMonths: number; // 6 | 12 | 18
  pets: boolean;
  smoker: boolean;
  householdSize: number;
  /** Optional filters from the Start matching sheet. undefined = Any. */
  bathroomsMin?: number;
  placeType?: 'whole' | 'room';
  propertyType?: 'house' | 'apartment';
}

export interface Tenant extends Profile {
  role: 'tenant';
  prefs: TenantPrefs;
}

export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  photos: string[];
  rent: number; // € per month
  area: string; // one of config.AREAS
  region: string; // e.g. "Dublin", "Cork"
  addressLine: string;
  ber?: string; // Irish energy rating, e.g. "B2"
  bedrooms: number;
  bathrooms: number;
  availableFrom: string; // ISO date
  leaseMonths: number;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  furnished: boolean;
  description: string;
  amenities: string[];
  propertyType?: 'house' | 'apartment';
  /** A room in a house share rather than a whole place. */
  isRoom?: boolean;
}

export interface Swipe {
  actor: Role;
  tenantId: string;
  listingId: string;
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

export interface FitReason {
  label: string;
  ok: boolean;
}
export interface Fit {
  score: number; // 0–100
  reasons: FitReason[]; // ok first, then by importance
  /** undefined/'rules' = instant rule score; 'ai' = refined by /api/fit */
  source?: 'rules' | 'ai';
  /** AI one-liner (≤60 chars), written for whoever is looking */
  headline?: string;
}

export type AiFitInput = { tenantId: string; listingId: string; viewer: Role };

/** One like on the Likes tab, always about a (listing, tenant) pair. */
export interface LikeItem {
  id: string; // `${listingId}:${tenantId}`
  listing: Listing;
  tenant: Tenant;
  /** The person on the other side: the landlord for tenants, the renter for landlords. */
  other: Profile;
  fit: Fit;
  at: string;
  status: 'waiting' | 'matched';
  matchId?: string;
  /** The other side's intro note — only present when THEY liked you. */
  note?: string;
}
export interface Likes {
  likedYou: LikeItem[];
  youLiked: LikeItem[];
}

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
  other: Profile; // the person on the other side, from the viewer's perspective
  lastMessage?: Message;
  unread: boolean;
}

export type AppEvent =
  | { type: 'match'; match: Match; summary: MatchSummary }
  | { type: 'message'; message: Message }
  /** A like landed. by 'tenant' (default) → sent to the landlord; by 'landlord' → sent to the tenant. */
  | { type: 'like'; listingId: string; tenantId: string; by?: Role }
  | { type: 'reset' }; // demo data was reset; refetch everything

export interface SwipeInput {
  actor: Role;
  tenantId: string;
  listingId: string;
  direction: Direction;
}
