'use client';
// STUB(C0) → Jazz builds the real one in J5 (circles spring in from the sides,
// headline pop, haptics). Keep the props.
// Mounted once in (app)/AppShell; fires for BOTH people when a match happens.
import { useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { MatchSummary, Role } from '@/lib/types';

export type MatchOverlayProps = {
  summary: MatchSummary | null;
  viewerRole: Role;
  onMessage: (matchId: string) => void;
  onClose: () => void;
};

export function MatchOverlay({ summary, viewerRole, onMessage, onClose }: MatchOverlayProps) {
  useEffect(() => {
    if (!summary) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [summary, onClose]);

  if (!summary) return null;
  const { listing, other } = summary;
  // Tenant sees: the home + the landlord. Landlord sees: the renter + their home.
  const left = viewerRole === 'tenant' ? listing.photos[0] : other.avatarUrl;
  const right = viewerRole === 'tenant' ? other.avatarUrl : listing.photos[0];
  const subline =
    viewerRole === 'tenant'
      ? `${other.name.split(' ')[0]} wants to hear from you about ${listing.title}.`
      : `${other.name.split(' ')[0]} likes ${listing.title}, and you like them.`;

  return (
    <div role="dialog" aria-modal="true" aria-label="It's a match" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-scrim p-8 text-center text-white backdrop-blur-md">
      <h2 className="text-display font-bold">It&apos;s a match</h2>
      <div className="flex items-center">
        <Avatar src={left} alt="" size={120} />
        <span className="-ml-6">
          <Avatar src={right} alt="" size={120} />
        </span>
      </div>
      <p className="max-w-[28ch] text-body text-white/85">{subline}</p>
      <div className="flex w-full flex-col gap-3">
        <Button size="lg" onClick={() => onMessage(summary.match.id)}>
          Send a message
        </Button>
        <Button size="lg" variant="ghost" className="text-white" onClick={onClose}>
          Keep swiping
        </Button>
      </div>
    </div>
  );
}
