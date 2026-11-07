// STUB(C0) → Jazz builds the real one in J3. Keep the props.
import { Heart, Info } from 'lucide-react';
import Image from 'next/image';
import { formatBudget, formatDate, formatHousehold } from '@/lib/format';
import type { Fit, Tenant } from '@/lib/types';
import { FitPill } from './FitPill';
import { ReasonChips } from './ReasonChips';

export type TenantCardProps = { tenant: Tenant; fit: Fit; likedYou: boolean; onOpenDetail: () => void };

export function TenantCard({ tenant, fit, likedYou, onOpenDetail }: TenantCardProps) {
  const p = tenant.prefs;
  return (
    <article className="absolute inset-x-3 top-1 bottom-0 overflow-hidden rounded-deck-card bg-ink shadow-deck-card">
      <Image src={tenant.avatarUrl} alt={tenant.name} fill sizes="390px" className="object-cover" draggable={false} />
      <div className="absolute inset-x-3 top-3 flex items-start justify-between">
        {likedYou ? (
          <span className="inline-flex h-7 items-center gap-1 rounded-chip bg-like px-2.5 text-label font-bold text-white">
            <Heart size={14} fill="currentColor" /> Likes your place
          </span>
        ) : (
          <span />
        )}
        <FitPill score={fit.score} />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-photo-scrim via-photo-scrim/70 to-transparent px-4 pt-24 pb-4 text-white">
        <button type="button" onClick={onOpenDetail} className="block w-full text-left">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-display font-bold">
              {tenant.name.split(' ')[0]}
              {tenant.age && <span className="ml-2 font-normal">{tenant.age}</span>}
            </h2>
            <Info size={22} className="mb-1 shrink-0 opacity-80" aria-label="More info" />
          </div>
          <p className="mt-1 text-body">{tenant.occupation}</p>
          <p className="mt-1 text-label text-white/80">
            {formatBudget(p.budgetMin, p.budgetMax)} · by {formatDate(p.moveInBy)} · {formatHousehold(p.householdSize, p.pets)}
          </p>
        </button>
        <div className="mt-3">
          <ReasonChips fit={fit} onDark />
        </div>
      </div>
    </article>
  );
}
