'use client';
// A tile on the Likes grid. Tenants see the home; landlords see the renter.
import { Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { cx } from '@/components/ui/cx';
import { formatBudget, formatRent } from '@/lib/format';
import type { LikeItem, Role } from '@/lib/types';

export type LikeTileProps = { item: LikeItem; viewerRole: Role; onOpen: () => void; likedYou?: boolean };

export function LikeTile({ item, viewerRole, onOpen, likedYou }: LikeTileProps) {
  const tenantView = viewerRole === 'tenant';
  const photo = tenantView ? item.listing.photos[0] : item.tenant.avatarUrl;
  const first = item.other.name.split(' ')[0];

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onOpen}
        className="group relative aspect-[3/4] w-full overflow-hidden rounded-card bg-surface-2 text-left shadow-[0_1px_2px_rgb(0_0_0/0.08)] transition-transform active:scale-[0.98]"
      >
        <Image src={photo} alt="" fill sizes="(max-width: 420px) 50vw, 200px" className="object-cover" />
        <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-1">
          <StatusChip likedYou={likedYou} status={item.status} />
          <span className="rounded-chip bg-surface/90 px-2 py-0.5 text-caption font-bold text-ink tabular-nums backdrop-blur">{item.fit.score}%</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-photo-scrim to-transparent px-3 pt-10 pb-3 text-white">
          {tenantView ? (
            <>
              <p className="text-body font-bold">{formatRent(item.listing.rent)}</p>
              <p className="truncate text-caption text-white/85">{item.listing.title}</p>
            </>
          ) : (
            <>
              <p className="truncate text-body font-bold">
                {first}
                {item.tenant.age ? <span className="font-normal">, {item.tenant.age}</span> : null}
              </p>
              <p className="truncate text-caption text-white/85">
                {formatBudget(item.tenant.prefs.budgetMin, item.tenant.prefs.budgetMax)} · {item.listing.title}
              </p>
            </>
          )}
        </div>
      </button>
      {item.note ? (
        <p className="line-clamp-2 px-1 text-caption text-ink-muted italic">&ldquo;{item.note}&rdquo;</p>
      ) : tenantView && likedYou ? (
        <p className="px-1 text-caption text-ink-muted">{first} likes you</p>
      ) : null}
    </div>
  );
}

function StatusChip({ likedYou, status }: { likedYou?: boolean; status: LikeItem['status'] }) {
  if (likedYou)
    return (
      <span className="inline-flex items-center gap-1 rounded-chip bg-like px-2 py-0.5 text-caption font-bold text-white">
        <Heart size={11} fill="currentColor" /> Likes you
      </span>
    );
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-caption font-bold',
        status === 'matched' ? 'bg-accent text-on-accent' : 'bg-surface/90 text-ink-muted backdrop-blur',
      )}
    >
      {status === 'matched' ? (
        <>
          <MessageCircle size={11} /> Matched
        </>
      ) : (
        'Waiting'
      )}
    </span>
  );
}
