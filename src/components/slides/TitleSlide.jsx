import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';
import { phrased } from './phrasing.jsx';

/**
 * LDS Slides — TitleSlide
 * The deck-opening layout: eyebrow, one display-scale title, optional
 * subtitle. Content stays start-aligned and inside the safe area; the
 * projection scale keeps it readable from the back of a room.
 */
export function TitleSlide({
  eyebrow, title, subtitle, lockup, style, ...rest
}) {
  return (
    <SlideSurface style={style} {...rest}>
      {/* A place for the brand mark. Core ships lockup components and guards
          for them, and this layout had nowhere to put one — so an external
          deck's cover could not carry a logo at all (COMPLETENESS_AUDIT D1).
          It is a SLOT, not a built-in: the mark belongs to Theme, its tone
          (ink on white, white on brand) is the caller's call, and a layout that
          imported a specific lockup would decide branding for every deck. */}
      {lockup && (
        <div data-slide-lockup style={{ margin: '0 0 var(--space-6)', display: 'flex', alignItems: 'center' }}>
          {lockup}
        </div>
      )}
      {eyebrow && (
        <p
          data-slide-eyebrow
          style={{
            margin: '0 0 var(--space-4)',
            fontSize: 'var(--slides-overline-size)',
            lineHeight: 'var(--slides-overline-line)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--slides-ink-accent)',
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
            fontSize: 'var(--slides-body-size)',
            lineHeight: 'var(--slides-body-line)',
            letterSpacing: 'var(--slides-body-spacing)',
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
