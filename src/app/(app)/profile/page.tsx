'use client';
// Profile. Owner: Coleman (C6). Basic for now: who you are, your prefs or listings,
// and a way back to /demo to switch persona.
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PreferencesSheet } from '@/components/onboarding/PreferencesSheet';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { getLandlordListings, getLikeCount, getTenant, setCurrentUser } from '@/lib/api';
import { formatBudget, formatDate, formatRent } from '@/lib/format';
import { useAsync } from '@/lib/hooks';
import { useUser } from '@/lib/session';

export default function ProfilePage() {
  const user = useUser();
  const router = useRouter();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="flex flex-col items-center gap-3 px-4 pt-8 pb-6 text-center">
        <Avatar src={user.avatarUrl} alt={user.name} size={96} />
        <div>
          <h1 className="text-title font-semibold">{user.name}</h1>
          <p className="text-label text-ink-muted">
            {user.role === 'tenant' ? 'Looking for a home' : 'Landlord'}
            {user.occupation && user.role === 'tenant' ? ` · ${user.occupation}` : ''}
          </p>
        </div>
        {user.bio && <p className="max-w-[32ch] text-body text-ink-muted">{user.bio}</p>}
      </header>

      {user.role === 'tenant' ? <TenantPrefs id={user.id} /> : <MyListings id={user.id} />}

      <div className="mt-auto space-y-2 p-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={async () => {
            await setCurrentUser(null);
            router.push('/demo');
          }}
        >
          Switch persona
        </Button>
      </div>
    </div>
  );
}

function TenantPrefs({ id }: { id: string }) {
  const tenant = useAsync(() => getTenant(id), [id]);
  const [editing, setEditing] = useState(false);
  const p = tenant.data?.prefs;
  if (!p) return null;
  return (
    <section className="space-y-4 px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-label font-semibold text-ink-muted">Your preferences</h2>
        <button type="button" onClick={() => setEditing(true)} className="h-9 rounded-chip bg-surface-2 px-3.5 text-label font-semibold">
          Edit
        </button>
      </div>
      <PreferencesSheet tenantId={id} open={editing} onClose={() => setEditing(false)} onSaved={() => void tenant.reload()} />
      {tenant.data?.introNote && (
        <blockquote className="rounded-card bg-surface px-4 py-3 text-body text-ink-muted italic">&ldquo;{tenant.data.introNote}&rdquo;</blockquote>
      )}
      <dl className="grid grid-cols-2 gap-3 text-label">
        <Row k="Budget" v={formatBudget(p.budgetMin, p.budgetMax)} />
        <Row k="Move in by" v={formatDate(p.moveInBy)} />
        <Row k="Bedrooms" v={`${p.bedroomsMin}+`} />
        <Row k="Lease" v={`${p.leaseMonths} months`} />
      </dl>
      <div className="flex flex-wrap gap-1.5">
        {p.areas.map((a) => (
          <Chip key={a}>{a}</Chip>
        ))}
      </div>
      {/* C6/K2: reuse the onboarding controls here to edit in place. */}
    </section>
  );
}

function MyListings({ id }: { id: string }) {
  const listings = useAsync(async () => {
    const ls = await getLandlordListings(id);
    const counts = await Promise.all(ls.map((l) => getLikeCount(l.id)));
    return ls.map((l, i) => ({ ...l, likes: counts[i] }));
  }, [id]);
  return (
    <section className="space-y-3 px-4">
      <h2 className="text-label font-semibold text-ink-muted">My listings</h2>
      <ul className="space-y-2">
        {(listings.data ?? []).map((l) => (
          <li key={l.id} className="flex items-center gap-3 rounded-card bg-surface p-2 shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
            <span className="relative size-16 shrink-0 overflow-hidden rounded-input">
              <Image src={l.photos[0]} alt="" fill sizes="128px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body font-semibold">{l.title}</span>
              <span className="block text-caption text-ink-muted">
                {l.area} · {formatRent(l.rent)}
              </span>
            </span>
            <span className="pr-2 text-caption font-bold text-like">{l.likes} likes</span>
          </li>
        ))}
      </ul>
      <Link
        href="/onboarding/landlord"
        className="flex h-14 w-full items-center justify-center rounded-button border border-line bg-surface font-semibold"
      >
        Add a listing
      </Link>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-input bg-surface px-3 py-2">
      <dt className="text-caption text-ink-muted">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
