# Onboarding references: what to take, what to leave

`ref-1-start-matching-phone.png` and `ref-2-start-matching-tablet.png` are store screenshots of an existing app's "Start matching" filter sheet. **Take the layout, interaction pattern and spacing. Don't copy its colours, logo or name.** Our colours come from `tokens.css`.

## The pattern
**One scrolling sheet, not a wizard.** Every preference sits on one screen, in stacked sections. You can finish it in a few taps, because each section already has a sensible default ("Any", the full price range). The sheet has:
- a drag handle at the top
- the title "Start matching" (about 24px, bold) with a close ✕ on the right
- sticky actions at the bottom: **Reset** (outline, about a third of the width) and **Start matching** (primary, about two thirds, with a search icon)

## Anatomy, top to bottom (as measured from ref-1)
| Element | Spec |
|---|---|
| Side padding | 24px. About 28px between sections, and 12px from a section label to its controls |
| **Section label** | A 16px line icon in the accent colour plus a 15px medium label ("Search by Location", "Sale Price"…) |
| **Text input** | 52px tall, 14px radius, a 1px `line` border, muted placeholder. A square 52px icon button for "use my location" sits beside it |
| **Helper text** | Caption size, muted, 8px under the input ("Only available in California…") |
| **Option buttons** | Equal-width grid (2 or 3 columns), 48px tall, about 14px radius, 12px gap. **Unselected:** `surface-2` fill, `ink-muted` medium text, no border. **Selected:** `accent` fill, white semibold text, and a soft accent-tinted shadow (`0 6px 16px -4px accent/40%`) |
| **Number chips** | One row of six equal cells: **Any · 1+ · 2+ · 3+ · 4+ · 5+**, 48px tall, styled like the option buttons |
| **Range slider** | The min and max values sit above each end ("$0" … "$50.0M"). A 4px dark track, with the selected range in `ink`. White circular handles (about 22px) with a 1px grey border and a small shadow, grown to about 28px of touch area |
| **Footer** | Reset and Start matching, both 56px tall and fully rounded. The primary may use a subtle gradient of our accent |

## How Homatch adapts it
Our sections, in order. Defaults are in **bold**.
1. **Where in Ireland?** A search input that filters the area chips below it, plus a "use my location" button that pre-selects Dublin for the demo. Below that, region tabs (Dublin · Cork · Galway · Limerick · Leinster · Elsewhere) and multi-select area chips. The helper text reads "Across Ireland. Pick as many areas as you like".
2. **Place type:** **Whole place** / Room in a share (2 columns)
3. **Property type:** **All** / House / Apartment (3 columns)
4. **Monthly budget:** a range slider, €500 to €4,000+, in €50 steps, with the default **€1,000–2,500**. Values sit above the ends, formatted "€1,800" … "€2,300".
5. **Minimum bedrooms:** **Any** · 1+ · 2+ · 3+ · 4+ · 5+
6. **Minimum bathrooms:** **Any** · 1+ · 2+ · 3+
7. **Moving in:** ASAP / **This month** / Next month / Later (a 2×2 grid)
8. **Lease:** 6 mo / **12 mo** / 18+ mo
9. **Household:** **Just me** / 2 / 3 / 4+
10. **Pets** and **Smoker:** two short Yes/**No** rows

Then **Start matching** leads to a short **"About you"** step, in the same visual language:
- choose an avatar
- the **intro note**: 140 characters, with tappable starters, and optional with Skip

After that comes the "Finding homes that fit you…" moment, then the deck.

**Reuse:** the same `PreferencesForm` component powers onboarding, **the Discover filter sheet** (the sliders icon in the Discover header opens it as a bottom sheet), and Profile → Edit preferences. Build it once.
