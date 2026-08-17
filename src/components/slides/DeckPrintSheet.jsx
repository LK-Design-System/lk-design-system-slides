import React from 'react';
import { DeckStepContext } from './stepContext.js';
import { DeckPositionContext } from './deckPosition.js';
import { DeckMediumContext } from './deckMedium.js';

/**
 * LDS Slides — DeckPrintSheet
 * The deck as paper. One surface, two consumers: a browser's print dialog and
 * `scripts/export-pdf.mjs` — the export path is not a second renderer, it is
 * this sheet driven by Playwright, so a PDF cannot drift from what the screen
 * shows (COMPLETENESS_AUDIT A1).
 *
 * Three things it must undo, each of them something DeckViewer does on purpose:
 *
 * - ONE SLIDE AT A TIME. A deck mounts a single slide because a talk is a
 *   sequence; paper is not, so every child is mounted here, each in its own
 *   page box.
 * - THE FITTING TRANSFORM. SlideSurface scales the 1280px logical canvas into
 *   whatever container it is given. On paper the page IS the canvas, so each
 *   child is cloned with `scale="none"` and seated in a 1280px-wide box: the
 *   design pixel becomes the print pixel and nothing is resampled.
 * - THE CHROME. Buttons, the progress bar and the notes toggle are presenter
 *   affordances. They are not rendered at all here rather than hidden by print
 *   CSS, because a sheet that carries them is one stylesheet away from
 *   printing them.
 *
 * Step reveals COLLAPSE: each slide prints fully revealed. A leave-behind
 * shows what the room ended up seeing, and a reader who gets four near
 * identical pages learns nothing from the first three. (Slidev's
 * `--with-clicks` is the opposite choice, offered as an option; if the demand
 * appears it belongs here as a mode, not as a second sheet.)
 *
 * ONE REQUIREMENT ON THE CALLER: mount the sheet at the page root. A component
 * cannot undo an ancestor's padding, and 32px of it pushes the first page down
 * and slices every slide across a sheet boundary — measured here, where this
 * repository's own Storybook decorator turned a 4-slide deck into a 6-page PDF.
 * check:print-sheet measures the sheet's offset under print media so the
 * requirement is enforced rather than merely written here.
 *
 * The `@page` size lives in a style element this component renders. It cannot
 * be an inline style — `@page` is not a property — and putting it in a
 * stylesheet consumers must remember to import would make the export depend
 * on setup that has nothing to do with the deck. The sheet carries its own
 * paper definition.
 */
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const PAGE_RULES = `
@page { size: ${CANVAS_WIDTH}px ${CANVAS_HEIGHT}px; margin: 0; }
@media print {
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  [data-lds-print-sheet] { gap: 0 !important; }
  [data-lds-print-page] { break-after: page; break-inside: avoid; }
  [data-lds-print-page]:last-child { break-after: auto; }
  /* The surface keeps its edge on screen so pages read as cards; on paper the
     page boundary already says where a slide ends. */
  [data-lds-print-page] [data-lds-slide-surface] { border: 0 !important; border-radius: 0 !important; }
}
`;

// Every Step in the deck is revealed: larger than any authored `at`.
const ALL_STEPS_REVEALED = Number.MAX_SAFE_INTEGER;

export function DeckPrintSheet({
  children,
  kind = 'present',
  preset,
  // The grade marking matters more on paper than on screen: paper is the copy
  // that leaves the building.
  classification,
  mark,
  label = '슬라이드 덱 (인쇄용)',
  style,
  ...rest
}) {
  const slides = React.Children.toArray(children);
  const total = slides.length;
  const mediumValue = React.useMemo(
    () => ({
      preset, kind, classification, mark,
    }),
    [preset, kind, classification, mark],
  );

  return (
    <div
      data-lds-print-sheet
      data-lds-deck-kind={kind}
      data-print-page-count={total}
      role="document"
      aria-label={label}
      style={{
        display: 'grid',
        // On screen the pages read as a stack of cards; print collapses it.
        gap: 'var(--space-6, 32px)',
        justifyItems: 'center',
        background: 'var(--color-semantic-background-band, transparent)',
        ...style,
      }}
      {...rest}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: PAGE_RULES }} />
      <DeckMediumContext.Provider value={mediumValue}>
        {slides.map((slide, index) => (
          <article
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            data-lds-print-page
            data-print-page={index + 1}
            style={{ width: CANVAS_WIDTH, maxWidth: '100%' }}
          >
            <DeckPositionContext.Provider value={{ page: index + 1, total }}>
              <DeckStepContext.Provider value={ALL_STEPS_REVEALED}>
                {React.isValidElement(slide) ? React.cloneElement(slide, { scale: 'none' }) : slide}
              </DeckStepContext.Provider>
            </DeckPositionContext.Provider>
          </article>
        ))}
      </DeckMediumContext.Provider>
    </div>
  );
}
