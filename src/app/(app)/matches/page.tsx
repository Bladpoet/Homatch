'use client';
// Matches. Owner: Kamsi (K3). Wiring is done; restyle freely, keep the data flow.
// - "New matches" row: matches with no messages yet.
// - Conversations: everything with at least one message, newest first.
import Image from 'next/image';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { getMatches } from '@/lib/api';
import { formatRelative } from '@/lib/format';
import { useAppEvents, useAsync } from '@/lib/hooks';
import { useUser } from '@/lib/session';
import type { MatchSummary } from '@/lib/types';
import { cx } from '@/components/ui/cx';

export default function MatchesPage() {
  const user = useUser();
  const matches = useAsync(() => getMatches(user.id), [user.id]);
  useAppEvents(user.id, () => void matches.reload());

  const all = matches.data ?? [];
  const fresh = all.filter((m) => !m.lastMessage);
  const convos = all.filter((m) => m.lastMessage);

  // Tenants think in homes, landlords think in people.
  const thumb = (m: MatchSummary) => (user.role === 'tenant' ? m.listing.photos[0] : m.other.avatarUrl);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-display font-bold">Matches</h1>
      </header>

      {matches.loading && !matches.data ? (
        <ListSkeleton />
      ) : all.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <h2 className="text-title font-semibold">No matches yet</h2>
          <p className="text-body text-ink-muted">Keep swiping. When someone likes you back, they&apos;ll show up here.</p>
        </div>
      ) : (
        <>
          {fresh.length > 0 && (
            <section className="pt-2">
              <h2 className="px-4 pb-2 text-label font-semibold text-ink-muted">New matches</h2>
              <ul className="flex gap-3 overflow-x-auto px-4 pb-2">
                {fresh.map((m) => (
                  <li key={m.match.id}>
                    <Link href={`/chat/${m.match.id}`} className="flex w-20 flex-col items-center gap-1.5">
                      <span className="relative size-20 overflow-hidden rounded-card bg-surface-2">
                        <Image src={thumb(m)} alt="" fill sizes="160px" className="object-cover" />
                      </span>
                      <span className="w-full truncate text-center text-caption font-medium">{m.other.name.split(' ')[0]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="pt-2">
            <h2 className="px-4 pb-1 text-label font-semibold text-ink-muted">Messages</h2>
            <ul>
              {convos.map((m) => (
                <li key={m.match.id}>
                  <Link href={`/chat/${m.match.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-surface-2">
                    <Avatar src={m.other.avatarUrl} alt="" size={56} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-body font-semibold">{m.other.name}</span>
                        <span className="shrink-0 text-caption text-ink-subtle">{formatRelative(m.lastMessage!.createdAt)}</span>
                      </span>
                      <span className="block truncate text-caption text-ink-muted">{m.listing.title}</span>
                      <span className={cx('block truncate text-label', m.unread ? 'font-semibold text-ink' : 'text-ink-muted')}>
                        {m.lastMessage!.senderId === user.id && 'You: '}
                        {m.lastMessage!.body}
                      </span>
                    </span>
                    {m.unread && <span className="size-2.5 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="space-y-1 px-4 pt-4">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex animate-pulse items-center gap-3 py-3">
          <span className="size-14 rounded-full bg-surface-2" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-1/3 rounded bg-surface-2" />
            <span className="block h-3 w-2/3 rounded bg-surface-2" />
          </span>
        </li>
      ))}
    </ul>
  );
}
