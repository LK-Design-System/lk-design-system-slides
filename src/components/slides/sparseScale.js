/**
 * LDS Slides — sparse-slide scale rule.
 *
 * Sparse layouts (Statement, Section, End) carry one utterance on a whole
 * canvas, and the utterance's length decides which projection tier it can
 * afford: a short label — a chapter name, a takeaway, "감사합니다" — carries
 * `hero` (the 10–17%-of-canvas tier every surveyed peer keeps for exactly
 * this slide class; docs/references/SLIDE_SYSTEMS_COMPARISON.md), while a
 * full sentence stays at `display`, where its measure still reads as one
 * breath instead of a wall of 112px type.
 *
 * The threshold counts non-whitespace glyphs of a plain-string prop, so the
 * decision is a pure function of the deck's content — deterministic for the
 * motion renderer, assertable in play functions, and indifferent to preset
 * (briefing's hero is smaller, the rule is the same). Non-string content
 * cannot be measured honestly and stays at display.
 */
export const HERO_MAX_GLYPHS = 12;

export function sparseScale(text) {
  if (typeof text !== 'string') return 'display';
  const glyphs = text.replace(/\s/g, '').length;
  return glyphs > 0 && glyphs <= HERO_MAX_GLYPHS ? 'hero' : 'display';
}

/** Type styles per tier, resolved through the slide ramp. */
export const SPARSE_TYPE = {
  hero: {
    fontSize: 'var(--slides-hero-size)',
    lineHeight: 'var(--slides-hero-line)',
    letterSpacing: 'var(--slides-hero-spacing)',
  },
  display: {
    fontSize: 'var(--slides-display-size)',
    lineHeight: 'var(--slides-display-line)',
    letterSpacing: 'var(--slides-display-spacing)',
  },
};
