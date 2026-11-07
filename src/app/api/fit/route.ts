// POST /api/fit — AI fit. Claude refines the rule-based score using what rules
// can't read (bios, notes, descriptions) and writes a one-line headline for the viewer.
// Never fails: any error, timeout, refusal or missing key returns the rule fit.
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';
import type { Fit, Listing, Role, TenantPrefs } from '@/lib/types';

export const runtime = 'nodejs';

const MODEL = 'claude-opus-5-5'; // switch to 'claude-haiku-5-5' if upgrades feel slow on stage
const MAX_SHIFT = 15;
const TIMEOUT_MS = 6000;

const FitSchema = z.object({
  score: z.number().int(),
  headline: z.string(),
  reasons: z.array(z.object({ label: z.string(), ok: z.boolean() })),
});

type Body = {
  viewer: Role;
  tenant: { name: string; prefs: TenantPrefs; bio: string; occupation?: string; introNote?: string };
  listing: Listing;
  rules: Fit;
};

const SYSTEM = `You assess how well a rental listing fits a renter in Ireland, for a two-sided rental matching app.
You get the renter's structured preferences and free text (bio, occupation, intro note), the listing (including its description and amenities), and a rule-based fit score computed from the structured fields only.

Start from the rule score. Adjust it only for what the rules cannot see in the free text (lifestyle, noise, work patterns, pets, space needs, commute hints, long-term intent), by at most ${MAX_SHIFT} points either way. Never contradict the structured facts.

Write "headline" (max 60 characters) for the viewer:
- viewer "tenant": about the home, addressed to the renter. Example: "Garden and quiet street, made for your plants"
- viewer "landlord": about the renter, addressed to the landlord, using the renter's first name or "they". Example: "Works nights, so your quiet road suits Niamh"

Write 3 or 4 "reasons": short concrete chips (max 24 characters each), the strongest positives first, then at most one honest negative with ok=false. Only state facts present in the input. Plain Irish/UK English, sentence case, no emoji, no exclamation marks.`;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const cache = new Map<string, Fit>(); // per server instance; the client caches too

function rulesFallback(rules: Fit): Fit {
  return { ...rules, source: 'rules' };
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: 'bad json' }, { status: 400 });
  }
  const { viewer, tenant, listing, rules } = body;
  if (!tenant || !listing || !rules) return Response.json({ error: 'missing fields' }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json(rulesFallback(rules));
  }

  const key = JSON.stringify([viewer, tenant, listing.id, listing.description, rules.score]);
  const hit = cache.get(key);
  if (hit) return Response.json(hit);

  const input = {
    viewer,
    rule_score: rules.score,
    rule_reasons: rules.reasons,
    renter: {
      first_name: tenant.name.split(' ')[0],
      occupation: tenant.occupation,
      bio: tenant.bio,
      intro_note: tenant.introNote,
      preferences: tenant.prefs,
    },
    listing: {
      title: listing.title,
      rent_eur_per_month: listing.rent,
      area: listing.area,
      region: listing.region,
      address: listing.addressLine,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      room_in_share: !!listing.isRoom,
      property_type: listing.propertyType,
      available_from: listing.availableFrom,
      lease_months: listing.leaseMonths,
      pets_allowed: listing.petsAllowed,
      smoking_allowed: listing.smokingAllowed,
      furnished: listing.furnished,
      ber: listing.ber,
      amenities: listing.amenities,
      description: listing.description,
    },
  };

  try {
    const client = new Anthropic();
    const res = await client.beta.messages.parse(
      {
        model: MODEL,
        max_tokens: 2000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: SYSTEM,
        output_config: { effort: 'low', format: betaZodOutputFormat(FitSchema) },
        messages: [{ role: 'user', content: JSON.stringify(input) }],
      },
      { timeout: TIMEOUT_MS, maxRetries: 0 },
    );

    if (res.stop_reason === 'refusal' || !res.parsed_output) return Response.json(rulesFallback(rules));

    const ai = res.parsed_output;
    const fit: Fit = {
      score: Math.round(clamp(clamp(ai.score, rules.score - MAX_SHIFT, rules.score + MAX_SHIFT), 0, 100)),
      headline: ai.headline.trim().slice(0, 60),
      reasons: ai.reasons
        .slice(0, 4)
        .map((r) => ({ label: r.label.trim().slice(0, 28), ok: !!r.ok }))
        .sort((a, b) => Number(b.ok) - Number(a.ok)),
      source: 'ai',
    };
    if (!fit.reasons.length) fit.reasons = rules.reasons;
    cache.set(key, fit);
    return Response.json(fit);
  } catch (err) {
    if (err instanceof Anthropic.APIError) console.warn(`[fit] API ${err.status}: ${err.message}`);
    else console.warn('[fit] failed:', err instanceof Error ? err.message : err);
    return Response.json(rulesFallback(rules));
  }
}
