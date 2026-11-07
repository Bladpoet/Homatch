'use client';
// Fit score pill. `ai` adds a sparkle once the AI fit has replaced the rule score;
// the number rolls to its new value so the upgrade is noticeable but calm.
import { Sparkles } from 'lucide-react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect } from 'react';

export function FitPill({ score, ai }: { score: number; ai?: boolean }) {
  const reduce = useReducedMotion();
  const value = useMotionValue(score);
  const text = useTransform(value, (v) => `${Math.round(v)}% fit`);

  useEffect(() => {
    if (reduce) value.set(score);
    else animate(value, score, { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
  }, [score, reduce, value]);

  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-chip bg-surface/90 px-2.5 text-label font-bold text-ink tabular-nums backdrop-blur">
      {ai && (
        <motion.span
          initial={reduce ? false : { scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="text-accent"
          aria-label="AI fit"
        >
          <Sparkles size={13} strokeWidth={2.6} />
        </motion.span>
      )}
      <motion.span>{text}</motion.span>
    </span>
  );
}
