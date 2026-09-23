import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';
import { SlideEyebrow } from './SlideEyebrow.jsx';

/**
 * LDS Slides — AgendaSlide
 * The table of contents of the Korean deck skeleton (표지 → 목차 → 본문 → 막지):
 * an ordered list of chapter titles, numbered with the same zero-padded
 * formatting SectionSlide uses, so the agenda and the dividers visibly
 * belong to one deck. `current` (1-based, matching SectionSlide's `index`)
 * lets the deck reuse the agenda as a progress slide between chapters —
 * exactly one item may be current, and emphasis is spent only there.
 *
 * The agenda is a sparse slide: three to five chapter names own a whole
 * canvas, and at body scale they read as a footnote in a corner (the
 * full-deck review's worst offender). Items therefore read at TITLE scale —
 * they are chapter titles, set at the scale chapters are titled — with the
 * list block centred on the canvas while the list itself stays
 * start-aligned, because a numbered list is read top-down along its rail.
 */
export function AgendaSlide({ title = '목차', items = [], current, style, ...rest }) {
  return (
    <SlideSurface data-lds-agenda-slide style={{ alignItems: 'center', ...style }} {...rest}>
      {/* `title` is set as the eyebrow: the agenda's heading was first a
          body-scale anchor, then folded into the eyebrow family's one
          deck-wide size when flipping the deck showed eyebrow-class elements
          jittering between sizes (user-flagged, 2026-08-17). */}
      <SlideEyebrow stack="agenda">{title}</SlideEyebrow>
      <ol
        data-slide-agenda
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'grid',
          gap: 'var(--space-8)',
        }}
      >
        {items.map((item, i) => {
          const isCurrent = current === i + 1;
          return (
            <li
              key={i}
              data-slide-agenda-item
              data-agenda-current={isCurrent || undefined}
              style={{
                display: 'flex',
                gap: 'var(--space-6)',
                alignItems: 'baseline',
                // The orient tier, not title. The "items read at TITLE scale"
                // promotion was reviewed when title WAS this value (display2);
                // when the stage grammar moved title to display1 the list
                // inherited 56px two-glyph chapter names nobody had judged.
                // orient is the size the promotion actually looked at.
                fontSize: 'var(--slides-orient-size)',
                lineHeight: 'var(--slides-orient-line)',
                letterSpacing: 'var(--slides-orient-spacing)',
                // Medium, not regular: at this scale a 400 chapter name reads
                // as blown-up body and the list goes washy (user-flagged on
                // the real deck's TOC). Not bold either — the conventional
                // all-bold agenda spends the weight that marks `current`, and
                // a progress slide whose current chapter differs only by
                // colour has lost its one job. 400/500/700 render, 2026-08-18:
                // ordinal 400 < name 500 < current 700, every rung distinct.
                fontWeight: isCurrent ? 'var(--fw-bold)' : 'var(--fw-medium)',
                color: isCurrent
                  ? 'var(--slides-ink-strong)'
                  : 'var(--slides-ink-neutral)',
              }}
            >
              <span
                data-slide-agenda-index
                style={{
                  // Same size as the name, subordinated by TONE — the book-TOC
                  // idiom, settled by rendering the alternatives side by side.
                  // Two shapes failed first: full item size with bold on top
                  // made the furniture outweigh the chapter (the eye landed on
                  // 01, not 산출 — user-caught); dropping it to the body rung
                  // transplanted SectionSlide's 2:1, but that ratio belongs to
                  // a STACKED composition — inline, a small bold ordinal reads
                  // as a floating stamp, not a subordinate (user-rejected).
                  // Same-size regular grey keeps "01 산출" one line with one
                  // baseline; tabular stays for the rail. `current` still has
                  // its markers: the accent ordinal and the bold name.
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 'var(--fw-regular)',
                  color: isCurrent
                    ? 'var(--slides-ink-accent)'
                    : 'var(--slides-ink-quiet)',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {item}
            </li>
          );
        })}
      </ol>
    </SlideSurface>
  );
}
