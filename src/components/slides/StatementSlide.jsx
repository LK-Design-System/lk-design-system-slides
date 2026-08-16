import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';
import { phrased } from './phrasing.jsx';
import { sparseScale, SPARSE_TYPE } from './sparseScale.js';

/**
 * LDS Slides — StatementSlide
 * One claim, the whole canvas. Where ContentSlide substantiates a claim with
 * a body, this layout is the claim: display scale, centred, nothing beside
 * it. Use it for the assertion a deck turns on, or — with `attribution` — for
 * a quotation, which is the same shape with a source attached.
 *
 * The emphasis budget is why the eyebrow is quiet here. On every other layout
 * the eyebrow carries the accent; on this one the statement is the accent, so
 * the eyebrow steps down to a label tone rather than competing with the only
 * thing on the slide.
 *
 * The statement is a SENTENCE, not a noun-ended title — the same split
 * ContentSlide draws between `title` and `governing`. The slide owns its
 * scale, measure, and position; the wording is the deck's.
 */
export function StatementSlide({ eyebrow, statement, attribution, style, ...rest }) {
  // Length decides the tier (COMPOSITION_PROPOSAL.md B): a short claim
  // carries hero, a sentence stays at display. Centred either way — the
  // sparse family composes to the middle of the canvas, per every surveyed
  // peer's statement/fact layout.
  const scale = sparseScale(statement);
  return (
    <SlideSurface
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        ...style,
      }}
      {...rest}
    >
      {eyebrow && (
        <p
          data-slide-eyebrow
          style={{
            margin: '0 0 var(--space-5)',
            // The overline step — one size for the whole eyebrow family,
            // deck-wide (see slides.css). Quietness stays a COLOR decision:
            // this one wears the label tone because the statement owns the
            // slide's only accent.
            fontSize: 'var(--slides-overline-size)',
            lineHeight: 'var(--slides-overline-line)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          {eyebrow}
        </p>
      )}
      <p
        data-slide-statement
        data-slide-scale={scale}
        style={{
          margin: 0,
          ...SPARSE_TYPE[scale],
          fontWeight: 'var(--fw-bold)',
          color: 'var(--color-semantic-label-strong)',
          // A statement that runs the full canvas width stops reading as one
          // breath; the measure forces it to break where a speaker would.
          maxWidth: '22ch',
          textWrap: 'balance',
        }}
      >
        {phrased(statement)}
      </p>
      {attribution && (
        <p
          data-slide-attribution
          style={{
            margin: 'var(--space-6) 0 0',
            fontSize: 'var(--slides-caption-size)',
            lineHeight: 'var(--slides-caption-line)',
            letterSpacing: 'var(--slides-caption-spacing)',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          {attribution}
        </p>
      )}
    </SlideSurface>
  );
}
