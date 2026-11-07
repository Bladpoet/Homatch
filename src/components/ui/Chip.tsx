// STUB(C0) → Kamsi builds the real one in K1a. Keep the props.
// Selectable when onToggle is given (renders a button with aria-pressed), static otherwise.
import { cx } from './cx';

export type ChipProps = {
  children: React.ReactNode;
  selected?: boolean;
  onToggle?: () => void;
  tone?: 'default' | 'muted' | 'success';
};

const tones = {
  default: 'bg-surface-2 text-ink',
  muted: 'bg-surface-2/60 text-ink-muted',
  success: 'bg-like/12 text-like',
};

export function Chip({ children, selected, onToggle, tone = 'default' }: ChipProps) {
  const cls = cx(
    'inline-flex h-8 items-center gap-1.5 rounded-chip px-3 text-label font-medium whitespace-nowrap',
    selected ? 'bg-ink text-bg' : tones[tone],
  );
  if (!onToggle) return <span className={cls}>{children}</span>;
  return (
    <button type="button" aria-pressed={!!selected} onClick={onToggle} className={cx(cls, 'min-h-11 active:scale-[0.97]')}>
      {children}
    </button>
  );
}
