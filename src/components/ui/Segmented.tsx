'use client';
// Segmented control with a sliding thumb (shared layoutId). Optional counts per option.
import { motion, useReducedMotion } from 'motion/react';
import { useId } from 'react';
import { spring } from '@/styles/motion';
import { cx } from './cx';

export type SegmentedProps = {
  options: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
};

export function Segmented({ options, value, onChange, label }: SegmentedProps) {
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <div role="tablist" aria-label={label} className="flex rounded-chip bg-surface-2 p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={cx(
              'relative flex h-10 flex-1 items-center justify-center gap-1.5 rounded-chip text-label font-semibold transition-colors',
              on ? 'text-ink' : 'text-ink-muted',
            )}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={reduce ? { duration: 0 } : spring.snappy}
                className="absolute inset-0 rounded-chip bg-surface shadow-[0_1px_3px_rgb(0_0_0/0.12)]"
              />
            )}
            <span className="relative">{o.label}</span>
            {o.count !== undefined && (
              <span
                className={cx(
                  'relative min-w-5 rounded-full px-1.5 text-[11px] leading-5 font-bold tabular-nums',
                  on ? 'bg-accent text-on-accent' : 'bg-line text-ink-muted',
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
