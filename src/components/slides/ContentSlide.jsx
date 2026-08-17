import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';
import { phrased } from './phrasing.jsx';

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
 *
 * `anchor` places the content inside the region the header leaves over:
 * `'top'` (default) is the workhorse contract every surveyed system keeps
 * for dense slides; `'center'` opts a short body — one table, one figure —
 * into the middle of the remaining space instead of leaving the bottom half
 * of the canvas dead (COMPOSITION_PROPOSAL.md C, the Marp `lead` shape).
 * The header does not move either way.
 */
export function ContentSlide({ eyebrow, title, governing, anchor = 'top', children, style, ...rest }) {
  return (
    <SlideSurface style={{ justifyContent: 'flex-start', ...style }} {...rest}>
      <header
        data-slide-header
        style={{
          // The header/body boundary belongs to the preset: keynote draws it
          // as whitespace (rule width 0), briefing as a rule under a thin
          // band — the Korean report grammar, where the edge does the work
          // the type-size step does on stage (tokens/slides.css).
          marginBottom: 'var(--slides-header-gap)',
          paddingBottom: 'var(--slides-header-pad)',
          borderBottom: 'var(--slides-header-rule-width) solid var(--slides-header-rule-color)',
        }}
      >
        {eyebrow && (
          <p
            data-slide-eyebrow
            style={{
              margin: '0 0 var(--space-2)',
              fontSize: 'var(--slides-overline-size)',
              lineHeight: 'var(--slides-overline-line)',
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
            textWrap: 'balance',
          }}
        >
          {phrased(title)}
        </h2>
        {governing && (
          <p
            data-slide-governing
            style={{
              margin: 'var(--space-3) 0 0',
              // Its own rung, not body's: the briefing grammar sets the claim
              // one step above the body it governs (keynote aliases them).
              fontSize: 'var(--slides-governing-size)',
              lineHeight: 'var(--slides-governing-line)',
              letterSpacing: 'var(--slides-body-spacing)',
              // The tier's class weight. governing rides title2, and the
              // baseline lists 400/500/700 for title tiers — semibold was an
              // off-ramp weight the deck's most important sentence happened to
              // wear (weight audit, 2026-08-17). Judged against 500/700
              // renders: 500 speaks at the body's volume, and a claim that
              // sounds like its evidence is not a claim.
              fontWeight: 'var(--fw-bold)',
              color: 'var(--color-semantic-label-normal)',
              maxWidth: '46ch',
              textWrap: 'pretty',
            }}
          >
            {phrased(governing)}
          </p>
        )}
      </header>
      <div
        data-slide-content
        data-slide-anchor={anchor === 'center' ? 'center' : undefined}
        style={{
          flex: 1,
          minHeight: 0,
          ...(anchor === 'center'
            ? { display: 'flex', flexDirection: 'column', justifyContent: 'center' }
            : {}),
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
