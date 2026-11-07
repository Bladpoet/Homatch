// THE data entry point for all UI code. Never import adapters, Supabase or
// localStorage from components — import from here.
// Owner: Coleman. Signatures mirror docs/CONTRACTS.md → Data API.
//
// Realtime semantics (all adapters):
// - subscribe() delivers events for the given user, in THIS tab too (synchronously)
//   and in other tabs/devices. Handlers must dedupe by id (match.id / message.id).
// - swipe() also returns the match directly, so callers never need to wait for the event.

import { mockAdapter } from './adapters/mock';
import type { DataAdapter } from './adapters/types';
import { DATA_MODE } from './config';

function pickAdapter(): DataAdapter {
  // C4: if (DATA_MODE === 'supabase') return supabaseAdapter;
  if (DATA_MODE === 'supabase' && typeof window !== 'undefined') {
    console.warn('[homatch] Supabase adapter not built yet (task C4). Falling back to mock.');
  }
  return mockAdapter;
}

const adapter = pickAdapter();

export const {
  listPersonas,
  getCurrentUser,
  setCurrentUser,
  resetDemo,
  getTenant,
  saveTenantPrefs,
  getTenantDeck,
  getLandlordListings,
  getListing,
  createListing,
  getLandlordDeck,
  getLikeCount,
  swipe,
  undoLastSwipe,
  getMatches,
  getMatch,
  getMessages,
  sendMessage,
  markRead,
  subscribe,
} = adapter;
