import React from 'react';
import { DeckStepContext } from './stepContext.js';
import { useDeck } from './useDeck.js';

/**
 * LDS Slides — DeckViewer
 * The deck container: owns slide order, keyboard navigation, the step
 * counter, and the progress display — and nothing inside a slide. One slide
 * is mounted at a time (a deck is a sequence, not a scroll), the ends clamp
 * rather than wrap (a presenter must feel the last slide), and every
 * navigation affordance exists twice: keys (← → Home End) for the presenter,
 * visible buttons for everyone else. The chrome sits on the alternative
 * background and stays quiet — the counter is fine print, and the progress
 * bar is the only accent the viewer spends.
 *
 * Steps come before slides. A slide holding `Step` elements spends ← → on
 * revealing them first and only then moves on, so one key drives the whole
 * talk. Stepping back into an earlier slide arrives at its END: going back
 * should show what the room was already shown, not replay it.
 *
 * Speaker notes are read off the slide element's own `notes` prop and never
 * enter the slide surface — the audience-facing canvas must not carry text
 * meant for the presenter. They stay hidden until asked for (`N`).
 *
 * `channel` joins a named deck, mirroring position with any other view on
 * that channel — a `PresenterView` in the presenter's second window drives
 * this one and follows it back.
 */
export function DeckViewer({
  children,
  initial = 0,
  channel,
  label = '슬라이드 덱',
  notesLabel = '발표자 노트',
  style,
  ...rest
}) {
  const {
    slides, count, index, step, stepCount, slideRef,
    forward, backward, deckKeyHandlers, atStart, atEnd, notes,
  } = useDeck({ children, initial, channel });
  const [showNotes, setShowNotes] = React.useState(false);

  const onKeyDown = (event) => {
    const handlers = {
      ...deckKeyHandlers,
      n: () => setShowNotes((visible) => !visible),
      N: () => setShowNotes((visible) => !visible),
    };
    if (event.key in handlers) {
      event.preventDefault();
      handlers[event.key]();
    }
  };

  return (
    <section
      data-lds-deck-viewer
      role="group"
      aria-roledescription="슬라이드 덱"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={{ display: 'grid', gap: 'var(--space-4)', outlineOffset: 4, ...style }}
      {...rest}
    >
      <div data-deck-slide ref={slideRef}>
        <DeckStepContext.Provider value={step}>{slides[index]}</DeckStepContext.Provider>
      </div>
      <footer
        data-deck-chrome
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <button
          type="button"
          data-deck-prev
          onClick={backward}
          disabled={atStart}
          style={{ font: 'inherit' }}
        >
          이전
        </button>
        <button
          type="button"
          data-deck-next
          onClick={forward}
          disabled={atEnd}
          style={{ font: 'inherit' }}
        >
          다음
        </button>
        {notes && (
          <button
            type="button"
            data-deck-notes-toggle
            aria-expanded={showNotes}
            onClick={() => setShowNotes((visible) => !visible)}
            style={{ font: 'inherit' }}
          >
            {notesLabel}
          </button>
        )}
        <div
          data-deck-progress-track
          aria-hidden="true"
          style={{
            flex: 1,
            height: 3,
            borderRadius: 'var(--radius-pill, 999px)',
            background: 'var(--color-semantic-fill-normal)',
            overflow: 'hidden',
          }}
        >
          <div
            data-deck-progress-fill
            style={{
              width: count > 0 ? `${((index + 1) / count) * 100}%` : 0,
              height: '100%',
              background: 'var(--color-semantic-primary-normal)',
            }}
          />
        </div>
        <p
          data-deck-progress
          aria-live="polite"
          style={{
            margin: 0,
            fontSize: 'var(--slides-fine-size)',
            lineHeight: 'var(--slides-fine-line)',
            letterSpacing: 'var(--slides-fine-spacing)',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          {count > 0 ? `${index + 1} / ${count}` : '0 / 0'}
          {stepCount > 0 ? ` · ${step} / ${stepCount}` : ''}
        </p>
      </footer>
      {notes && showNotes && (
        <aside
          data-deck-notes
          aria-label={notesLabel}
          style={{
            margin: 0,
            padding: 'var(--space-4) var(--space-5)',
            borderRadius: 'var(--radius-md, 12px)',
            border: '1px dashed var(--color-semantic-line-normal-normal)',
            background: 'var(--color-semantic-background-normal-alternative)',
            fontSize: 'var(--slides-fine-size)',
            lineHeight: 'var(--slides-fine-line)',
            letterSpacing: 'var(--slides-fine-spacing)',
            color: 'var(--color-semantic-label-neutral)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {notes}
        </aside>
      )}
    </section>
  );
}
