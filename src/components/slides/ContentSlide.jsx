import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';

/**
 * LDS Slides — ContentSlide
 * The workhorse layout: eyebrow + title header pinned to the top of the
 * safe area, content region below. The slide owns the header contract and
 * the content region's type default; what goes inside is the deck's call.
 *
 * `governing` is the Korean-report header contract (제목/거버닝/본문): one
 * complete-sentence claim under the title that the body then substantiates.
 * The title stays a noun-ended label; the governing message is where the
 * sentence lives. The slide owns its position and type — one claim, between
 * title and content, at body scale — not its wording.
 */
export function ContentSlide({ eyebrow, title, governing, children, style, ...rest }) {
  return (
    <SlideSurface style={{ justifyContent: 'flex-start', ...style }} {...rest}>
      <header data-slide-header style={{ marginBottom: 'var(--space-8)' }}>
        {eyebrow && (
          <p
            data-slide-eyebrow
            style={{
              margin: '0 0 var(--space-2)',
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
            fontSize: 'var(--slides-title-size)',
            lineHeight: 'var(--slides-title-line)',
            letterSpacing: 'var(--slides-title-spacing)',
            fontWeight: 'var(--fw-bold)',
            color: 'var(--color-semantic-label-strong)',
          }}
        >
          {title}
        </h2>
        {governing && (
          <p
            data-slide-governing
            style={{
              margin: 'var(--space-3) 0 0',
              fontSize: 'var(--slides-body-size)',
              lineHeight: 'var(--slides-body-line)',
              letterSpacing: 'var(--slides-body-spacing)',
              fontWeight: 'var(--fw-semibold)',
              color: 'var(--color-semantic-label-normal)',
              maxWidth: '46ch',
            }}
          >
            {governing}
          </p>
        )}
      </header>
      <div
        data-slide-content
        style={{
          flex: 1,
          minHeight: 0,
          fontSize: 'var(--slides-body-size)',
          lineHeight: 'var(--slides-body-line)',
          letterSpacing: 'var(--slides-body-spacing)',
          color: 'var(--color-semantic-label-neutral)',
        }}
      >
        {children}
      </div>
    </SlideSurface>
  );
}
