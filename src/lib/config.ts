export const APP_NAME = 'Homatch';
export const COUNTRY = 'Ireland';
export const LOCALE = 'en-IE';
export const CURRENCY = 'EUR';
export const RENT_SUFFIX = '/mo';

/** 'mock' = localStorage + BroadcastChannel (works offline, two tabs = two users). 'supabase' = C4. */
export const DATA_MODE = (process.env.NEXT_PUBLIC_DATA_MODE ?? 'mock') as 'mock' | 'supabase';

export const REGIONS: { region: string; areas: string[] }[] = [
  {
    region: 'Dublin',
    areas: [
      'Dublin City Centre',
      'Rathmines',
      'Ranelagh',
      'Drumcondra',
      'Phibsborough',
      'Stoneybatter',
      'Clontarf',
      'Dún Laoghaire',
      'Tallaght',
      'Swords',
    ],
  },
  { region: 'Cork', areas: ['Cork City', 'Ballincollig', 'Douglas'] },
  { region: 'Galway', areas: ['Galway City', 'Salthill'] },
  { region: 'Limerick', areas: ['Limerick City', 'Castletroy'] },
  { region: 'Leinster', areas: ['Maynooth', 'Bray', 'Kilkenny', 'Drogheda', 'Athlone'] },
  { region: 'Elsewhere', areas: ['Waterford City', 'Sligo', 'Letterkenny', 'Killarney'] },
];

export const AREAS = REGIONS.flatMap((r) => r.areas);

export function regionOf(area: string): string | undefined {
  return REGIONS.find((r) => r.areas.includes(area))?.region;
}

export const LEASE_OPTIONS = [6, 12, 18] as const;

/** Hide listings below this fit from tenants; landlords' Discover pool needs at least DISCOVER_MIN_FIT. */
export const TENANT_DECK_MIN_FIT = 30;
export const DISCOVER_MIN_FIT = 50;

/** Seeded demo personas (see src/lib/fixtures.ts). */
export const PERSONAS = {
  maya: 'p-maya',
  david: 'p-david',
  sam: 'p-sam',
} as const;
