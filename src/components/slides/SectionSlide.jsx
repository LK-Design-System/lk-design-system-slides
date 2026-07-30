import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';

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

  return (
    <SlideSurface data-lds-section-slide style={style} {...rest}>
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
        style={{
          margin: 0,
          fontSize: 'var(--slides-display-size)',
          lineHeight: 'var(--slides-display-line)',
          letterSpacing: 'var(--slides-display-spacing)',
          fontWeight: 'var(--fw-bold)',
          color: 'var(--color-semantic-label-strong)',
          maxWidth: '18ch',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          data-slide-subtitle
          style={{
            margin: 'var(--space-5) 0 0',
            fontSize: 'var(--slides-body-size)',
            lineHeight: 'var(--slides-body-line)',
            letterSpacing: 'var(--slides-body-spacing)',
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
