'use client';
// Likes: who's interested in you (Liked you) and who you're waiting on (You liked).
// Liking back from Liked you is an instant match — the other side already said yes.
import { ArrowDownUp, Check } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { LikeTile } from '@/components/cards/LikeTile';
import { ListingDetail } from '@/components/cards/ListingDetail';
import { TenantDetail } from '@/components/cards/TenantDetail';
import { Segmented } from '@/components/ui/Segmented';
import { Sheet } from '@/components/ui/Sheet';
import { cx } from '@/components/ui/cx';
import { getLandlordListings, getLikes, swipe } from '@/lib/api';
import { useAppEvents, useAsync } from '@/lib/hooks';
import { useUser } from '@/lib/session';
import type { Direction, LikeItem } from '@/lib/types';

type Tab = 'likedYou' | 'youLiked';
type Sort = 'newest' | 'fit' | 'price';

export default function LikesPage() {
  const user = useUser();
  const router = useRouter();
  const reduce = useReducedMotion();
  const isTenant = user.role === 'tenant';
  const [tab, setTab] = useState<Tab>('likedYou');
  const [sort, setSort] = useState<Sort>('newest');
  const [sorting, setSorting] = useState(false);
  const [listingId, setListingId] = useState<string | undefined>();
  const [open, setOpen] = useState<LikeItem | null>(null);

  const likes = useAsync(() => getLikes(user.id, { listingId }), [user.id, listingId]);
  const listings = useAsync(() => (isTenant ? Promise.resolve([]) : getLandlordListings(user.id)), [user.id]);
  useAppEvents(user.id, (e) => {
    if (e.type === 'like' || e.type === 'match' || e.type === 'reset') void likes.reload();
  });

  const sortLabels: Record<Sort, string> = { newest: 'Newest', fit: 'Best fit', price: isTenant ? 'Price: low to high' : 'Budget: high to low' };

  const items = useMemo(() => {
    const list = [...(likes.data?.[tab] ?? [])];
    if (sort === 'fit') list.sort((a, b) => b.fit.score - a.fit.score);
    else if (sort === 'price')
      list.sort((a, b) => (isTenant ? a.listing.rent - b.listing.rent : b.tenant.prefs.budgetMax - a.tenant.prefs.budgetMax));
    return list;
  }, [likes.data, tab, sort, isTenant]);

  const respond = async (item: LikeItem, direction: Direction) => {
    setOpen(null);
    // Optimistic: drop it from Liked you straight away.
    likes.setData((prev) => (prev ? { ...prev, likedYou: prev.likedYou.filter((i) => i.id !== item.id) } : prev!));
    await swipe({ actor: user.role, tenantId: item.tenant.id, listingId: item.listing.id, direction });
    void likes.reload();
  };

  const openItem = (item: LikeItem) => {
    if (tab === 'youLiked' && item.matchId) router.push(`/chat/${item.matchId}`);
    else setOpen(item);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="space-y-4 px-4 pt-4 pb-3">
        <h1 className="text-display font-bold">Likes</h1>
        <Segmented
          label="Likes"
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          options={[
            { value: 'likedYou', label: 'Liked you', count: likes.data?.likedYou.length },
            { value: 'youLiked', label: 'You liked', count: likes.data?.youLiked.length },
          ]}
        />
        <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setSorting(true)}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-chip border border-line bg-surface px-3 text-label font-semibold"
          >
            <ArrowDownUp size={15} /> {sortLabels[sort]}
          </button>
          {!isTenant &&
            (listings.data ?? []).length > 1 &&
            [{ id: undefined, title: 'All listings' }, ...(listings.data ?? [])].map((l) => (
              <button
                key={l.id ?? 'all'}
                type="button"
                aria-pressed={listingId === l.id}
                onClick={() => setListingId(l.id)}
                className={cx(
                  'h-9 shrink-0 rounded-chip px-3 text-label font-medium whitespace-nowrap',
                  listingId === l.id ? 'bg-ink text-bg' : 'bg-surface-2 text-ink-muted',
                )}
              >
                {l.title}
              </button>
            ))}
        </div>
      </header>

      {likes.loading && !likes.data ? (
        <div className="grid grid-cols-2 gap-3 px-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-card bg-surface-2" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-10 pb-16 text-center">
          <h2 className="text-title font-semibold">{tab === 'likedYou' ? 'No likes yet' : isTenant ? 'Nothing here yet' : 'No one yet'}</h2>
          <p className="text-body text-ink-muted">
            {tab === 'likedYou'
              ? isTenant
                ? 'When a landlord says yes to you, they show up here. Keep swiping.'
                : 'Renters who like your places show up here.'
              : isTenant
                ? 'Homes you like will wait here.'
                : 'Renters you say yes to will wait here.'}
          </p>
        </div>
      ) : (
        <motion.ul layout className="grid grid-cols-2 gap-x-3 gap-y-4 px-4 pb-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item, i) => (
              <motion.li
                key={`${tab}:${item.id}`}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.22, delay: Math.min(i, 6) * 0.03 }}
              >
                <LikeTile item={item} viewerRole={user.role} likedYou={tab === 'likedYou'} onOpen={() => openItem(item)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <Sheet open={sorting} onClose={() => setSorting(false)} title="Sort by">
        <ul className="p-2">
          {(Object.keys(sortLabels) as Sort[]).map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => {
                  setSort(s);
                  setSorting(false);
                }}
                className="flex h-13 w-full items-center justify-between rounded-input px-4 text-body active:bg-surface-2"
              >
                {sortLabels[s]}
                {sort === s && <Check size={20} className="text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      {open && isTenant && (
        <ListingDetail
          open
          listing={open.listing}
          owner={open.other}
          fit={open.fit}
          onClose={() => setOpen(null)}
          onPass={tab === 'likedYou' ? () => respond(open, 'left') : undefined}
          onLike={tab === 'likedYou' ? () => respond(open, 'right') : undefined}
        />
      )}
      {open && !isTenant && (
        <TenantDetail
          open
          tenant={open.tenant}
          fit={open.fit}
          onClose={() => setOpen(null)}
          onPass={tab === 'likedYou' ? () => respond(open, 'left') : undefined}
          onLike={tab === 'likedYou' ? () => respond(open, 'right') : undefined}
        />
      )}
    </div>
  );
}
