// Mock backend: localStorage for data, sessionStorage for "who am I" (so two
// tabs can be two people), BroadcastChannel for realtime between tabs.
// Works fully offline — this is also the demo fallback if the network dies.
// Owner: Coleman.

import * as engine from '../engine';
import { createSeed, SEED_VERSION, type DbState } from '../fixtures';
import { newId } from '../format';
import { fit } from '../score';
import type { AiFitInput, AppEvent, Fit, Listing } from '../types';
import type { DataAdapter } from './types';

const DATA_KEY = 'homatch:v1';
const SESSION_KEY = 'homatch:session';
const CHANNEL = 'homatch';

/** What travels between tabs. Each tab turns it into an AppEvent from its own user's point of view. */
type RawEventBody =
  | { type: 'match'; matchId: string }
  | { type: 'message'; matchId: string; messageId: string }
  | { type: 'like'; listingId: string; tenantId: string }
  | { type: 'reset' };
/** `rev` = the storage revision that contains this event's data. */
type RawEvent = RawEventBody & { rev: number };

const isBrowser = () => typeof window !== 'undefined';

// ── Storage ──────────────────────────────────────────────────────────────

let memory: DbState | null = null; // fallback when localStorage is blocked

function load(): DbState {
  if (!isBrowser()) return createSeed();
  try {
    const raw = window.localStorage.getItem(DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DbState;
      if (parsed.version === SEED_VERSION) return parsed;
    }
  } catch {
    if (memory) return memory;
  }
  const seed = createSeed();
  save(seed);
  return seed;
}

function save(s: DbState) {
  s.rev = Math.max((s.rev ?? 0) + 1, Date.now());
  memory = s;
  try {
    window.localStorage.setItem(DATA_KEY, JSON.stringify(s));
  } catch {
    /* private mode / quota — memory copy still works for this tab */
  }
}

/** Load fresh → mutate → save. Fresh load each time so two tabs never clobber each other's writes. */
function transact<T>(fn: (s: DbState) => T): T {
  const s = load();
  const result = fn(s);
  save(s);
  return result;
}

const currentRev = () => load().rev ?? 0;

/**
 * Chromium propagates localStorage between tabs asynchronously, so a BroadcastChannel
 * message can arrive BEFORE the write it announces is visible here. Wait for it.
 */
async function waitForRev(rev: number, timeoutMs = 1500) {
  const start = Date.now();
  while (currentRev() < rev && Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 20));
  }
}

const read = <T>(fn: (s: DbState) => T): T => fn(load());

// ── Events ───────────────────────────────────────────────────────────────

const localListeners = new Set<(e: RawEvent) => void>();
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (!isBrowser() || typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = async (ev: MessageEvent<RawEvent>) => {
      await waitForRev(ev.data.rev);
      localListeners.forEach((l) => {
        try {
          l(ev.data);
        } catch (err) {
          console.error('[homatch] event listener failed', err);
        }
      });
    };
  }
  return channel;
}

/** Fires in this tab (synchronously) and in every other tab. Consumers dedupe by id. */
function emit(body: RawEventBody) {
  const e: RawEvent = { ...body, rev: currentRev() };
  localListeners.forEach((l) => l(e));
  getChannel()?.postMessage(e);
}

function toAppEvent(raw: RawEvent, userId: string): AppEvent | null {
  const s = load();
  switch (raw.type) {
    case 'reset':
      return { type: 'reset' };
    case 'like': {
      const listing = s.listings.find((l) => l.id === raw.listingId);
      return listing?.ownerId === userId ? { type: 'like', listingId: raw.listingId, tenantId: raw.tenantId } : null;
    }
    case 'match': {
      const m = s.matches.find((x) => x.id === raw.matchId);
      return m && engine.isParty(m, userId) ? { type: 'match', match: m, summary: engine.matchSummary(s, m, userId) } : null;
    }
    case 'message': {
      const m = s.matches.find((x) => x.id === raw.matchId);
      const message = s.messages.find((x) => x.id === raw.messageId);
      return m && message && engine.isParty(m, userId) ? { type: 'message', message } : null;
    }
  }
}

const now = () => new Date().toISOString();

// ── AI fit (calls /api/fit; cached per tenant × listing × viewer × inputs) ──

const AI_CACHE = 'homatch:aifit:v1:';
const aiInflight = new Map<string, Promise<Fit>>();

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

async function aiFit({ tenantId, listingId, viewer }: AiFitInput): Promise<Fit> {
  const s = load();
  const t = engine.getTenant(s, tenantId);
  const l = engine.getListing(s, listingId);
  const rules = fit(t.prefs, l);

  const seeded = s.aiFits?.[`${viewer}:${tenantId}:${listingId}`];
  if (seeded) return seeded;
  if (!isBrowser()) return rules;

  const key = `${AI_CACHE}${viewer}:${tenantId}:${listingId}:${hash(JSON.stringify([t.prefs, t.bio, t.introNote, l.description, l.rent]))}`;
  try {
    const cached = window.localStorage.getItem(key);
    if (cached) return JSON.parse(cached) as Fit;
  } catch {
    /* ignore */
  }
  const pending = aiInflight.get(key);
  if (pending) return pending;

  const request = (async () => {
    try {
      const res = await fetch('/api/fit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          viewer,
          tenant: { name: t.name, prefs: t.prefs, bio: t.bio, occupation: t.occupation, introNote: t.introNote },
          listing: l,
          rules,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return rules;
      const result = (await res.json()) as Fit;
      if (result.source === 'ai') {
        try {
          window.localStorage.setItem(key, JSON.stringify(result));
        } catch {
          /* quota */
        }
      }
      return result;
    } catch {
      return rules;
    } finally {
      aiInflight.delete(key);
    }
  })();
  aiInflight.set(key, request);
  return request;
}

// ── Adapter ──────────────────────────────────────────────────────────────

export const mockAdapter: DataAdapter = {
  async listPersonas() {
    return read((s) => s.profiles);
  },

  async getCurrentUser() {
    if (!isBrowser()) return null;
    const id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) return null;
    return read((s) => s.profiles.find((p) => p.id === id) ?? null);
  },

  async setCurrentUser(profileId) {
    if (!isBrowser()) return;
    if (profileId) window.sessionStorage.setItem(SESSION_KEY, profileId);
    else window.sessionStorage.removeItem(SESSION_KEY);
  },

  async resetDemo() {
    save(createSeed());
    emit({ type: 'reset' });
  },

  async saveProfile(id, patch) {
    transact((s) => {
      Object.assign(engine.getProfile(s, id), patch);
    });
  },

  async getTenant(id) {
    return read((s) => engine.getTenant(s, id));
  },

  async saveTenantPrefs(tenantId, prefs, profile) {
    transact((s) => {
      const t = engine.getTenant(s, tenantId);
      Object.assign(t, profile ?? {}, { prefs, onboarded: true, role: 'tenant' });
    });
  },

  async getTenantDeck(tenantId) {
    return read((s) => engine.tenantDeck(s, tenantId));
  },

  async getLandlordListings(landlordId) {
    return read((s) => s.listings.filter((l) => l.ownerId === landlordId));
  },

  async getListing(id) {
    return read((s) => engine.getListing(s, id));
  },

  async createListing(input) {
    const listing: Listing = { ...input, id: newId('l') };
    transact((s) => s.listings.push(listing));
    return listing;
  },

  async getLandlordDeck(listingId) {
    return read((s) => engine.landlordDeck(s, listingId));
  },

  async getLikeCount(listingId) {
    return read((s) => engine.likeCount(s, listingId));
  },

  async swipe(input) {
    const { match, isLike } = transact((s) => engine.applySwipe(s, input, now()));
    if (isLike) emit({ type: 'like', listingId: input.listingId, tenantId: input.tenantId });
    if (!match) return {};
    emit({ type: 'match', matchId: match.id });
    const swiperId = input.actor === 'tenant' ? input.tenantId : match.landlordId;
    return { match: read((s) => engine.matchSummary(s, match, swiperId)) };
  },

  async undoLastSwipe(actorId) {
    transact((s) => engine.undoLastSwipe(s, actorId));
  },

  async getMatches(userId) {
    return read((s) => engine.matchesFor(s, userId));
  },

  async getMatch(matchId, viewerId) {
    return read((s) => {
      const m = s.matches.find((x) => x.id === matchId);
      if (!m) throw new Error(`Unknown match ${matchId}`);
      return engine.matchSummary(s, m, viewerId);
    });
  },

  async getMessages(matchId) {
    return read((s) => engine.messagesFor(s, matchId));
  },

  async sendMessage(matchId, senderId, body) {
    const message = transact((s) => engine.addMessage(s, matchId, senderId, body, now()));
    emit({ type: 'message', matchId, messageId: message.id });
    return message;
  },

  async markRead(matchId, userId) {
    transact((s) => {
      s.reads[`${matchId}:${userId}`] = now();
    });
  },

  getAiFit: aiFit,

  subscribe(userId, handler) {
    getChannel();
    const listener = (raw: RawEvent) => {
      const e = toAppEvent(raw, userId);
      if (e) handler(e);
    };
    localListeners.add(listener);
    return () => {
      localListeners.delete(listener);
    };
  },
};
