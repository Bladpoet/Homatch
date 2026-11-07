'use client';
// STUB(C0) → Jazz builds the real engine in J1 (drag, stamps, fly-out, spring-back,
// back-card scaling, reduced motion). Keep the props EXACTLY.
//
// Contract:
// - CONTROLLED: `items` is the remaining stack; items[0] is on top. The deck calls
//   onSwipe(top, dir) once the card has committed (after the fly-out animation in the
//   real one). The PARENT removes the item from `items`. Rewind: the parent puts it back.
// - Buttons, keyboard and drag all go through the same commit path (one code path, no drift).
// - canSwipe(item) === false (the divider card): no LIKE/PASS stamps, but it can still be
//   dismissed either way; the parent just doesn't record it.
// - Keyboard: ← pass, → like, ↑/Space detail, Z/Backspace rewind. Ignored while typing.
import { useCallback, useEffect } from 'react';
import { DeckControls } from './DeckControls';
import { DECK } from './deck.config';
import type { Direction } from '@/lib/types';

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

export function SwipeDeck<T>({ items, getKey, renderCard, onSwipe, onRewind, onOpenDetail, emptyState }: SwipeDeckProps<T>) {
  const top = items[0];

  const commit = useCallback(
    (dir: Direction) => {
      if (top !== undefined) onSwipe(top, dir);
    },
    [top, onSwipe],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return;
      if (document.querySelector('[role="dialog"]')) return; // a sheet/overlay owns the keyboard
      if (e.key === 'ArrowLeft') commit('left');
      else if (e.key === 'ArrowRight') commit('right');
      else if ((e.key === 'ArrowUp' || e.key === ' ') && top !== undefined) {
        e.preventDefault();
        onOpenDetail?.(top);
      } else if ((e.key === 'z' || e.key === 'Backspace') && onRewind) onRewind();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commit, top, onOpenDetail, onRewind]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        {items.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">{emptyState}</div>
        ) : (
          items
            .slice(0, DECK.renderCount)
            .map((item, i) => (
              <div
                key={getKey(item)}
                className="absolute inset-0"
                style={{
                  zIndex: DECK.renderCount - i,
                  transform: i === 0 ? undefined : `translateY(${DECK.backOffsetY}px) scale(${DECK.backScale})`,
                }}
                aria-hidden={i !== 0}
              >
                {renderCard(item, { isTop: i === 0 })}
              </div>
            ))
            .reverse()
        )}
      </div>
      <DeckControls
        onPass={() => commit('left')}
        onLike={() => commit('right')}
        onRewind={onRewind}
        disabled={items.length === 0}
      />
    </div>
  );
}
