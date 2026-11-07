'use client';
// The "Start matching" sheet (docs/design/references/onboarding). One scrolling
// form of icon-labelled sections with sensible defaults + a sticky Reset / submit
// footer. Used in onboarding, the Discover filter sheet and Profile.
import {
  Bath,
  BedDouble,
  CalendarDays,
  Cigarette,
  Euro,
  FileText,
  House,
  MapPin,
  Navigation,
  PawPrint,
  Search,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { OptionGroup } from '@/components/ui/OptionGroup';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { cx } from '@/components/ui/cx';
import { REGIONS } from '@/lib/config';
import { formatMoney } from '@/lib/format';
import { BUDGET, type MoveInChoice, defaultPrefs, moveInChoice, moveInDate } from '@/lib/prefs';
import type { TenantPrefs } from '@/lib/types';

export type PreferencesFormProps = {
  value: TenantPrefs;
  onChange: (p: TenantPrefs) => void;
  onSubmit: () => void;
  onReset?: () => void;
  submitLabel?: string;
  submitting?: boolean;
};

const ANY = 'any';
const nums = (max: number) => [
  { value: ANY, label: 'Any' },
  ...Array.from({ length: max }, (_, i) => ({ value: String(i + 1), label: `${i + 1}+` })),
];

export function PreferencesForm({ value: p, onChange, onSubmit, onReset, submitLabel = 'Start matching', submitting }: PreferencesFormProps) {
  const set = (patch: Partial<TenantPrefs>) => onChange({ ...p, ...patch });
  const [moveIn, setMoveIn] = useState<MoveInChoice>(() => moveInChoice(p.moveInBy));
  const canSubmit = p.areas.length > 0 && !submitting;

  return (
    <div className="flex flex-col">
      <div className="space-y-7 px-6 pb-6">
        <AreaPicker areas={p.areas} onChange={(areas) => set({ areas })} />

        <Section icon={Tag} title="Place type">
          <OptionGroup
            label="Place type"
            columns={3}
            value={p.placeType ?? ANY}
            onChange={(v) => set({ placeType: v === ANY ? undefined : (v as 'whole' | 'room') })}
            options={[
              { value: 'whole', label: 'Whole place' },
              { value: 'room', label: 'Room' },
              { value: ANY, label: 'Either' },
            ]}
          />
        </Section>

        <Section icon={House} title="Property type">
          <OptionGroup
            label="Property type"
            columns={3}
            value={p.propertyType ?? ANY}
            onChange={(v) => set({ propertyType: v === ANY ? undefined : (v as 'house' | 'apartment') })}
            options={[
              { value: ANY, label: 'All' },
              { value: 'house', label: 'House' },
              { value: 'apartment', label: 'Apartment' },
            ]}
          />
        </Section>

        <Section icon={Euro} title="Monthly budget">
          <RangeSlider
            label="Monthly budget"
            min={BUDGET.min}
            max={BUDGET.max}
            step={BUDGET.step}
            value={[p.budgetMin, p.budgetMax]}
            onChange={([budgetMin, budgetMax]) => set({ budgetMin, budgetMax })}
            format={formatMoney}
          />
        </Section>

        <Section icon={BedDouble} title="Minimum bedrooms">
          <OptionGroup
            label="Minimum bedrooms"
            columns={6}
            value={p.bedroomsMin > 0 ? String(p.bedroomsMin) : ANY}
            onChange={(v) => set({ bedroomsMin: v === ANY ? 0 : Number(v) })}
            options={nums(5)}
          />
        </Section>

        <Section icon={Bath} title="Minimum bathrooms">
          <OptionGroup
            label="Minimum bathrooms"
            columns={4}
            value={p.bathroomsMin ? String(p.bathroomsMin) : ANY}
            onChange={(v) => set({ bathroomsMin: v === ANY ? undefined : Number(v) })}
            options={nums(3)}
          />
        </Section>

        <Section icon={CalendarDays} title="Moving in">
          <OptionGroup
            label="Moving in"
            columns={2}
            value={moveIn}
            onChange={(v) => {
              setMoveIn(v);
              set({ moveInBy: moveInDate(v) });
            }}
            options={[
              { value: 'asap', label: 'ASAP' },
              { value: 'this-month', label: 'This month' },
              { value: 'next-month', label: 'Next month' },
              { value: 'later', label: 'Later' },
            ]}
          />
        </Section>

        <Section icon={FileText} title="Lease length">
          <OptionGroup
            label="Lease length"
            columns={3}
            value={String(p.leaseMonths)}
            onChange={(v) => set({ leaseMonths: Number(v) })}
            options={[
              { value: '6', label: '6 months' },
              { value: '12', label: '12 months' },
              { value: '18', label: '18+ months' },
            ]}
          />
        </Section>

        <Section icon={Users} title="Who's moving">
          <OptionGroup
            label="Household size"
            columns={4}
            value={String(Math.min(p.householdSize, 4))}
            onChange={(v) => set({ householdSize: Number(v) })}
            options={[
              { value: '1', label: 'Just me' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4+' },
            ]}
          />
        </Section>

        <div className="space-y-3">
          <YesNo icon={PawPrint} title="Pets" value={p.pets} onChange={(pets) => set({ pets })} />
          <YesNo icon={Cigarette} title="Smoker" value={p.smoker} onChange={(smoker) => set({ smoker })} />
        </div>
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-line bg-surface px-6 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
        {!p.areas.length && <p className="pb-2 text-center text-caption text-ink-muted">Pick at least one area to start</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => (onReset ? onReset() : onChange(defaultPrefs()))}
            className="h-14 flex-1 rounded-button border border-line bg-surface font-semibold text-ink transition-transform active:scale-[0.97]"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className={cx(
              'flex h-14 flex-[2] items-center justify-center gap-2.5 rounded-button bg-linear-to-r from-accent to-accent-strong font-semibold text-on-accent transition-[transform,opacity] active:scale-[0.97]',
              canSubmit ? 'shadow-cta' : 'opacity-40',
            )}
          >
            <Search size={19} strokeWidth={2.4} />
            {submitting ? 'Saving…' : submitLabel}
          </button>
        </div>
      </footer>
    </div>
  );
}

// ── Pieces ────────────────────────────────────────────────────────────────

type Icon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

function Section({ icon: Icon, title, aside, children }: { icon: Icon; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon size={17} strokeWidth={2} className="text-accent" />
        <h3 className="text-label font-semibold text-ink">{title}</h3>
        {aside && <span className="ml-auto text-caption text-ink-muted">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function YesNo({ icon: Icon, title, value, onChange }: { icon: Icon; title: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={17} strokeWidth={2} className="text-accent" />
      <span className="flex-1 text-label font-semibold">{title}</span>
      <div className="w-40">
        <OptionGroup
          label={title}
          columns={2}
          size="sm"
          value={value ? 'yes' : 'no'}
          onChange={(v) => onChange(v === 'yes')}
          options={[
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' },
          ]}
        />
      </div>
    </div>
  );
}

function AreaPicker({ areas, onChange }: { areas: string[]; onChange: (a: string[]) => void }) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState(() => REGIONS.find((r) => r.areas.some((a) => areas.includes(a)))?.region ?? 'Dublin');
  const q = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (q) return REGIONS.flatMap((r) => r.areas).filter((a) => a.toLowerCase().includes(q));
    return REGIONS.find((r) => r.region === region)?.areas ?? [];
  }, [q, region]);

  const current = REGIONS.find((r) => r.region === region)!;
  const allInRegion = current.areas.every((a) => areas.includes(a));
  const toggleRegion = () =>
    onChange(allInRegion ? areas.filter((a) => !current.areas.includes(a)) : [...new Set([...areas, ...current.areas])]);

  return (
    <Section icon={MapPin} title="Where in Ireland?" aside={areas.length ? `${areas.length} selected` : undefined}>
      <div className="flex gap-2.5">
        <label className="relative flex-1">
          <span className="sr-only">Search areas</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a town or area…"
            className="h-[52px] w-full rounded-input border border-line bg-surface px-4 pr-10 text-body outline-none placeholder:text-ink-subtle focus:border-ink"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted"
            >
              <X size={16} />
            </button>
          )}
        </label>
        <button
          type="button"
          aria-label="Use my location"
          title="Use my location"
          onClick={() => {
            setQuery('');
            setRegion('Dublin');
            if (!areas.includes('Dublin City Centre')) onChange([...areas, 'Dublin City Centre']);
          }}
          className="flex size-[52px] shrink-0 items-center justify-center rounded-input bg-surface-2 text-ink active:scale-[0.97]"
        >
          <Navigation size={20} />
        </button>
      </div>
      <p className="mt-2 px-1 text-caption text-ink-muted">Anywhere in Ireland. Pick as many areas as you like.</p>

      {!q && (
        <div className="-mx-6 mt-4 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none]">
          {REGIONS.map((r) => {
            const count = r.areas.filter((a) => areas.includes(a)).length;
            const on = r.region === region;
            return (
              <button
                key={r.region}
                type="button"
                aria-pressed={on}
                onClick={() => setRegion(r.region)}
                className={cx(
                  'flex h-9 shrink-0 items-center gap-1.5 rounded-chip px-3.5 text-label font-medium transition-colors',
                  on ? 'bg-ink text-bg' : 'bg-surface-2 text-ink-muted',
                )}
              >
                {r.region}
                {count > 0 && (
                  <span className={cx('min-w-5 rounded-full px-1.5 text-[11px] leading-5 font-bold', on ? 'bg-bg text-ink' : 'bg-accent text-on-accent')}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-3">
        {visible.length ? (
          <div className="space-y-2.5">
            {!q && (
              <OptionGroup
                multi
                size="sm"
                label={`Anywhere in ${region}`}
                value={allInRegion ? ['all'] : []}
                onChange={toggleRegion}
                options={[{ value: 'all', label: `Anywhere in ${region}` }]}
              />
            )}
            <OptionGroup multi size="sm" label="Areas" value={areas} onChange={onChange} options={visible.map((a) => ({ value: a, label: a }))} />
          </div>
        ) : (
          <p className="px-1 text-label text-ink-muted">No areas match &ldquo;{query}&rdquo;.</p>
        )}
      </div>
    </Section>
  );
}
