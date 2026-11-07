'use client';
// Discover = the deck. Owner: Coleman (wiring). Cards/deck come from Jazz.
// Swipes are OPTIMISTIC: the card leaves immediately, the API call runs behind it.
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { DividerCard } from '@/components/cards/DividerCard';
import { ListingCard } from '@/components/cards/ListingCard';
import { ListingDetail } from '@/components/cards/ListingDetail';
import { TenantCard } from '@/components/cards/TenantCard';
import { TenantDetail } from '@/components/cards/TenantDetail';
import { SwipeDeck } from '@/components/deck/SwipeDeck';
import { Sheet } from '@/components/ui/Sheet';
import { cx } from '@/components/ui/cx';
import { getLandlordDeck, getLandlordListings, getLikeCount, getTenantDeck, swipe, undoLastSwipe } from '@/lib/api';
import { formatRent } from '@/lib/format';
import { useAppEvents, useAsync } from '@/lib/hooks';
import { useUser } from '@/lib/session';
import type { Direction, LandlordDeckItem, Listing, Profile, TenantDeckItem } from '@/lib/types';

export default function DiscoverPage() {
  const user = useUser();
  return user.role === 'tenant' ? <TenantDiscover user={user} /> : <LandlordDiscover user={user} />;
}

// ── Tenant ───────────────────────────────────────────────────────────────

function TenantDiscover({ user }: { user: Profile }) {
  const deck = useAsync(() => getTenantDeck(user.id), [user.id]);
  const [history, setHistory] = useState<TenantDeckItem[]>([]);
  const [detail, setDetail] = useState<TenantDeckItem | null>(null);
  const items = deck.data ?? [];

  useAppEvents(user.id, (e) => {
    if (e.type === 'reset') {
      setHistory([]);
      void deck.reload();
    }
  });

  const { setData, reload } = deck;
  const onSwipe = useCallback(
    (item: TenantDeckItem, direction: Direction) => {
      // Filter by id, not identity: a refetch may have replaced the objects mid-animation.
      setData((prev = []) => prev.filter((i) => i.listing.id !== item.listing.id));
      setHistory((h) => [...h, item]);
      navigator.vibrate?.(10);
      swipe({ actor: 'tenant', tenantId: user.id, listingId: item.listing.id, direction }).catch(() => reload());
    },
    [setData, reload, user.id],
  );

  const onRewind = async () => {
    const last = history.at(-1);
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setData((prev = []) => [last, ...prev]);
    await undoLastSwipe(user.id);
  };

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between px-4">
        <Wordmark />
        <Link href="/profile" aria-label="Your preferences" className="flex size-11 items-center justify-center rounded-full text-ink-muted">
          <SlidersHorizontal size={22} />
        </Link>
      </header>
      {deck.loading && !deck.data ? (
        <DeckSkeleton />
      ) : (
        <SwipeDeck
          items={items}
          getKey={(i) => i.listing.id}
          labels={{ like: 'LIKE', pass: 'NOPE' }}
          onSwipe={onSwipe}
          onRewind={history.length ? onRewind : undefined}
          onOpenDetail={setDetail}
          renderCard={(i) => <ListingCard listing={i.listing} fit={i.fit} onOpenDetail={() => setDetail(i)} />}
          emptyState={
            <Empty
              title="You've seen every home that fits"
              body="Widen your budget or areas to see more."
              action={
                <Link href="/profile" className="inline-flex h-11 items-center rounded-button border border-line bg-surface px-5 font-semibold">
                  Edit preferences
                </Link>
              }
            />
          }
        />
      )}
      {detail && (
        <ListingDetail
          open
          listing={detail.listing}
          owner={detail.owner}
          fit={detail.fit}
          onClose={() => setDetail(null)}
          onPass={() => {
            setDetail(null);
            onSwipe(detail, 'left');
          }}
          onLike={() => {
            setDetail(null);
            onSwipe(detail, 'right');
          }}
        />
      )}
    </>
  );
}

// ── Landlord ─────────────────────────────────────────────────────────────

const keyOf = (i: LandlordDeckItem) => (i.kind === 'divider' ? 'divider' : i.tenant.id);

function LandlordDiscover({ user }: { user: Profile }) {
  const listings = useAsync(() => getLandlordListings(user.id), [user.id]);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const activeId = pickedId ?? listings.data?.[0]?.id ?? null;
  const active = listings.data?.find((l) => l.id === activeId);

  const deck = useAsync(() => (activeId ? getLandlordDeck(activeId) : Promise.resolve([])), [activeId]);
  const [history, setHistory] = useState<LandlordDeckItem[]>([]);
  const [detail, setDetail] = useState<LandlordDeckItem | null>(null);
  const [switching, setSwitching] = useState(false);
  const items = deck.data ?? [];

  useAppEvents(user.id, (e) => {
    // A renter just liked the listing we're looking at → they jump to the top.
    if (e.type === 'like' && e.listingId === activeId) void deck.reload();
    if (e.type === 'reset') {
      setHistory([]);
      void listings.reload();
      void deck.reload();
    }
  });

  const { setData, reload } = deck;
  const onSwipe = useCallback(
    (item: LandlordDeckItem, direction: Direction) => {
      setData((prev = []) => prev.filter((i) => keyOf(i) !== keyOf(item)));
      setHistory((h) => [...h, item]);
      if (item.kind === 'divider' || !activeId) return; // the divider is never recorded
      navigator.vibrate?.(10);
      swipe({ actor: 'landlord', tenantId: item.tenant.id, listingId: activeId, direction }).catch(() => reload());
    },
    [setData, reload, activeId],
  );

  const onRewind = async () => {
    const last = history.at(-1);
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setData((prev = []) => [last, ...prev]);
    if (last.kind !== 'divider') await undoLastSwipe(user.id);
  };

  const pick = (id: string) => {
    setPickedId(id);
    setHistory([]);
    setSwitching(false);
  };

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 px-4">
        <button
          type="button"
          onClick={() => setSwitching(true)}
          disabled={!active}
          className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-chip bg-surface-2 pr-3 pl-1"
        >
          {active && (
            <span className="relative size-8 shrink-0 overflow-hidden rounded-full">
              <Image src={active.photos[0]} alt="" fill sizes="64px" className="object-cover" />
            </span>
          )}
          <span className="truncate text-label font-semibold">{active?.title ?? 'Your listings'}</span>
          <ChevronDown size={18} className="ml-auto shrink-0 text-ink-muted" />
        </button>
      </header>
      {deck.loading && !deck.data ? (
        <DeckSkeleton />
      ) : (
        <SwipeDeck
          items={items}
          getKey={keyOf}
          labels={{ like: 'YES', pass: 'PASS' }}
          canSwipe={(i) => i.kind !== 'divider'}
          onSwipe={onSwipe}
          onRewind={history.length ? onRewind : undefined}
          onOpenDetail={(i) => i.kind !== 'divider' && setDetail(i)}
          renderCard={(i) =>
            i.kind === 'divider' ? (
              <DividerCard onContinue={() => onSwipe(i, 'right')} />
            ) : (
              <TenantCard tenant={i.tenant} fit={i.fit} likedYou={i.source === 'liked-you'} onOpenDetail={() => setDetail(i)} />
            )
          }
          emptyState={
            <Empty title="No more renters right now" body="We'll show you new people as soon as someone likes this place." />
          }
        />
      )}
      {detail && detail.kind !== 'divider' && (
        <TenantDetail
          open
          tenant={detail.tenant}
          fit={detail.fit}
          onClose={() => setDetail(null)}
          onPass={() => {
            setDetail(null);
            onSwipe(detail, 'left');
          }}
          onLike={() => {
            setDetail(null);
            onSwipe(detail, 'right');
          }}
        />
      )}
      <ListingSwitcher open={switching} listings={listings.data ?? []} activeId={activeId} onPick={pick} onClose={() => setSwitching(false)} />
    </>
  );
}

function ListingSwitcher({
  open,
  listings,
  activeId,
  onPick,
  onClose,
}: {
  open: boolean;
  listings: Listing[];
  activeId: string | null;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const counts = useAsync(
    () => (open ? Promise.all(listings.map((l) => getLikeCount(l.id))) : Promise.resolve([] as number[])),
    [open, listings.length],
  );
  return (
    <Sheet open={open} onClose={onClose} title="Your listings">
      <ul className="p-2">
        {listings.map((l, idx) => (
          <li key={l.id}>
            <button
              type="button"
              onClick={() => onPick(l.id)}
              className={cx('flex w-full items-center gap-3 rounded-card p-2 text-left', l.id === activeId && 'bg-surface-2')}
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-input">
                <Image src={l.photos[0]} alt="" fill sizes="112px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-semibold">{l.title}</span>
                <span className="block text-caption text-ink-muted">
                  {l.area} · {formatRent(l.rent)}
                </span>
              </span>
              {counts.data?.[idx] ? (
                <span className="rounded-chip bg-like/12 px-2 py-0.5 text-caption font-bold text-like">{counts.data[idx]} likes</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <div className="px-4">
        <Link
          href="/onboarding/landlord"
          className="flex h-14 w-full items-center justify-center rounded-button border border-line bg-surface font-semibold"
        >
          Add a listing
        </Link>
      </div>
    </Sheet>
  );
}

// ── Bits ─────────────────────────────────────────────────────────────────

function Wordmark() {
  return <span className="text-title font-extrabold tracking-tight text-accent">homatch</span>;
}

function DeckSkeleton() {
  return (
    <div className="relative min-h-0 flex-1">
      <div className="absolute inset-x-3 top-1 bottom-20 animate-pulse rounded-card bg-surface-2" />
    </div>
  );
}

function Empty({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className={cx('flex max-w-[30ch] flex-col items-center gap-3')}>
      <h2 className="text-title font-semibold">{title}</h2>
      <p className="text-body text-ink-muted">{body}</p>
      {action}
    </div>
  );
}
