'use client';
// Dual-handle range slider. Two native range inputs stacked over one track, so
// keyboard, screen readers and touch all work for free. Styles: .range-dual in globals.css.

export type RangeSliderProps = {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  format?: (n: number) => string;
  label?: string;
};

const THUMB = 26; // px, keep in sync with .range-dual thumb size

export function RangeSlider({ min, max, step, value, onChange, format = String, label = 'Range' }: RangeSliderProps) {
  const [lo, hi] = value;
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const pos = (p: number) => `calc(${THUMB / 2}px + ${p / 100} * (100% - ${THUMB}px))`;

  return (
    <div>
      <div className="mb-2 flex justify-between text-body text-ink-muted tabular-nums">
        <span>{format(lo)}</span>
        <span>
          {format(hi)}
          {hi >= max ? '+' : ''}
        </span>
      </div>
      <div className="relative h-[26px]">
        <div className="absolute inset-x-[13px] top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink"
          style={{ left: pos(pct(lo)), right: `calc(100% - ${pos(pct(hi))})` }}
        />
        <input
          type="range"
          className="range-dual"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label={`${label} minimum`}
          aria-valuetext={format(lo)}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
        />
        <input
          type="range"
          className="range-dual"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={`${label} maximum`}
          aria-valuetext={format(hi)}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
        />
      </div>
    </div>
  );
}
