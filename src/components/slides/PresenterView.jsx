import React from 'react';
import { DeckStepContext } from './stepContext.js';
import { DeckPositionContext } from './deckPosition.js';
import { useDeck } from './useDeck.js';

function formatElapsed(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

/**
 * LDS Slides — PresenterView
 * The presenter's side of a deck: what is on screen now, what is coming, the
 * notes for this slide, and how long the talk has run. It shares the deck
 * state machine with `DeckViewer`, so navigation is identical — a presenter
 * who learned the audience view has already learned this one.
 *
 * Three things this view owns and the audience view must never have:
 *
 * The NEXT slide, rendered small and inert. It is a rehearsal aid, not a
 * second canvas: hidden from assistive technology, unclickable, and always
 * fully revealed, because the presenter needs to see what is coming rather
 * than replay its cues.
 *
 * The NOTES, open by default. On the audience view notes are a mistake to be
 * kept out of the DOM; here they are the point.
 *
 * The CLOCK, which is the presenter's only private feedback about pace.
 *
 * Where this view lives is the app's call — a second window, a second
 * monitor, a phone. `channel` is what keeps the two in step, in this document
 * and across windows on the origin.
 */
export function PresenterView({
  children,
  initial = 0,
  channel,
  label = '발표자 화면',
  running = true,
  style,
  ...rest
}) {
  const {
    slides, count, index, step, stepCount, slideRef,
    forward, backward, deckKeyHandlers, atStart, atEnd, notes, nextSlide,
  } = useDeck({ children, initial, channel });
  const [elapsed, setElapsed] = React.useState(0);
  // Memoised so a step reveal does not hand the slide a new position object
  // and re-render every layout that reads the page number.
  const positionValue = React.useMemo(() => ({ page: index + 1, total: count }), [index, count]);

  React.useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const onKeyDown = (event) => {
    if (event.key in deckKeyHandlers) {
      event.preventDefault();
      deckKeyHandlers[event.key]();
    }
  };

  const paneStyle = {
    display: 'grid',
    gap: 'var(--space-3)',
    alignContent: 'start',
    minWidth: 0,
  };
  const paneLabel = {
    margin: 0,
    fontSize: 'var(--slides-fine-size)',
    lineHeight: 'var(--slides-fine-line)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 'var(--fw-semibold)',
    color: 'var(--color-semantic-label-alternative)',
  };

  return (
    <section
      data-lds-presenter-view
      role="group"
      aria-roledescription="발표자 화면"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={{
        display: 'grid',
        gap: 'var(--space-5)',
        outlineOffset: 4,
        fontFamily: 'var(--font-sans)',
        color: 'var(--color-semantic-label-normal)',
        ...style,
      }}
      {...rest}
    >
      <header
        data-presenter-chrome
        style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)' }}
      >
        <p
          data-presenter-elapsed
          aria-label="경과 시간"
          style={{
            margin: 0,
            fontSize: 'var(--slides-body-size)',
            lineHeight: 'var(--slides-body-line)',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 'var(--fw-bold)',
            color: 'var(--color-semantic-label-strong)',
          }}
        >
          {formatElapsed(elapsed)}
        </p>
        <button
          type="button"
          data-presenter-reset
          onClick={() => setElapsed(0)}
          style={{ font: 'inherit' }}
        >
          시간 초기화
        </button>
        <button type="button" data-presenter-prev onClick={backward} disabled={atStart} style={{ font: 'inherit' }}>
          이전
        </button>
        <button type="button" data-presenter-next onClick={forward} disabled={atEnd} style={{ font: 'inherit' }}>
          다음
        </button>
        <p
          data-presenter-progress
          aria-live="polite"
          style={{
            margin: '0 0 0 auto',
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
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: 'var(--space-6)' }}>
        <div style={paneStyle}>
          <p style={paneLabel}>현재</p>
          <div data-presenter-current ref={slideRef}>
            <DeckPositionContext.Provider value={positionValue}>
            <DeckStepContext.Provider value={step}>{slides[index]}</DeckStepContext.Provider>
          </DeckPositionContext.Provider>
          </div>
        </div>
        <div style={paneStyle}>
          <p style={paneLabel}>다음</p>
          {/* Inert on purpose: a preview the presenter reads, never a surface
              anyone can drive or a screen reader announces twice. No step
              context, so it shows the slide whole rather than mid-reveal. */}
          <div
            data-presenter-next-slide
            aria-hidden="true"
            style={{ pointerEvents: 'none', opacity: 0.72 }}
          >
            {nextSlide ?? (
              <p
                data-presenter-next-empty
                style={{
                  margin: 0,
                  fontSize: 'var(--slides-fine-size)',
                  lineHeight: 'var(--slides-fine-line)',
                  color: 'var(--color-semantic-label-alternative)',
                }}
              >
                마지막 슬라이드입니다.
              </p>
            )}
          </div>
          <p style={paneLabel}>노트</p>
          <div
            data-presenter-notes
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md, 12px)',
              border: '1px dashed var(--color-semantic-line-normal-normal)',
              background: 'var(--color-semantic-background-normal-alternative)',
              fontSize: 'var(--slides-fine-size)',
              lineHeight: 'var(--slides-fine-line)',
              letterSpacing: 'var(--slides-fine-spacing)',
              color: 'var(--color-semantic-label-neutral)',
            }}
          >
            {notes ?? '이 슬라이드에는 노트가 없습니다.'}
          </div>
        </div>
      </div>
    </section>
  );
}
