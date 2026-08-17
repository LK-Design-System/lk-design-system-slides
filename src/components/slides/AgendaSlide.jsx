import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';

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
      <p
        data-slide-eyebrow
        style={{
          margin: '0 0 var(--space-8)',
          // The overline step — the eyebrow family's ONE deck-wide size.
          // This label was first promoted to body as a sole-label anchor,
          // then folded into the shared overline rung when flipping the deck
          // showed eyebrow-class elements jittering between sizes
          // (user-flagged, 2026-08-17). Anchoring stays; the size is now the
          // family's, not this slide's.
          fontSize: 'var(--slides-overline-size)',
          lineHeight: 'var(--slides-overline-line)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 'var(--fw-semibold)',
          color: 'var(--color-semantic-primary-normal)',
        }}
      >
        {title}
      </p>
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
              data-current={isCurrent || undefined}
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
                fontWeight: isCurrent ? 'var(--fw-semibold)' : 'var(--fw-regular)',
                color: isCurrent
                  ? 'var(--color-semantic-label-strong)'
                  : 'var(--color-semantic-label-neutral)',
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
                  // its markers: the accent ordinal and the semibold name.
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 'var(--fw-regular)',
                  color: isCurrent
                    ? 'var(--color-semantic-primary-normal)'
                    : 'var(--color-semantic-label-alternative)',
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
