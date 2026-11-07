import type {
  AppEvent,
  LandlordDeckItem,
  Listing,
  MatchSummary,
  Message,
  Profile,
  SwipeInput,
  Tenant,
  TenantDeckItem,
  TenantPrefs,
} from '../types';

/**
 * Every data backend implements exactly this. The UI never sees it directly —
 * it imports the functions re-exported from src/lib/api.ts.
 * Mirrors docs/CONTRACTS.md → Data API.
 */
export interface DataAdapter {
  // session (persona switcher)
  listPersonas(): Promise<Profile[]>;
  getCurrentUser(): Promise<Profile | null>;
  setCurrentUser(profileId: string | null): Promise<void>;
  resetDemo(): Promise<void>;

  // tenant
  getTenant(id: string): Promise<Tenant>;
  saveTenantPrefs(tenantId: string, prefs: TenantPrefs, profile?: Partial<Profile>): Promise<void>;
  getTenantDeck(tenantId: string): Promise<TenantDeckItem[]>;

  // landlord
  getLandlordListings(landlordId: string): Promise<Listing[]>;
  getListing(id: string): Promise<Listing>;
  createListing(input: Omit<Listing, 'id'>): Promise<Listing>;
  getLandlordDeck(listingId: string): Promise<LandlordDeckItem[]>;
  getLikeCount(listingId: string): Promise<number>;

  // swiping
  swipe(input: SwipeInput): Promise<{ match?: MatchSummary }>;
  undoLastSwipe(actorId: string): Promise<void>;

  // matches & chat
  getMatches(userId: string): Promise<MatchSummary[]>;
  getMatch(matchId: string, viewerId: string): Promise<MatchSummary>;
  getMessages(matchId: string): Promise<Message[]>;
  sendMessage(matchId: string, senderId: string, body: string): Promise<Message>;
  markRead(matchId: string, userId: string): Promise<void>;

  // realtime
  subscribe(userId: string, handler: (e: AppEvent) => void): () => void;
}
