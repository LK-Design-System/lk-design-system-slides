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
    // data-slide-header="cover": the header-grammar marker rides the SURFACE
    // here because on a cover the stack IS the whole slide — wrapping the
    // flex items in a real <header> would change margin collapsing and
    // cross-axis sizing for zero visual gain (HEADER_SYSTEM_PROPOSAL R3).
    <SlideSurface data-slide-header="cover" style={style} {...rest}>
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
            // The ramp's own tracking, not the Latin kicker idiom. uppercase +
            // 0.08em is an English smallcaps convention; every real eyebrow in
            // this repository is Korean, where uppercase is a no-op and tracking
            // out already-wide syllable blocks loosens them further
            // (HEADER_SYSTEM_PROPOSAL R2). English eyebrows lose smallcaps —
            // accepted; the English deck profile is a separate deferred item (E3).
            letterSpacing: 'var(--slides-overline-spacing)',
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
