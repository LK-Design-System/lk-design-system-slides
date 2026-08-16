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
            color: 'var(--color-semantic-primary-normal)',
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
          color: 'var(--color-semantic-label-strong)',
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
            // The orienting line keeps step with the title's tier: under a
            // hero title, body scale reads as a caption that wandered in
            // (4.7:1 — the full-deck review's ratio complaint), so it rises
            // to title scale (2.8:1); under a display title, body already
            // sits at 2.3:1 and stays.
            fontSize: scale === 'hero' ? 'var(--slides-title-size)' : 'var(--slides-body-size)',
            lineHeight: scale === 'hero' ? 'var(--slides-title-line)' : 'var(--slides-body-line)',
            letterSpacing: scale === 'hero' ? 'var(--slides-title-spacing)' : 'var(--slides-body-spacing)',
            color: 'var(--color-semantic-label-neutral)',
            maxWidth: '36ch',
          }}
        >
          {subtitle}
        </p>
      )}
    </SlideSurface>
  );
}
