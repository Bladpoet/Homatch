'use client';
// The reference's option buttons: equal-width grid (or wrapping chips), filled
// accent when selected with a soft tinted shadow, light grey otherwise.
import { cx } from './cx';

type Option<V extends string> = { value: V; label: React.ReactNode; ariaLabel?: string };

type Single<V extends string> = { multi?: false; value: V | undefined; onChange: (v: V) => void };
type Multi<V extends string> = { multi: true; value: V[]; onChange: (v: V[]) => void };

export type OptionGroupProps<V extends string> = (Single<V> | Multi<V>) & {
  options: Option<V>[];
  /** Equal-width grid. Omit for wrapping, content-width chips. */
  columns?: 2 | 3 | 4 | 6;
  label?: string;
  size?: 'md' | 'sm';
};

const cols = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 6: 'grid-cols-6' };

export function OptionGroup<V extends string>(props: OptionGroupProps<V>) {
  const { options, columns, label, size = 'md' } = props;
  const isOn = (v: V) => (props.multi ? props.value.includes(v) : props.value === v);
  const toggle = (v: V) => {
    if (props.multi) props.onChange(isOn(v) ? props.value.filter((x) => x !== v) : [...props.value, v]);
    else props.onChange(v);
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={cx(columns ? `grid ${cols[columns]}` : 'flex flex-wrap', columns === 6 ? 'gap-2' : 'gap-2.5')}
    >
      {options.map((o) => {
        const on = isOn(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            aria-label={o.ariaLabel}
            onClick={() => toggle(o.value)}
            className={cx(
              'inline-flex min-w-0 items-center justify-center px-3 whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-(--duration-fast) active:scale-[0.97]',
              size === 'md' ? 'h-12 rounded-option text-label' : 'h-10 rounded-[12px] text-label',
              on ? 'bg-accent font-semibold text-on-accent shadow-option' : 'bg-surface-2 font-medium text-ink-muted',
              !columns && 'px-4',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
