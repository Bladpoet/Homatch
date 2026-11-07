// Shared by ListingCard and TenantCard. Owner: Jazz.
import { Check } from 'lucide-react';
import { topReasons } from '@/lib/score';
import type { Fit } from '@/lib/types';
import { cx } from '@/components/ui/cx';

export function ReasonChips({ fit, max = 3, onDark }: { fit: Fit; max?: number; onDark?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {topReasons(fit, max).map((r) => (
        <li
          key={r.label}
          className={cx(
            'inline-flex h-7 items-center gap-1 rounded-chip px-2.5 text-caption font-medium',
            onDark ? (r.ok ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60') : r.ok ? 'bg-like/12 text-like' : 'bg-surface-2 text-ink-muted',
          )}
        >
          {r.ok && <Check size={13} strokeWidth={3} />}
          {r.label}
        </li>
      ))}
    </ul>
  );
}
