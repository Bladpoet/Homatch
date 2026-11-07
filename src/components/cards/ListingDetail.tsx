'use client';
// STUB(C0) → Jazz builds the real one in J4 (shared-element expand from the card,
// drag-down dismiss, gallery). Keep the props.
import Image from 'next/image';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { formatBeds, formatDate, formatRent } from '@/lib/format';
import type { Fit, Listing, Profile } from '@/lib/types';
import { ReasonChips } from './ReasonChips';

export type ListingDetailProps = {
  listing: Listing;
  owner: Profile;
  fit: Fit;
  open: boolean;
  onClose: () => void;
  onPass?: () => void;
  onLike?: () => void;
};

export function ListingDetail({ listing, owner, fit, open, onClose, onPass, onLike }: ListingDetailProps) {
  return (
    <Sheet open={open} onClose={onClose} title={listing.title}>
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pt-3">
        {listing.photos.map((src, i) => (
          <div key={src + i} className="relative aspect-[4/5] w-[85%] shrink-0 snap-center overflow-hidden rounded-card bg-surface-2">
            <Image src={src} alt="" fill sizes="340px" className="object-cover" />
          </div>
        ))}
      </div>
      <div className="space-y-5 p-4">
        <div>
          <p className="text-display font-bold">{formatRent(listing.rent)}</p>
          <p className="mt-1 text-label text-ink-muted">{listing.addressLine}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-label">
          <Spec k="Size" v={formatBeds(listing.bedrooms, listing.bathrooms)} />
          <Spec k="Available" v={formatDate(listing.availableFrom)} />
          <Spec k="Lease" v={`${listing.leaseMonths} months`} />
          <Spec k="BER" v={listing.ber ?? '—'} />
          <Spec k="Pets" v={listing.petsAllowed ? 'Allowed' : 'Not allowed'} />
          <Spec k="Furnished" v={listing.furnished ? 'Yes' : 'No'} />
        </dl>
        <section>
          <h3 className="mb-2 text-label font-semibold">Why it fits you</h3>
          <ReasonChips fit={fit} max={6} />
        </section>
        <p className="text-body">{listing.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {listing.amenities.map((a) => (
            <Chip key={a}>{a}</Chip>
          ))}
        </div>
        <div className="flex items-center gap-3 rounded-card bg-surface-2 p-3">
          <Avatar src={owner.avatarUrl} alt={owner.name} size={44} />
          <div>
            <p className="text-label font-semibold">{owner.name}</p>
            <p className="text-caption text-ink-muted">{owner.bio}</p>
          </div>
        </div>
      </div>
      {(onPass || onLike) && (
        <div className="sticky bottom-0 flex gap-3 bg-surface px-4 pt-2">
          {onPass && (
            <Button variant="secondary" size="lg" onClick={onPass}>
              Pass
            </Button>
          )}
          {onLike && (
            <Button size="lg" onClick={onLike}>
              Interested
            </Button>
          )}
        </div>
      )}
    </Sheet>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-input bg-surface-2 px-3 py-2">
      <dt className="text-caption text-ink-muted">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
