import React from 'react';

/**
 * LDS Slides — SlideEyebrow (internal, not exported)
 * The one eyebrow atom. Four layouts used to carry their own copy of this
 * element; the copies agreed on size, tracking and weight but drifted on
 * colour path (one read the primary token directly) and each hard-coded its
 * own gap. Type, tracking, weight and ink now live here once.
 *
 * The GAP still differs per stack, on purpose: it is measured against what
 * sits under the eyebrow, so it is a property of the header stack, not of
 * the eyebrow. Named here so the variation is a table, not four accidents.
 *
 *   content    → an h2 title at title scale        space-2
 *   cover      → a display-scale cover title       space-4
 *   statement  → a display-scale sentence          space-5
 *   agenda     → a chapter list, not a heading     space-8
 *
 * `tone` is the ink rung: 'accent' by default; 'quiet' where the slide's
 * only accent belongs to something else (a statement owns its own).
 *
 * `reserve` keeps the line box when there is no text. A content header
 * without an eyebrow used to collapse, so in a deck that mixed eyebrowed and
 * bare slides the title jumped 38 design px between neighbours — the header
 * moved, which is the one thing ContentSlide promises it never does. The deck
 * decides (deckUsesEyebrows): only a deck that uses eyebrows pays the line.
 * The reserved slot is invisible and outside the accessibility tree, and it does NOT carry data-slide-eyebrow,
 * so "the eyebrow was dropped" stays observable.
 */
const STACK_GAP = {
  content: 'var(--space-2)',
  cover: 'var(--space-4)',
  statement: 'var(--space-5)',
  agenda: 'var(--space-8)',
};

const TONE_INK = {
  accent: 'var(--slides-ink-accent)',
  quiet: 'var(--slides-ink-quiet)',
};

export function SlideEyebrow({ stack = 'content', tone = 'accent', reserve = false, children }) {
  const empty = children == null || children === false || children === '';
  if (empty && !reserve) return null;
  return (
    <p
      {...(empty ? { 'data-slide-eyebrow-reserved': '', 'aria-hidden': true } : { 'data-slide-eyebrow': '' })}
      style={{
        margin: `0 0 ${STACK_GAP[stack] ?? STACK_GAP.content}`,
        fontSize: 'var(--slides-overline-size)',
        lineHeight: 'var(--slides-overline-line)',
        // The ramp's own tracking, not the Latin kicker idiom. uppercase +
        // 0.08em is an English smallcaps convention; every real eyebrow in
        // this repository is Korean, where uppercase is a no-op and tracking
        // out already-wide syllable blocks loosens them further
        // (HEADER_SYSTEM_PROPOSAL R2). English eyebrows lose smallcaps —
        // accepted; the English deck profile is a separate deferred item (E3).
        letterSpacing: 'var(--slides-overline-spacing)',
        fontWeight: 'var(--fw-semibold)',
        // The ink indirection, never a label or primary token directly: a
        // re-pointed surface (brand navy) must carry the eyebrow with it.
        color: TONE_INK[tone] ?? TONE_INK.accent,
        ...(empty ? { visibility: 'hidden' } : null),
      }}
    >
      {empty ? ' ' : children}
    </p>
  );
}
