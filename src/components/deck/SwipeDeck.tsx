'use client';
// The swipe deck. Spec: docs/PRODUCT.md → Interaction spec. Numbers: deck.config.ts.
//
// Contract (unchanged):
// - CONTROLLED: `items[0]` is the top card. When a card commits, it flies out and THEN
//   the deck calls onSwipe(item, dir); the parent removes it. Rewind: the parent puts the
//   item back at items[0] and it flies back in from the side it left on.
// - Drag, buttons and keyboard all go through commit() — one code path.
// - canSwipe(item) === false → no stamps (the divider card), still dismissable.
//
// Architecture: every card owns its x/y. A shared `progress` (0→1, how far the top card
// is towards committing) drives the cards behind, so they grow as you drag.
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { spring } from '@/styles/motion';
import type { Direction } from '@/lib/types';
import { DeckControls } from './DeckControls';
import { DECK } from './deck.config';

export type SwipeDeckProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderCard: (item: T, state: { isTop: boolean }) => React.ReactNode;
  onSwipe: (item: T, dir: Direction) => void;
  canSwipe?: (item: T) => boolean;
  onRewind?: () => void;
  onOpenDetail?: (item: T) => void;
  labels: { like: string; pass: string };
  emptyState: React.ReactNode;
};

type CardHandle = { fly: (dir: Direction, velocity?: { x: number; y: number }) => Promise<void> };

const sign = (d: Direction) => (d === 'right' ? 1 : -1);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function SwipeDeck<T>({ items, getKey, renderCard, onSwipe, canSwipe, onRewind, onOpenDetail, labels, emptyState }: SwipeDeckProps<T>) {
  const progress = useMotionValue(0);
  const busy = useRef(false);
  const topHandle = useRef<CardHandle | null>(null);
  const gone = useRef(new Map<string, Direction>()); // key → side it left on (for rewind)
  const top = items[0];
  const topKey = top !== undefined ? getKey(top) : null;

  // New top card → reset the "behind" scaling before paint (no one-frame jump).
  useLayoutEffect(() => {
    progress.set(0);
  }, [topKey, progress]);

  const commit = useCallback(
    async (dir: Direction, velocity?: { x: number; y: number }) => {
      if (top === undefined || busy.current) return;
      busy.current = true;
      gone.current.set(getKey(top), dir);
      await topHandle.current?.fly(dir, velocity);
      busy.current = false;
      onSwipe(top, dir);
    },
    [top, getKey, onSwipe],
  );

  const rewind = useCallback(() => {
    if (!busy.current) onRewind?.();
  }, [onRewind]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return;
      if (document.querySelector('[role="dialog"]')) return; // a sheet/overlay owns the keyboard
      if (e.key === 'ArrowLeft') void commit('left');
      else if (e.key === 'ArrowRight') void commit('right');
      else if ((e.key === 'ArrowUp' || e.key === ' ') && top !== undefined) {
        e.preventDefault();
        onOpenDetail?.(top);
      } else if ((e.key === 'z' || e.key === 'Backspace') && onRewind) rewind();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commit, top, onOpenDetail, onRewind, rewind]);

  const visible = items.slice(0, DECK.renderCount);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        {items.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">{emptyState}</div>
        ) : (
          visible
            .map((item, i) => {
              const key = getKey(item);
              const enterFrom = i === 0 ? gone.current.get(key) : undefined;
              return (
                <DeckCard
                  key={key}
                  index={i}
                  progress={progress}
                  enterFrom={enterFrom}
                  onEntered={() => gone.current.delete(key)}
                  handleRef={i === 0 ? topHandle : undefined}
                  stamps={i === 0 && canSwipe?.(item) !== false ? labels : null}
                  onCommit={commit}
                >
                  {renderCard(item, { isTop: i === 0 })}
                </DeckCard>
              );
            })
            .reverse()
        )}
        {/* Preload photos for the cards after the visible stack. */}
        <Preload items={items.slice(DECK.renderCount - 1, DECK.renderCount - 1 + DECK.preloadCount)} />
      </div>
      <DeckControls
        onPass={() => void commit('left')}
        onLike={() => void commit('right')}
        onRewind={onRewind ? rewind : undefined}
        disabled={items.length === 0}
      />
    </div>
  );
}

// ── One card ─────────────────────────────────────────────────────────────

function DeckCard({
  index,
  progress,
  enterFrom,
  onEntered,
  handleRef,
  stamps,
  onCommit,
  children,
}: {
  index: number;
  progress: MotionValue<number>;
  enterFrom?: Direction;
  onEntered: () => void;
  handleRef?: React.RefObject<CardHandle | null>;
  stamps: { like: string; pass: string } | null;
  onCommit: (dir: Direction, velocity?: { x: number; y: number }) => void;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const isTop = index === 0;
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const dragged = useRef(false);

  const rotate = useTransform(x, (v) => (reduce ? 0 : clamp(v / DECK.rotationDivisor, -DECK.maxRotation, DECK.maxRotation)));
  const likeOpacity = useTransform(x, (v) => clamp(v / DECK.stampFullAt, 0, 1));
  const passOpacity = useTransform(x, (v) => clamp(-v / DECK.stampFullAt, 0, 1));

  // Cards behind: index 1 grows 0.95→1, index 2 grows 0.90→0.95 as the top card moves.
  // Driven imperatively (not useTransform) so an index change re-applies immediately,
  // even when progress itself doesn't change (e.g. rewind).
  const scale = useMotionValue(1);
  const backY = useMotionValue(0);
  const indexRef = useRef(index);
  indexRef.current = index;
  const applyDepth = useCallback(
    (p: number) => {
      const i = indexRef.current;
      const step = 1 - DECK.backScale;
      scale.set(i === 0 ? 1 : 1 - i * step + p * step);
      backY.set(i === 0 ? 0 : DECK.backOffsetY * (i - p));
    },
    [scale, backY],
  );
  useMotionValueEvent(progress, 'change', applyDepth);
  useLayoutEffect(() => applyDepth(progress.get()), [index, applyDepth, progress]);

  // The top card reports how far it is towards committing.
  useMotionValueEvent(x, 'change', (v) => {
    if (isTop) progress.set(clamp(Math.abs(v) / DECK.commitDistance, 0, 1));
  });

  const width = () => ref.current?.offsetWidth ?? 360;

  // Rewind: fly back in from the side it left on.
  useEffect(() => {
    if (!enterFrom) return;
    if (reduce) {
      opacity.set(0);
      animate(opacity, 1, { duration: 0.15 });
    } else {
      x.set(sign(enterFrom) * width() * DECK.flyOutMultiplier);
      animate(x, 0, spring.snappy);
    }
    onEntered();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exposed to the deck: fly this card off-screen.
  useEffect(() => {
    if (!handleRef) return;
    handleRef.current = {
      fly: async (dir, velocity) => {
        if (reduce) {
          await animate(opacity, 0, { duration: 0.15 }).finished;
          return;
        }
        const s = sign(dir);
        const distance = width() * DECK.flyOutMultiplier + Math.abs(x.get());
        const vy = velocity?.y ?? 0;
        // (The cards behind grow on their own: x moving drives `progress`.)
        await Promise.all([
          animate(x, s * distance, { duration: DECK.flyOutDuration, ease: [0.2, 0.6, 0.4, 1] }).finished,
          animate(y, y.get() + vy * DECK.flyOutDuration, { duration: DECK.flyOutDuration, ease: 'easeOut' }).finished,
        ]);
      },
    };
    return () => {
      if (handleRef.current) handleRef.current = null;
    };
  });

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0 touch-none select-none"
      style={{
        x,
        y: isTop ? y : backY,
        rotate,
        scale,
        opacity,
        zIndex: DECK.renderCount - index,
        cursor: isTop ? 'grab' : 'default',
        transformOrigin: '50% 100%',
      }}
      aria-hidden={!isTop}
      drag={isTop}
      dragMomentum={false}
      dragElastic={1}
      whileDrag={{ cursor: 'grabbing' }}
      onDragStart={() => {
        dragged.current = false;
      }}
      onDrag={(_, info) => {
        if (Math.abs(info.offset.x) > 6 || Math.abs(info.offset.y) > 6) dragged.current = true;
      }}
      onDragEnd={(_, info) => {
        const { offset, velocity } = info;
        const flick = Math.abs(velocity.x) > DECK.commitVelocity;
        if (flick || Math.abs(offset.x) > DECK.commitDistance) {
          // A flick goes where it's thrown; a slow drag goes where it was dragged.
          const right = flick ? velocity.x > 0 : offset.x > 0;
          onCommit(right ? 'right' : 'left', velocity);
        } else {
          animate(x, 0, spring.snappy);
          animate(y, 0, spring.snappy);
        }
      }}
      // A drag must never also "click" the card (opening the detail sheet).
      onClickCapture={(e) => {
        if (dragged.current) {
          e.stopPropagation();
          e.preventDefault();
          dragged.current = false;
        }
      }}
    >
      {children}
      {stamps && (
        <>
          <Stamp label={stamps.like} tone="like" opacity={likeOpacity} />
          <Stamp label={stamps.pass} tone="pass" opacity={passOpacity} />
        </>
      )}
    </motion.div>
  );
}

function Stamp({ label, tone, opacity }: { label: string; tone: 'like' | 'pass'; opacity: MotionValue<number> }) {
  const like = tone === 'like';
  return (
    <motion.span
      aria-hidden
      style={{ opacity, rotate: like ? -14 : 14 }}
      className={
        'pointer-events-none absolute top-14 z-20 rounded-xl border-[5px] px-3 py-1 text-stamp font-black uppercase ' +
        (like ? 'left-9 border-stamp-like text-stamp-like' : 'right-9 border-stamp-pass text-stamp-pass')
      }
    >
      {label}
    </motion.span>
  );
}

/** Warm the browser cache for upcoming cards' first photos. */
function Preload<T>({ items }: { items: T[] }) {
  const urls = items
    .map((it) => {
      const v = it as unknown as { listing?: { photos?: string[] }; tenant?: { avatarUrl?: string } };
      return v.listing?.photos?.[0] ?? v.tenant?.avatarUrl;
    })
    .filter(Boolean) as string[];
  return (
    <div aria-hidden className="pointer-events-none absolute size-0 overflow-hidden opacity-0">
      {urls.map((u) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={u} src={u} alt="" loading="eager" />
      ))}
    </div>
  );
}
