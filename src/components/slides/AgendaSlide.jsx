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
                fontSize: 'var(--slides-title-size)',
                lineHeight: 'var(--slides-title-line)',
                letterSpacing: 'var(--slides-title-spacing)',
                fontWeight: isCurrent ? 'var(--fw-semibold)' : 'var(--fw-regular)',
                color: isCurrent
                  ? 'var(--color-semantic-label-strong)'
                  : 'var(--color-semantic-label-neutral)',
              }}
            >
              <span
                data-slide-agenda-index
                style={{
                  // The ordinal identifies; the name is the content. Inherited
                  // at full item size with bold on top, the number OUTWEIGHED
                  // the chapter it numbers — the eye landed on 01, not 산출
                  // (user-caught on the real deck's agenda page). SectionSlide
                  // already settles this relationship: its index sits at half
                  // the title tier. The same relation here puts the ordinal on
                  // the body rung (56:24 ≈ the divider's own 2:1); bold and
                  // tabular stay, because a small ordinal still anchors the
                  // rail — weight cannot swap instead, current already spends
                  // weight as its marker.
                  fontSize: 'var(--slides-body-size)',
                  lineHeight: 'var(--slides-body-line)',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 'var(--fw-bold)',
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
