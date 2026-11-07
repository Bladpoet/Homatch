'use client';
// Jazz's sandbox. Build the deck, cards and match overlay here in isolation,
// on static seed data — nothing here writes to the demo data.
import { useMemo, useState } from 'react';
import { DividerCard } from '@/components/cards/DividerCard';
import { ListingCard } from '@/components/cards/ListingCard';
import { TenantCard } from '@/components/cards/TenantCard';
import { SwipeDeck } from '@/components/deck/SwipeDeck';
import { MatchOverlay } from '@/components/match/MatchOverlay';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { landlordDeck, matchSummary, tenantDeck } from '@/lib/engine';
import { createSeed } from '@/lib/fixtures';
import type { LandlordDeckItem, MatchSummary, Role, TenantDeckItem } from '@/lib/types';

type Item = TenantDeckItem | LandlordDeckItem;
const keyOf = (i: Item) => (i.kind === 'listing' ? i.listing.id : i.kind === 'tenant' ? i.tenant.id : 'divider');

export default function Playground() {
  const seed = useMemo(() => createSeed(), []);
  const [mode, setMode] = useState<Role>('tenant');
  const initial = useMemo<Item[]>(
    () => (mode === 'tenant' ? tenantDeck(seed, 'p-maya') : landlordDeck(seed, 'l-sunny')),
    [mode, seed],
  );
  const [items, setItems] = useState<Item[]>(initial);
  const [gone, setGone] = useState<Item[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [match, setMatch] = useState<MatchSummary | null>(null);

  const switchMode = (m: Role) => {
    setMode(m);
    setItems(m === 'tenant' ? tenantDeck(seed, 'p-maya') : landlordDeck(seed, 'l-sunny'));
    setGone([]);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-2 overflow-x-auto px-3 py-2">
        <Chip selected={mode === 'tenant'} onToggle={() => switchMode('tenant')}>Tenant deck</Chip>
        <Chip selected={mode === 'landlord'} onToggle={() => switchMode('landlord')}>Landlord deck</Chip>
        <Button size="sm" variant="secondary" onClick={() => setMatch(matchSummary(seed, seed.matches[0], mode === 'tenant' ? 'p-maya' : 'p-ciaran'))}>
          Trigger match
        </Button>
      </header>
      <SwipeDeck<Item>
        items={items}
        getKey={keyOf}
        labels={mode === 'tenant' ? { like: 'LIKE', pass: 'NOPE' } : { like: 'YES', pass: 'PASS' }}
        canSwipe={(i) => i.kind !== 'divider'}
        onSwipe={(item, dir) => {
          setItems((xs) => xs.filter((x) => x !== item));
          setGone((g) => [...g, item]);
          setLog((l) => [`${dir} · ${keyOf(item)}`, ...l].slice(0, 3));
        }}
        onRewind={
          gone.length
            ? () => {
                const last = gone[gone.length - 1];
                setGone((g) => g.slice(0, -1));
                setItems((xs) => [last, ...xs]);
              }
            : undefined
        }
        onOpenDetail={(i) => setLog((l) => [`detail · ${keyOf(i)}`, ...l].slice(0, 3))}
        renderCard={(i) =>
          i.kind === 'listing' ? (
            <ListingCard listing={i.listing} fit={i.fit} onOpenDetail={() => {}} />
          ) : i.kind === 'tenant' ? (
            <TenantCard tenant={i.tenant} fit={i.fit} likedYou={i.source === 'liked-you'} onOpenDetail={() => {}} />
          ) : (
            <DividerCard onContinue={() => setItems((xs) => xs.filter((x) => x !== i))} />
          )
        }
        emptyState={<Button onClick={() => switchMode(mode)}>Refill deck</Button>}
      />
      <p className="h-6 shrink-0 truncate px-4 pb-2 text-caption text-ink-subtle">{log.join('   ')}</p>
      <MatchOverlay summary={match} viewerRole={mode} onClose={() => setMatch(null)} onMessage={() => setMatch(null)} />
    </div>
  );
}
