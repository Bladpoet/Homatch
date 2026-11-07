import { regionOf } from './config';
import { formatDate, formatMoney } from './format';
import type { Fit, Listing, TenantPrefs } from './types';

type Weighted = { label: string; ok: boolean; weight: number };

/** Below TENANT_DECK_MIN_FIT, so out-of-region listings/renters drop out of both decks. */
const OUTSIDE_REGION_CAP = 25;
/** Below DISCOVER_MIN_FIT: tenants can still see a stretch listing low in their deck, landlords never see the renter. */
const OVER_BUDGET_CAP = 40;

/**
 * How well a listing fits a tenant's preferences, 0–100, with human reasons.
 * Pure. Used by both decks (tenant → listings, landlord → tenants for a listing).
 * Weights: budget 35 · area 20 · bedrooms 15 · move-in 15 · pets 10 · lease 5.
 */
export function fit(prefs: TenantPrefs, listing: Listing): Fit {
  const reasons: Weighted[] = [];
  let score = 0;

  // Budget (35). Up to 10% over budget earns partial points; further over caps the
  // whole score at OVER_BUDGET_CAP, so a €900 room-seeker never fills a €2,150 deck.
  const wayOverBudget = listing.rent > prefs.budgetMax * 1.1;
  if (listing.rent <= prefs.budgetMax) {
    score += 35;
    reasons.push({ label: 'Within budget', ok: true, weight: 35 });
  } else {
    const over = listing.rent - prefs.budgetMax;
    const tolerance = prefs.budgetMax * 0.1;
    if (over <= tolerance) score += 35 * (1 - over / tolerance);
    reasons.push({ label: `${formatMoney(over)} over budget`, ok: false, weight: 35 });
  }

  // Area (20). Same region as a preferred area earns half. A different region
  // caps the whole score at OUTSIDE_REGION_CAP, so a Cork renter never fills a Dublin deck.
  let outsideRegion = false;
  if (prefs.areas.length === 0) {
    score += 20;
    reasons.push({ label: 'Anywhere suits you', ok: true, weight: 20 });
  } else if (prefs.areas.includes(listing.area)) {
    score += 20;
    reasons.push({ label: `In ${listing.area}`, ok: true, weight: 20 });
  } else if (prefs.areas.some((a) => regionOf(a) === listing.region)) {
    score += 10;
    reasons.push({ label: `Elsewhere in ${listing.region}`, ok: false, weight: 20 });
  } else {
    outsideRegion = true;
    reasons.push({ label: 'Outside your areas', ok: false, weight: 20 });
  }

  // Bedrooms (15). Bathrooms, if asked for, must pass too.
  const bathsOk = !prefs.bathroomsMin || listing.bathrooms >= prefs.bathroomsMin;
  if (listing.bedrooms >= prefs.bedroomsMin && bathsOk) {
    score += 15;
    reasons.push({ label: listing.isRoom ? 'Room in a share' : `${listing.bedrooms} bed`, ok: true, weight: 15 });
  } else {
    reasons.push({ label: bathsOk ? 'Fewer beds' : 'Fewer bathrooms', ok: false, weight: 15 });
  }

  // Move-in (15)
  if (listing.availableFrom <= prefs.moveInBy) {
    score += 15;
    reasons.push({ label: `Free from ${formatDate(listing.availableFrom)}`, ok: true, weight: 15 });
  } else {
    reasons.push({ label: 'Available later', ok: false, weight: 15 });
  }

  // Pets (10). Only worth a reason chip if the tenant has pets.
  if (!prefs.pets || listing.petsAllowed) {
    score += 10;
    if (prefs.pets) reasons.push({ label: 'Pets OK', ok: true, weight: 10 });
  } else {
    reasons.push({ label: 'No pets', ok: false, weight: 10 });
  }

  // Lease (5)
  if (listing.leaseMonths <= prefs.leaseMonths + 6) {
    score += 5;
    reasons.push({ label: `${listing.leaseMonths}-month lease`, ok: true, weight: 5 });
  } else {
    reasons.push({ label: `${listing.leaseMonths}-month lease`, ok: false, weight: 5 });
  }

  reasons.sort((a, b) => Number(b.ok) - Number(a.ok) || b.weight - a.weight);
  if (outsideRegion) score = Math.min(score, OUTSIDE_REGION_CAP);
  if (wayOverBudget) score = Math.min(score, OVER_BUDGET_CAP);
  return {
    score: Math.round(score),
    reasons: reasons.map(({ label, ok }) => ({ label, ok })),
  };
}

/** The chips a card shows: up to n reasons, ok ones first. */
export const topReasons = (f: Fit, n = 3) => f.reasons.slice(0, n);
