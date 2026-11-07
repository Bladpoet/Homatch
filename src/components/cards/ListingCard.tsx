// STUB(C0) → Jazz builds the real one in J2 (photo carousel with tap zones +
// segment bar, end nudge). Keep the props.
import { Info } from 'lucide-react';
import Image from 'next/image';
import { formatBeds, formatDate, formatRent } from '@/lib/format';
import type { Fit, Listing } from '@/lib/types';
import { FitPill } from './FitPill';
import { ReasonChips } from './ReasonChips';

export type ListingCardProps = { listing: Listing; fit: Fit; onOpenDetail: () => void };

export function ListingCard({ listing, fit, onOpenDetail }: ListingCardProps) {
  return (
    <article className="absolute inset-x-3 top-1 bottom-0 overflow-hidden rounded-deck-card bg-ink shadow-deck-card">
      <Image src={listing.photos[0]} alt={listing.title} fill sizes="390px" className="object-cover" draggable={false} />
      <div className="absolute top-3 right-3">
        <FitPill score={fit.score} />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-photo-scrim via-photo-scrim/70 to-transparent px-4 pt-24 pb-4 text-white">
        <button type="button" onClick={onOpenDetail} className="block w-full text-left">
          <div className="flex items-end justify-between gap-3">
            <p className="text-display font-bold">{formatRent(listing.rent)}</p>
            <Info size={22} className="mb-1 shrink-0 opacity-80" aria-label="More info" />
          </div>
          <h2 className="mt-1 line-clamp-2 text-title font-semibold">{listing.title}</h2>
          <p className="mt-1 text-label text-white/80">
            {listing.area} · {formatBeds(listing.bedrooms, listing.bathrooms)} · from {formatDate(listing.availableFrom)}
            {listing.ber && <span className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-caption font-bold">BER {listing.ber}</span>}
          </p>
        </button>
        <div className="mt-3">
          <ReasonChips fit={fit} onDark />
        </div>
      </div>
    </article>
  );
}
