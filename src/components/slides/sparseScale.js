/**
 * LDS Slides — sparse-slide scale rule: the largest rung that fits.
 *
 * Sparse layouts (Statement, Section, End) carry one utterance on a whole
 * canvas. The utterance rides the LARGEST projection tier it fits on — hero
 * first (the 10–17%-of-canvas tier every surveyed peer keeps for this slide
 * class; docs/references/SLIDE_SYSTEMS_COMPARISON.md), falling to display
 * only when the text cannot break into the tier's line budget. A first cut
 * gated hero behind a 12-glyph count, which left a 17-glyph takeaway at
 * display beside half a canvas of air — length was a proxy; the real
 * question is whether the utterance FITS (user-flagged).
 *
 * The fit test is an arithmetic estimate — glyph advances summed against the
 * canvas text width — never a DOM measurement: a pure function of the deck's
 * props stays deterministic for the motion renderer, SSR-safe, and
 * assertable in play functions. The estimate is deliberately conservative
 * (wide advance factors) and the overflow gate backstops real wrap. hero is
 * also the CAP: the surveyed band tops out at 17.4% of canvas, so no rung is
 * invented above it however short the utterance.
 *
 * Canvas constants mirror the token layer (a JS module cannot read CSS):
 * logical canvas 1280px, keynote safe-x 7%/side, hero 112px, display 56px.
 * If those tokens move, move these with them — the projection-scale ledger
 * in docs/COMPOSITION_PROPOSAL.md owns that coupling. briefing's rungs are
 * proportionally smaller (80/40 over a 1152px text width), which makes its
 * chars-per-line BUDGET nearly identical, so one estimate serves both
 * presets.
 */
const CANVAS_TEXT_WIDTH = 1280 * (1 - 0.07 * 2); // keynote safe area, px
const RUNGS = [
  { scale: 'hero', size: 112, maxLines: 2 },
  { scale: 'spot', size: 80, maxLines: 2 },
  { scale: 'display', size: 56, maxLines: 4 },
];

/** Estimated advance width of one glyph, in ems — conservative on purpose. */
function glyphEm(ch) {
  const code = ch.codePointAt(0);
  if (ch === ' ') return 0.34;
  if (code <= 0x7f) return 0.62; // Latin, digits, ASCII punctuation
  return 1.02; // Hangul and other full-width glyphs
}

function wordEm(word) {
  return [...word].reduce((sum, ch) => sum + glyphEm(ch), 0);
}

/**
 * Greedy word packing, the same shape as keep-all line breaking: lines only
 * break between words, so a naive total-width division undercounts — a word
 * that misses the line end drags its whole width onto the next line.
 */
function estimatedLines(text, fontSize) {
  const perLineEm = CANVAS_TEXT_WIDTH / fontSize;
  if (perLineEm <= 0) return Infinity;
  const words = text.trim().split(/\s+/);
  let lines = 1;
  let lineEm = 0;
  for (const word of words) {
    const w = wordEm(word);
    const candidate = lineEm === 0 ? w : lineEm + glyphEm(' ') + w;
    if (candidate <= perLineEm) {
      lineEm = candidate;
    } else {
      lines += 1;
      lineEm = w;
      if (w > perLineEm) return Infinity; // a single word past the measure never fits
    }
  }
  return lines;
}

export function sparseScale(text) {
  if (typeof text !== 'string' || text.trim().length === 0) return 'display';
  for (const rung of RUNGS) {
    if (estimatedLines(text, rung.size) <= rung.maxLines) return rung.scale;
  }
  return 'display';
}

/** Type styles per tier, resolved through the slide ramp. */
export const SPARSE_TYPE = {
  spot: {
    fontSize: 'var(--slides-spot-size)',
    lineHeight: 'var(--slides-spot-line)',
    letterSpacing: 'var(--slides-spot-spacing)',
  },
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
