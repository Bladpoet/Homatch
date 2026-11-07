'use client';
// "It's a match". Mounted once in AppShell; fires for BOTH people.
// Motion (PRODUCT.md → Interaction spec): backdrop fades 200ms, the two photos spring
// in from ±120px with a 60ms stagger, a heart pops between them, the headline scales
// 0.9→1 after 150ms, actions rise in last. Reduced motion: plain fades.
import { Heart } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { MatchSummary, Role } from '@/lib/types';

export type MatchOverlayProps = {
  summary: MatchSummary | null;
  viewerRole: Role;
  onMessage: (matchId: string) => void;
  onClose: () => void;
};

export function MatchOverlay({ summary, viewerRole, onMessage, onClose }: MatchOverlayProps) {
  const reduce = useReducedMotion();
  const primary = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!summary) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => primary.current?.focus(), 400);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [summary, onClose]);

  return (
    <AnimatePresence>
      {summary && (
        <motion.div
          key={summary.match.id}
          role="dialog"
          aria-modal="true"
          aria-label="It's a match"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 overflow-hidden px-8 text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 -z-10 bg-scrim backdrop-blur-md" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_42%,color-mix(in_srgb,var(--color-accent)_55%,transparent),transparent)]" />
          <Content summary={summary} viewerRole={viewerRole} reduce={!!reduce} onMessage={onMessage} onClose={onClose} primary={primary} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Content({
  summary,
  viewerRole,
  reduce,
  onMessage,
  onClose,
  primary,
}: {
  summary: MatchSummary;
  viewerRole: Role;
  reduce: boolean;
  onMessage: (id: string) => void;
  onClose: () => void;
  primary: React.RefObject<HTMLButtonElement | null>;
}) {
  const { listing, other } = summary;
  const first = other.name.split(' ')[0];
  // Tenant sees: the home + the landlord. Landlord sees: the renter + their home.
  const left = viewerRole === 'tenant' ? listing.photos[0] : other.avatarUrl;
  const right = viewerRole === 'tenant' ? other.avatarUrl : listing.photos[0];
  const subline =
    viewerRole === 'tenant'
      ? `${first} said yes to you for ${listing.title}.`
      : `${first} likes ${listing.title}, and you like them back.`;

  const pop = { type: 'spring' as const, stiffness: 260, damping: 20 };
  const fadeUp = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2, delay } }
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <>
      <motion.h2
        className="text-[2.75rem] leading-none font-black tracking-tight"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0.2 } : { ...pop, delay: 0.15 }}
      >
        It&apos;s a match
      </motion.h2>

      <div className="relative flex h-36 items-center justify-center">
        {[left, right].map((src, i) => (
          <motion.div
            key={i}
            className="relative size-32 overflow-hidden rounded-full border-4 border-white shadow-[0_12px_32px_-8px_rgb(0_0_0/0.5)]"
            style={{ marginLeft: i === 1 ? -22 : 0, zIndex: i === 1 ? 2 : 1 }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: i === 0 ? -120 : 120, rotate: i === 0 ? -10 : 10 }}
            animate={{ opacity: 1, x: 0, rotate: i === 0 ? -6 : 6 }}
            transition={reduce ? { duration: 0.2 } : { ...pop, delay: i * 0.06 }}
          >
            <Image src={src} alt="" fill sizes="256px" className="object-cover" />
          </motion.div>
        ))}
        <motion.span
          className="absolute top-1/2 left-1/2 z-10 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-like shadow-lg"
          initial={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { scale: [0, 1.25, 1], opacity: 1 }}
          transition={{ duration: 0.45, delay: reduce ? 0 : 0.28, times: reduce ? undefined : [0, 0.6, 1] }}
        >
          <Heart size={24} fill="currentColor" />
        </motion.span>
      </div>

      <motion.p className="max-w-[28ch] text-body text-white/85" {...fadeUp(0.3)}>
        {subline}
      </motion.p>

      <motion.div className="flex w-full flex-col gap-3" {...fadeUp(0.4)}>
        <button
          ref={primary}
          type="button"
          onClick={() => onMessage(summary.match.id)}
          className="h-14 w-full rounded-button bg-white text-body font-bold text-ink shadow-lg transition-transform active:scale-[0.97]"
        >
          Send a message
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-14 w-full rounded-button border border-white/40 text-body font-semibold text-white transition-transform active:scale-[0.97]"
        >
          Keep swiping
        </button>
      </motion.div>
    </>
  );
}
