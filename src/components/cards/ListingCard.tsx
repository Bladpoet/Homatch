'use client';
// Listing card for the tenant deck. Photo carousel: tap the left/right half of the
// photo to step through (instant swap, segment bar on top, 4px nudge at either end).
// AI fit upgrades the pill and adds a headline in place.
import { Info } from 'lucide-react';
import Image from 'next/image';
import { formatBeds, formatDate, formatRent } from '@/lib/format';
import type { Fit, Listing } from '@/lib/types';
import { AiHeadline } from './AiHeadline';
import { FitPill } from './FitPill';
import { PhotoCarousel } from './PhotoCarousel';
import { ReasonChips } from './ReasonChips';

export type ListingCardProps = { listing: Listing; fit: Fit; onOpenDetail: () => void };

export function ListingCard({ listing, fit, onOpenDetail }: ListingCardProps) {
  const beds = listing.isRoom ? 'Room in a share' : formatBeds(listing.bedrooms, listing.bathrooms);
  return (
    <article className="absolute inset-x-3 top-1 bottom-0 overflow-hidden rounded-deck-card bg-ink shadow-deck-card">
      <PhotoCarousel
        photos={listing.photos}
        alt={listing.title}
        render={(src, alt) => <Image src={src} alt={alt} fill sizes="390px" className="object-cover" draggable={false} />}
        overlay={
          <div className="absolute top-6 right-3">
            <FitPill score={fit.score} ai={fit.source === 'ai'} />
          </div>
        }
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-photo-scrim via-photo-scrim/70 to-transparent px-4 pt-24 pb-4 text-white">
        <button type="button" onClick={onOpenDetail} className="pointer-events-auto block w-full text-left">
          <div className="flex items-end justify-between gap-3">
            <p className="text-display font-bold">{formatRent(listing.rent)}</p>
            <Info size={22} className="mb-1 shrink-0 opacity-80" aria-label="More info" />
          </div>
          <h2 className="mt-1 line-clamp-2 text-title font-semibold">{listing.title}</h2>
          <p className="mt-1 text-label text-white/80">
            {listing.area} · {beds} · from {formatDate(listing.availableFrom)}
            {listing.ber && <span className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-caption font-bold">BER {listing.ber}</span>}
          </p>
          <AiHeadline text={fit.headline} onDark />
        </button>
        <div className="pointer-events-auto mt-3">
          <ReasonChips fit={fit} onDark />
        </div>
      </div>
    </article>
  );
}
