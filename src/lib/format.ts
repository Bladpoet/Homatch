import { CURRENCY, LOCALE, RENT_SUFFIX } from './config';

const money = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

/** 2150 → "€2,150" */
export const formatMoney = (n: number) => money.format(n);

/** 2150 → "€2,150/mo" */
export const formatRent = (n: number) => `${money.format(n)}${RENT_SUFFIX}`;

/** 1800, 2300 → "€1,800–2,300" */
export const formatBudget = (min: number, max: number) =>
  `${money.format(min)}–${new Intl.NumberFormat(LOCALE).format(max)}`;

const parse = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);

/** "2026-12-01" → "1 Dec" (adds the year if it isn't this year) */
export function formatDate(iso: string): string {
  const d = parse(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** "now", "5m", "3h", "Tue", "1 Dec" — for chat lists */
export function formatRelative(iso: string): string {
  const d = parse(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 6 * 86400) return d.toLocaleDateString(LOCALE, { weekday: 'short' });
  return formatDate(iso);
}

/** "14:05" */
export const formatTime = (iso: string) =>
  parse(iso).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });

/** "2 people · no pets" */
export function formatHousehold(size: number, pets: boolean): string {
  return `${size} ${size === 1 ? 'person' : 'people'} · ${pets ? 'has pets' : 'no pets'}`;
}

/** "2 bed · 1 bath" */
export const formatBeds = (beds: number, baths: number) => `${beds} bed · ${baths} bath`;

/** Works on plain http (phones on LAN) where crypto.randomUUID is unavailable. */
export function newId(prefix = 'id'): string {
  const c = globalThis.crypto;
  if (c && 'randomUUID' in c && typeof c.randomUUID === 'function') {
    try {
      return `${prefix}-${c.randomUUID()}`;
    } catch {
      /* insecure context */
    }
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
