import React from 'react';
import { DeckStepContext } from './stepContext.js';
import { DeckPositionContext } from './deckPosition.js';
import { useDeck } from './useDeck.js';
import { DeckMediumContext } from './deckMedium.js';
import { DeckPrintSheet } from './DeckPrintSheet.jsx';
import { DeckOverview } from './DeckOverview.jsx';
import { useFullscreen, useHashPosition } from './deckRuntime.js';

// The print seam. Any deck — including every deck already written — becomes a
// print sheet by appending `?lds-print=1` to its URL, which is how the
// neighbours do it too (reveal's `?print-pdf`, Slidev's `/print`). The
// alternative was a `print` prop, but a prop only helps decks written after it
// exists: the person who needs a PDF has an URL in front of them, not a source
// file. `print` still overrides, so a consumer can mount the sheet directly.
const PRINT_PARAM = 'lds-print';
function printModeFromLocation() {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).has(PRINT_PARAM);
  } catch {
    return false;
  }
}

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
 *
 * `kind` is the consumption axis (READING_DECK_PROPOSAL 변경 1): 'present'
 * (default) is a deck someone talks over; 'read' is a leave-behind that
 * circulates and gets scanned page by page. It is a content-discipline
 * axis, orthogonal to the token axis (`preset`) — it changes nothing the
 * viewer renders, only the `data-lds-deck-kind` attribute the content gate
 * reads to pick its rule profile (read: no governing mandate, larger body
 * budget, no under-fill rule).
 */
export function DeckViewer({
  children,
  initial = 0,
  channel,
  kind = 'present',
  preset,
  print,
  // Runtime-only props are destructured here so the print branch does not
  // forward them onto a DOM node — paper has no fullscreen.
  deepLink,
  label = '슬라이드 덱',
  notesLabel = '발표자 노트',
  overviewLabel,
  fullscreenLabel,
  fullscreenExitLabel,
  style,
  ...rest
}) {
  // Read once: a print run must not change shape halfway through, and the
  // sheet has no navigation to keep in sync.
  const [urlPrint] = React.useState(printModeFromLocation);
  if (print ?? urlPrint) {
    return (
      <DeckPrintSheet kind={kind} preset={preset} label={label} style={style} {...rest}>
        {children}
      </DeckPrintSheet>
    );
  }
  return (
    <DeckViewerRuntime
      initial={initial}
      channel={channel}
      kind={kind}
      preset={preset}
      deepLink={deepLink}
      label={label}
      notesLabel={notesLabel}
      overviewLabel={overviewLabel}
      fullscreenLabel={fullscreenLabel}
      fullscreenExitLabel={fullscreenExitLabel}
      style={style}
      {...rest}
    >
      {children}
    </DeckViewerRuntime>
  );
}

function DeckViewerRuntime({
  children,
  initial = 0,
  channel,
  kind = 'present',
  preset,
  deepLink = true,
  label = '슬라이드 덱',
  notesLabel = '발표자 노트',
  overviewLabel = '개요',
  fullscreenLabel = '전체화면',
  fullscreenExitLabel = '전체화면 종료',
  style,
  ...rest
}) {
  const {
    slides, count, index, step, stepCount, slideRef,
    forward, backward, jump, deckKeyHandlers, atStart, atEnd, notes,
  } = useDeck({ children, initial, channel });
  const [showNotes, setShowNotes] = React.useState(false);
  const [showOverview, setShowOverview] = React.useState(false);
  const rootRef = React.useRef(null);
  const fullscreen = useFullscreen(rootRef);
  // The address bar is a navigation surface: `#7` is slide 7. Off by default
  // for a deck that shares its page with anything else — two decks writing one
  // hash would fight — and on for the ordinary case of a deck on its own page.
  useHashPosition({
    enabled: deepLink,
    index,
    step,
    count,
    onAdopt: (position) => {
      if (position.index === index && position.step === step) return;
      jump(position.index);
    },
  });
  // Memoised so a step reveal does not hand the slide a new position object
  // and re-render every layout that reads the page number.
  const positionValue = React.useMemo(() => ({ page: index + 1, total: count }), [index, count]);
  // The deck's medium axes flow to every slide: preset as an overridable
  // default, kind for the adaptive anchor rules (ADAPTIVE_CONTRACTS_PROPOSAL).
  const mediumValue = React.useMemo(() => ({ preset, kind }), [preset, kind]);

  const onKeyDown = (event) => {
    const toggleOverview = () => setShowOverview((visible) => !visible);
    // In the overview the arrows would move a slide nobody is looking at, so
    // only the keys that concern the overview itself are live.
    const handlers = showOverview
      ? { Escape: () => setShowOverview(false), o: toggleOverview, O: toggleOverview }
      : {
        ...deckKeyHandlers,
        n: () => setShowNotes((visible) => !visible),
        N: () => setShowNotes((visible) => !visible),
        f: fullscreen.toggle,
        F: fullscreen.toggle,
        o: toggleOverview,
        O: toggleOverview,
        Escape: toggleOverview,
      };
    if (event.key in handlers) {
      event.preventDefault();
      handlers[event.key]();
    }
  };

  return (
    <section
      ref={rootRef}
      data-lds-deck-viewer
      data-lds-deck-kind={kind}
      data-deck-fullscreen={fullscreen.active ? 'true' : undefined}
      role="group"
      aria-roledescription="슬라이드 덱"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={{
        display: 'grid',
        gap: 'var(--space-4)',
        outlineOffset: 4,
        // Fullscreen makes this element the whole screen, so it owns the
        // background the slide sits on — otherwise the canvas floats on black.
        ...(fullscreen.active
          ? {
            alignContent: 'center',
            padding: 'var(--space-4)',
            background: 'var(--color-semantic-background-normal-alternative)',
          }
          : null),
        ...style,
      }}
      {...rest}
    >
      <div data-deck-slide ref={slideRef}>
        <DeckMediumContext.Provider value={mediumValue}>
        <DeckPositionContext.Provider value={positionValue}>
            <DeckStepContext.Provider value={step}>{slides[index]}</DeckStepContext.Provider>
          </DeckPositionContext.Provider>
        </DeckMediumContext.Provider>
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
        <button
          type="button"
          data-deck-overview-toggle
          aria-expanded={showOverview}
          onClick={() => setShowOverview((visible) => !visible)}
          style={{ font: 'inherit' }}
        >
          {overviewLabel}
        </button>
        <button
          type="button"
          data-deck-fullscreen-toggle
          aria-pressed={fullscreen.active}
          onClick={fullscreen.toggle}
          style={{ font: 'inherit' }}
        >
          {fullscreen.active ? fullscreenExitLabel : fullscreenLabel}
        </button>
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
      {showOverview && (
        <DeckOverview
          slides={slides}
          index={index}
          onSelect={(next) => {
            jump(next);
            setShowOverview(false);
          }}
          onClose={() => setShowOverview(false)}
        />
      )}
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
