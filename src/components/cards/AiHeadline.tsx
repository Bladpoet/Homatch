'use client';
// The AI fit one-liner on cards. Grows in (height + fade) when it arrives, so the
// info block above it moves smoothly instead of jumping.
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cx } from '@/components/ui/cx';

export function AiHeadline({ text, onDark }: { text?: string; onDark?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {text && (
        <motion.p
          key={text}
          initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: 4 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, height: 'auto', y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={cx('overflow-hidden text-label font-medium', onDark ? 'text-white' : 'text-ink')}
        >
          <span className="block pt-2">
            <span className={cx('mr-1.5', onDark ? 'text-white/70' : 'text-accent')}>✦</span>
            {text}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}
