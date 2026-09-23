import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';
import { DeckMediumContext } from './deckMedium.js';
import { phrased } from './phrasing.jsx';
import { SlideEyebrow } from './SlideEyebrow.jsx';

// A content page on brand navy is a legibility problem, not a brand moment
// (tokens/slides.css). The restriction used to live only in a comment, and a
// content slide handed appearance="brand" rendered half-flipped — the eyebrow
// and chrome went to on-brand ink while the body stayed on white-surface
// tokens over navy. Refused here, reported on the node, warned once.
let brandRefusalWarned = false;

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
 * The header does not move either way — nor with the eyebrow: in a deck that
 * uses eyebrows anywhere, a slide without one keeps the eyebrow's line box, so
 * the title sits at the same height on every content slide of that deck. A
 * deck with no eyebrows, and a slide rendered on its own, keep the whole region.
 */
export function ContentSlide({ eyebrow, title, governing, anchor = 'top', appearance, children, style, ...rest }) {
  const brandRefused = appearance === 'brand';
  if (brandRefused && !brandRefusalWarned && typeof console !== 'undefined') {
    brandRefusalWarned = true;
    console.warn('[lds-slides] appearance="brand" is limited to cover, section, statement and end slides; a content layout stays on the white surface.');
  }
  // Every layout composes this one, so the content marker is only added when
  // the caller did not already name a more specific layout.
  const namesLayout = Object.keys(rest).some((key) => /^data-lds-[a-z-]+-slide$/.test(key));
  // A present-deck content slide without a claim is a slide with no reason,
  // and until now only the GATE knew it — the component rendered the gap in
  // silence, so the contract lived one repository-layer away from the thing
  // it governed. Breaches render on the canvas in this repository (Triptych
  // "레이블 없음", AnnotatedFigure "앵커 미확인"); this is the same idiom.
  // Read decks legitimately omit the claim (noun title + exhibit is that
  // genre's complete grammar), and outside a deck there is no medium to
  // judge by — both stay silent, so the catalogue is untouched.
  const medium = React.useContext(DeckMediumContext);
  const claimMissing = Boolean(medium) && medium.kind !== 'read' && !governing;
  return (
    <SlideSurface
      data-lds-content-slide={namesLayout ? undefined : ''}
      data-slides-appearance-refused={brandRefused ? 'brand' : undefined}
      appearance={brandRefused ? undefined : appearance}
      style={{ justifyContent: 'flex-start', ...style }}
      {...rest}
    >
      {/* data-slide-header VALUES name which of the three header stacks this
          is (content/cover/divider — HEADER_SYSTEM_PROPOSAL). Attribute
          presence selectors keep matching, so existing plays are unmoved. */}
      <header
        data-slide-header="content"
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
        <SlideEyebrow stack="content" reserve={Boolean(medium?.eyebrowSlot)}>{eyebrow}</SlideEyebrow>
        <h2
          data-slide-title
          style={{
            margin: 0,
            fontSize: 'var(--slides-title-size)',
            lineHeight: 'var(--slides-title-line)',
            letterSpacing: 'var(--slides-title-spacing)',
            fontWeight: 'var(--fw-bold)',
            // The ink indirection like every other header line (it read the
            // label token directly — the last header line that did).
            color: 'var(--slides-ink-strong)',
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
              color: 'var(--slides-ink-normal)',
              maxWidth: '46ch',
              textWrap: 'pretty',
            }}
          >
            {phrased(governing)}
          </p>
        )}
        {claimMissing && (
          <p
            data-slide-governing-missing
            style={{
              margin: 'var(--space-3) 0 0',
              fontSize: 'var(--slides-fine-size)',
              lineHeight: 'var(--slides-fine-line)',
              fontWeight: 'var(--fw-semibold)',
              color: 'var(--color-semantic-status-cautionary-text, var(--color-semantic-status-cautionary))',
            }}
          >
            거버닝 미기재 — 본문이 입증할 주장 한 문장이 필요합니다
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
          color: 'var(--slides-ink-neutral)',
        }}
      >
        {children}
      </div>
    </SlideSurface>
  );
}
