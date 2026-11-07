// Helpers for the Start matching sheet: defaults, and chip ↔ prefs mapping.
import type { TenantPrefs } from './types';

export const BUDGET = { min: 500, max: 4000, step: 50 } as const;

export type MoveInChoice = 'asap' | 'this-month' | 'next-month' | 'later';

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** ASAP = +14 days · This month = month end · Next month = next month end · Later = +90 days */
export function moveInDate(choice: MoveInChoice, now = new Date()): string {
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (choice) {
    case 'asap':
      return iso(new Date(y, m, now.getDate() + 14));
    case 'this-month':
      return iso(new Date(y, m + 1, 0));
    case 'next-month':
      return iso(new Date(y, m + 2, 0));
    case 'later':
      return iso(new Date(y, m, now.getDate() + 90));
  }
}

/** The chip that best describes an existing move-in date. */
export function moveInChoice(date: string, now = new Date()): MoveInChoice {
  const target = new Date(`${date}T12:00:00`).getTime();
  const choices: MoveInChoice[] = ['asap', 'this-month', 'next-month', 'later'];
  return choices.reduce((best, c) =>
    Math.abs(new Date(`${moveInDate(c, now)}T12:00:00`).getTime() - target) <
    Math.abs(new Date(`${moveInDate(best, now)}T12:00:00`).getTime() - target)
      ? c
      : best,
  );
}

export function defaultPrefs(now = new Date()): TenantPrefs {
  return {
    budgetMin: 1000,
    budgetMax: 2500,
    areas: [],
    moveInBy: moveInDate('this-month', now),
    bedroomsMin: 0,
    leaseMonths: 12,
    pets: false,
    smoker: false,
    householdSize: 1,
    placeType: 'whole',
  };
}
