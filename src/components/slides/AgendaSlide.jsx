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
          // Body, not caption: on every other layout the eyebrow is a kicker
          // riding directly above a title, but here it is the slide's ONLY
          // header, floating a space-8 above the list — and the list itself
          // was promoted to title scale. A label at the caption rung under
          // that promotion reads as a stray footnote (deck review follow-up,
          // 2026-08-16). One rung up keeps it subordinate to the items
          // (≥1.6:1) while letting it anchor the slide.
          fontSize: 'var(--slides-body-size)',
          lineHeight: 'var(--slides-body-line)',
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
