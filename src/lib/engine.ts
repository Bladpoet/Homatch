// Pure matching logic over a DbState. No I/O, no globals. Adapters load state,
// call these, then persist. Owner: Coleman. Rules: docs/CONTRACTS.md → Rules.

import { DISCOVER_MIN_FIT, TENANT_DECK_MIN_FIT } from './config';
import type { DbState } from './fixtures';
import { newId } from './format';
import { fit } from './score';
import type {
  LandlordDeckItem,
  Listing,
  Match,
  MatchSummary,
  Message,
  Profile,
  Swipe,
  SwipeInput,
  Tenant,
  TenantDeckItem,
} from './types';

export const isTenant = (p: Profile): p is Tenant => p.role === 'tenant';

export function getProfile(s: DbState, id: string): Profile {
  const p = s.profiles.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown profile ${id}`);
  return p;
}

export function getTenant(s: DbState, id: string): Tenant {
  const p = getProfile(s, id);
  if (!isTenant(p)) throw new Error(`${id} is not a tenant`);
  return p;
}

export function getListing(s: DbState, id: string): Listing {
  const l = s.listings.find((x) => x.id === id);
  if (!l) throw new Error(`Unknown listing ${id}`);
  return l;
}

const findSwipe = (s: DbState, actor: Swipe['actor'], tenantId: string, listingId: string) =>
  s.swipes.find((w) => w.actor === actor && w.tenantId === tenantId && w.listingId === listingId);

// ── Decks ────────────────────────────────────────────────────────────────

export function tenantDeck(s: DbState, tenantId: string): TenantDeckItem[] {
  const t = getTenant(s, tenantId);
  return s.listings
    .filter((l) => !findSwipe(s, 'tenant', tenantId, l.id))
    .map((l) => ({ kind: 'listing' as const, listing: l, owner: getProfile(s, l.ownerId), fit: fit(t.prefs, l) }))
    .filter((i) => i.fit.score >= TENANT_DECK_MIN_FIT)
    .sort((a, b) => b.fit.score - a.fit.score);
}

export function landlordDeck(s: DbState, listingId: string): LandlordDeckItem[] {
  const listing = getListing(s, listingId);
  const unseen = s.profiles
    .filter(isTenant)
    .filter((t) => t.onboarded && !findSwipe(s, 'landlord', t.id, listingId));

  const byFit = (a: { fit: { score: number } }, b: { fit: { score: number } }) => b.fit.score - a.fit.score;

  // Newest like first, so a like that arrives live lands on top of the deck.
  const likedAt = (tenantId: string) => findSwipe(s, 'tenant', tenantId, listingId)?.createdAt ?? '';
  const likedYou = unseen
    .filter((t) => findSwipe(s, 'tenant', t.id, listingId)?.direction === 'right')
    .map((t) => ({ kind: 'tenant' as const, tenant: t, fit: fit(t.prefs, listing), source: 'liked-you' as const }))
    .sort((a, b) => likedAt(b.tenant.id).localeCompare(likedAt(a.tenant.id)));

  const likedIds = new Set(likedYou.map((i) => i.tenant.id));
  const discover = unseen
    .filter((t) => !likedIds.has(t.id))
    // Someone who already passed on this listing can't match; don't waste the landlord's swipe.
    .filter((t) => findSwipe(s, 'tenant', t.id, listingId)?.direction !== 'left')
    .map((t) => ({ kind: 'tenant' as const, tenant: t, fit: fit(t.prefs, listing), source: 'discover' as const }))
    .filter((i) => i.fit.score >= DISCOVER_MIN_FIT)
    .sort(byFit);

  const divider: LandlordDeckItem[] = likedYou.length && discover.length ? [{ kind: 'divider' }] : [];
  return [...likedYou, ...divider, ...discover];
}

export const likeCount = (s: DbState, listingId: string) =>
  s.swipes.filter((w) => w.actor === 'tenant' && w.listingId === listingId && w.direction === 'right').length;

// ── Swiping ──────────────────────────────────────────────────────────────

/** Records (or replaces) a swipe. Creates a match when it completes a mutual right. Mutates `s`. */
export function applySwipe(s: DbState, input: SwipeInput, nowIso: string): { match?: Match; isLike: boolean } {
  const listing = getListing(s, input.listingId);
  s.swipes = s.swipes.filter(
    (w) => !(w.actor === input.actor && w.tenantId === input.tenantId && w.listingId === input.listingId),
  );
  s.swipes.push({ ...input, createdAt: nowIso });

  const isLike = input.actor === 'tenant' && input.direction === 'right';
  if (input.direction !== 'right') return { isLike };

  const other = findSwipe(s, input.actor === 'tenant' ? 'landlord' : 'tenant', input.tenantId, input.listingId);
  if (other?.direction !== 'right') return { isLike };

  const existing = s.matches.find((m) => m.tenantId === input.tenantId && m.listingId === input.listingId);
  if (existing) return { isLike };

  const match: Match = {
    id: newId('m'),
    tenantId: input.tenantId,
    listingId: input.listingId,
    landlordId: listing.ownerId,
    createdAt: nowIso,
  };
  s.matches.push(match);
  return { match, isLike };
}

/** Removes the actor's most recent swipe, and the match it created. Mutates `s`. */
export function undoLastSwipe(s: DbState, actorId: string): Swipe | undefined {
  const actor = getProfile(s, actorId);
  let idx = -1;
  s.swipes.forEach((w, i) => {
    const mine =
      actor.role === 'tenant'
        ? w.actor === 'tenant' && w.tenantId === actorId
        : w.actor === 'landlord' && getListing(s, w.listingId).ownerId === actorId;
    if (mine && (idx === -1 || w.createdAt >= s.swipes[idx].createdAt)) idx = i;
  });
  if (idx === -1) return undefined;
  const [removed] = s.swipes.splice(idx, 1);
  const m = s.matches.find((x) => x.tenantId === removed.tenantId && x.listingId === removed.listingId);
  if (m) {
    s.matches = s.matches.filter((x) => x.id !== m.id);
    s.messages = s.messages.filter((x) => x.matchId !== m.id);
  }
  return removed;
}

// ── Matches & chat ───────────────────────────────────────────────────────

export const isParty = (m: Match, userId: string) => m.tenantId === userId || m.landlordId === userId;

export function messagesFor(s: DbState, matchId: string): Message[] {
  return s.messages.filter((m) => m.matchId === matchId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function matchSummary(s: DbState, match: Match, viewerId: string): MatchSummary {
  const msgs = messagesFor(s, match.id);
  const lastMessage = msgs.at(-1);
  const lastRead = s.reads[`${match.id}:${viewerId}`];
  const unread = !!lastMessage && lastMessage.senderId !== viewerId && (!lastRead || lastRead < lastMessage.createdAt);
  return {
    match,
    listing: getListing(s, match.listingId),
    other: getProfile(s, match.tenantId === viewerId ? match.landlordId : match.tenantId),
    lastMessage,
    unread,
  };
}

/** Most recent activity first. */
export function matchesFor(s: DbState, userId: string): MatchSummary[] {
  return s.matches
    .filter((m) => isParty(m, userId))
    .map((m) => matchSummary(s, m, userId))
    .sort((a, b) =>
      (b.lastMessage?.createdAt ?? b.match.createdAt).localeCompare(a.lastMessage?.createdAt ?? a.match.createdAt),
    );
}

export function addMessage(s: DbState, matchId: string, senderId: string, body: string, nowIso: string): Message {
  const match = s.matches.find((m) => m.id === matchId);
  if (!match || !isParty(match, senderId)) throw new Error('Not your match');
  const message: Message = { id: newId('msg'), matchId, senderId, body: body.trim(), createdAt: nowIso };
  s.messages.push(message);
  s.reads[`${matchId}:${senderId}`] = nowIso;
  return message;
}
