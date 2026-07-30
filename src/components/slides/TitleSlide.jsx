import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';

/**
 * LDS Slides — TitleSlide
 * The deck-opening layout: eyebrow, one display-scale title, optional
 * subtitle. Content stays start-aligned and inside the safe area; the
 * projection scale keeps it readable from the back of a room.
 */
export function TitleSlide({ eyebrow, title, subtitle, style, ...rest }) {
  return (
    <SlideSurface style={style} {...rest}>
      {eyebrow && (
        <p
          data-slide-eyebrow
          style={{
            margin: '0 0 var(--space-4)',
            fontSize: 'var(--slides-caption-size)',
            lineHeight: 'var(--slides-caption-line)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--color-semantic-primary-normal)',
          }}
        >
          {eyebrow}
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
