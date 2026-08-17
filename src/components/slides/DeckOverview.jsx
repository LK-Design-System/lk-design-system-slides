import React from 'react';
import { DeckStepContext } from './stepContext.js';
import { DeckPositionContext } from './deckPosition.js';

/**
 * LDS Slides — DeckOverview
 * The whole deck at once, as a grid of live slides (COMPLETENESS_AUDIT F1).
 * reveal.js and Slidev both ship this; the thing it answers is "where am I,
 * and what is left" — a question a presenter asks mid-talk and a reader asks
 * before deciding to read.
 *
 * The tiles are the REAL slides, not pictures of them. SlideSurface already
 * fits its canvas to whatever box it is given, so a slide in a 240px tile is
 * the same component doing the same thing it does at full size — which means
 * the overview can never drift from the deck the way a thumbnail cache would.
 * Steps render fully revealed here: a tile is a place, and a half-revealed
 * place is unrecognisable.
 *
 * It is a dialog, not a page: it opens over the talk and gives the slide back
 * when it closes. Choosing a tile is the only way to change position from
 * here — the overview navigates, it does not present.
 */
const ALL_STEPS_REVEALED = Number.MAX_SAFE_INTEGER;

export function DeckOverview({
  slides = [],
  index = 0,
  onSelect,
  onClose,
  label = '덱 개요',
}) {
  const currentRef = React.useRef(null);

  // The talk's position is where the eye should land, not the top of the grid.
  React.useEffect(() => {
    currentRef.current?.focus?.();
    currentRef.current?.scrollIntoView?.({ block: 'center' });
  }, []);

  return (
    <div
      data-lds-deck-overview
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose?.();
        }
      }}
      style={{
        display: 'grid',
        gap: 'var(--space-4)',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        padding: 'var(--space-4)',
        maxHeight: '70vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-md, 12px)',
        background: 'var(--color-semantic-background-normal-alternative)',
        border: '1px solid var(--color-semantic-line-normal-normal)',
      }}
    >
      {slides.map((slide, order) => {
        const current = order === index;
        return (
          <button
            // eslint-disable-next-line react/no-array-index-key
            key={order}
            type="button"
            ref={current ? currentRef : undefined}
            data-deck-overview-tile={order + 1}
            data-deck-overview-current={current ? 'true' : undefined}
            aria-current={current ? 'true' : undefined}
            onClick={() => onSelect?.(order)}
            style={{
              display: 'grid',
              gap: 'var(--space-2)',
              padding: 0,
              border: 0,
              background: 'none',
              cursor: 'pointer',
              font: 'inherit',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                borderRadius: 'var(--radius-sm, 8px)',
                // The current slide is marked by a ring rather than by scale
                // or colour: the tiles are real slides, and tinting one would
                // be the overview editing the deck.
                outline: current ? '2px solid var(--color-semantic-primary-normal)' : '1px solid var(--color-semantic-line-normal-normal)',
                outlineOffset: current ? 2 : 0,
                overflow: 'hidden',
                // A tile is inert: it is a picture of a place, and a chart or
                // link inside it must not take the click meant for the tile.
                pointerEvents: 'none',
              }}
            >
              <DeckPositionContext.Provider value={{ page: order + 1, total: slides.length }}>
                <DeckStepContext.Provider value={ALL_STEPS_REVEALED}>{slide}</DeckStepContext.Provider>
              </DeckPositionContext.Provider>
            </div>
            <span
              style={{
                fontSize: 'var(--slides-fine-size)',
                lineHeight: 'var(--slides-fine-line)',
                letterSpacing: 'var(--slides-fine-spacing)',
                fontVariantNumeric: 'tabular-nums',
                color: current ? 'var(--color-semantic-primary-strong)' : 'var(--color-semantic-label-alternative)',
              }}
            >
              {order + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
