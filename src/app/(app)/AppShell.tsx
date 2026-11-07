'use client';
// App shell for the signed-in tabs. Owner: Coleman (wiring); visuals come from
// Kamsi's BottomNav and Jazz's MatchOverlay.
// - Listens for realtime events once, for the whole app.
// - Shows the match overlay for BOTH people (deduped by match id).
// - Keeps the Matches tab badge fresh.
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { MatchOverlay } from '@/components/match/MatchOverlay';
import { BottomNav } from '@/components/ui/BottomNav';
import { getMatches } from '@/lib/api';
import { useAppEvents, useAsync, useRequireUser } from '@/lib/hooks';
import { UserProvider } from '@/lib/session';
import type { MatchSummary } from '@/lib/types';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useRequireUser();
  const [overlay, setOverlay] = useState<MatchSummary | null>(null);
  const seen = useRef(new Set<string>());

  const matches = useAsync(() => (user ? getMatches(user.id) : Promise.resolve([])), [user?.id]);
  const badge = (matches.data ?? []).filter((m) => m.unread || !m.lastMessage).length;

  useAppEvents(user?.id, (e) => {
    if (e.type === 'match' && !seen.current.has(e.match.id)) {
      seen.current.add(e.match.id);
      setOverlay(e.summary);
      navigator.vibrate?.([30, 50, 30]);
    }
    if (e.type === 'reset') {
      setOverlay(null);
      seen.current.clear();
    }
    void matches.reload();
  });

  const close = useCallback(() => setOverlay(null), []);

  if (!user) return null; // redirecting

  return (
    <UserProvider value={user}>
      <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
      <BottomNav matchesBadge={badge} />
      <MatchOverlay
        summary={overlay}
        viewerRole={user.role}
        onClose={close}
        onMessage={(id) => {
          setOverlay(null);
          router.push(`/chat/${id}`);
        }}
      />
    </UserProvider>
  );
}
