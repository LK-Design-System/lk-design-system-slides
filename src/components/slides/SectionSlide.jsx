import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';
import { phrased } from './phrasing.jsx';
import { sparseScale, SPARSE_TYPE } from './sparseScale.js';

/**
 * LDS Slides — SectionSlide
 * The chapter divider of the Korean deck skeleton (표지 → 목차 → 본문 → 막지):
 * a breathing slide between content chapters. One index, one noun-ended
 * chapter title, optionally one orienting line — never content. The slide
 * owns the divider contract (index precedes title, title at display scale);
 * the deck owns numbering meaning and wording.
 */
export function SectionSlide({ index, title, subtitle, style, ...rest }) {
  const formatted =
    typeof index === 'number' ? String(index).padStart(2, '0') : index;

  // A chapter name is usually a short noun label, so the divider mostly
  // rides the hero tier — a breathing slide earns a loud title. Centred like
  // the rest of the sparse family (COMPOSITION_PROPOSAL.md B).
  const scale = sparseScale(title);
  return (
    <SlideSurface
      data-lds-section-slide
      style={{ alignItems: 'center', textAlign: 'center', ...style }}
      {...rest}
    >
      {formatted != null && (
        <p
          data-slide-index
          style={{
            margin: '0 0 var(--space-4)',
            fontSize: 'var(--slides-title-size)',
            lineHeight: 'var(--slides-title-line)',
            letterSpacing: 'var(--slides-title-spacing)',
            fontWeight: 'var(--fw-bold)',
            color: 'var(--slides-ink-accent)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatted}
        </p>
      )}
      <h2
        data-slide-title
        data-slide-scale={scale}
        style={{
          margin: 0,
          ...SPARSE_TYPE[scale],
          fontWeight: 'var(--fw-bold)',
          color: 'var(--slides-ink-strong)',
          maxWidth: '18ch',
          textWrap: 'balance',
        }}
      >
        {phrased(title)}
      </h2>
      {subtitle && (
        <p
          data-slide-subtitle
          style={{
            margin: 'var(--space-5) 0 0',
            // The orienting line under a hero rides its OWN rung (orient),
            // not a borrowed one. It borrowed title-size once, with "rises to
            // title scale (2.8:1)" recorded here — and when the stage grammar
            // lifted title to display1 for the content header's sake, this
            // line rode along to 2:1, level with body-page titles, while the
            // 2.8:1 rationale sat unchanged beside the code (user-caught,
            // 2026-08-17). orient IS the 2.8:1 this comment always promised.
            // Under a display title, body already sits at 2.3:1 and stays.
            fontSize: scale !== 'display' ? 'var(--slides-orient-size)' : 'var(--slides-body-size)',
            lineHeight: scale !== 'display' ? 'var(--slides-orient-line)' : 'var(--slides-body-line)',
            letterSpacing: scale !== 'display' ? 'var(--slides-orient-spacing)' : 'var(--slides-body-spacing)',
            color: 'var(--slides-ink-neutral)',
            maxWidth: '36ch',
          }}
        >
          {subtitle}
        </p>
      )}
    </SlideSurface>
  );
}
