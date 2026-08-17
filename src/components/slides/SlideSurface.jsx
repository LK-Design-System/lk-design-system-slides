import React from 'react';
import { DeckPositionContext } from './deckPosition.js';
import { DeckMediumContext } from './deckMedium.js';

const pad = (value) => String(value ?? '').padStart(2, '0');

/**
 * LDS Slides — SlideSurface
 * The one canonical slide canvas: a 16:9 surface that scales with its
 * container and keeps content inside the projection-safe area. Layout
 * components render inside it; it owns geometry, never content meaning.
 *
 * The canvas is a FIXED logical size (`--slides-canvas-width`) fitted to the
 * container with a transform, not a fluid box. This is the difference between
 * a slide and a web page: a fluid box keeps type at a fixed pixel size while
 * the box shrinks, so the type grows relative to the canvas, less content
 * fits, and the projection floor the tokens promise is only true at exactly
 * one width. Scaling a fixed canvas moves everything together — every
 * `--slides-*` value is a DESIGN pixel, measured against a 1280px canvas, and
 * the layout a deck author sees is the layout the room gets at any size.
 *
 * `preset` names the deck kind ('keynote' | 'briefing'): it only switches
 * which `--slides-*` token values apply. Unset means the `:root` default
 * (keynote — the strictest projection floor).
 *
 * `scale` decides who owns the fit:
 *
 * - `'auto'` (default) — this component measures its frame and scales itself,
 *   which is what a browser deck wants.
 * - `'none'` — the canvas draws at its logical size and the caller places it.
 *   For renderers that step time by hand, the measurement is a liability: the
 *   layout effect and its ResizeObserver may or may not have run before a
 *   frame is captured, so the same input can produce a scaled or an unscaled
 *   screenshot. Callers used to force this by overwriting `transform` from the
 *   outside; `scale="none"` makes it a contract instead, and skips the
 *   measurement entirely rather than measuring and discarding the result.
 */
export function SlideSurface({
  children,
  safeArea = true,
  preset,
  // Colour appearance of the canvas: undefined is the white reading surface,
  // 'brand' is the navy cover. A LAYOUT axis, not a theme one — a deck brands
  // its covers and keeps its content pages white, which a Theme swap cannot
  // express — and it works by re-pointing --slides-surface and --slides-ink-*
  // in this element's own scope, so every layout reading those follows without
  // knowing it moved (COMPLETENESS_AUDIT D1).
  appearance,
  // Document grade ("대외비", "내부용") and a standing brand mark. Usually set
  // once on the deck; these props are the per-slide override.
  classification,
  mark,
  scale: scaleMode = 'auto',
  // Speaker notes ride on the slide element so DeckViewer can read them off
  // its own children, but they must never reach the canvas: the surface the
  // room sees carries nothing written for the presenter. Destructured here so
  // it neither renders nor leaks onto the DOM node.
  notes,
  // Footer label — usually the deck or team name. The page number comes from
  // the deck, not from here. `footer={false}` drops the whole strip.
  foot,
  footer = true,
  // Provenance line ("출처: …"). Slide chrome, not content: on a slide the
  // source is pinned to the bottom of the canvas whatever the content does
  // — a source trailing the content mid-canvas is a document idiom (the
  // same class of mistake as a vertical timeline). Sits just above the
  // footer strip, in the same out-of-flow band.
  source,
  style,
  ...rest
}) {
  const medium = React.useContext(DeckMediumContext);
  const effectivePreset = preset ?? medium?.preset;
  // Document grade and standing mark are DECK properties that print on every
  // page (COMPLETENESS_AUDIT D2). Set per slide they would eventually be
  // missing from one, and a classification missing from one page is the whole
  // marking failing — so the deck states them once and every surface obeys,
  // with a per-slide override only as an escape hatch.
  const resolvedClassification = classification ?? medium?.classification;
  const resolvedMark = mark ?? medium?.mark;
  const frameRef = React.useRef(null);
  const [scale, setScale] = React.useState(null);
  const position = React.useContext(DeckPositionContext);
  const showFooter = footer !== false && (foot || position);

  // Layout effect, not effect: the first paint must already be scaled, or the
  // slide flashes at full logical size before snapping down.
  React.useLayoutEffect(() => {
    if (scaleMode === 'none') return undefined;
    const frame = frameRef.current;
    if (!frame) return undefined;
    const update = () => {
      // Read the token every pass so a preset or theme that re-points the
      // canvas width is picked up without a remount.
      const canvasWidth = Number.parseFloat(
        getComputedStyle(frame).getPropertyValue('--slides-canvas-width'),
      ) || 1280;
      const frameWidth = frame.getBoundingClientRect().width;
      const next = frameWidth > 0 ? frameWidth / canvasWidth : 1;
      setScale((previous) => (previous !== null && Math.abs(previous - next) < 0.0001 ? previous : next));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [scaleMode]);

  return (
    <div
      ref={frameRef}
      data-lds-slide-frame
      style={{
        // The frame reserves exactly the space the scaled canvas draws in.
        // `transform` does not change a layout box, so an in-flow canvas would
        // still measure its full logical height and leave dead space under
        // every slide; taking it out of flow lets the frame's aspect ratio be
        // the only thing that sizes the slot.
        position: 'relative',
        width: '100%',
        maxWidth: 'var(--slides-canvas-max-width)',
        aspectRatio: 'var(--slides-aspect)',
      }}
    >
      <section
        data-lds-slide-surface
        data-slides-preset={effectivePreset}
        data-slides-appearance={appearance}
        style={{
          boxSizing: 'border-box',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 'var(--slides-canvas-width)',
          aspectRatio: 'var(--slides-aspect)',
          ...(scaleMode === 'none' ? {} : {
            transform: `scale(${scale ?? 1})`,
            transformOrigin: 'top left',
          }),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: safeArea ? 'var(--slides-safe-y) var(--slides-safe-x)' : 0,
          background: 'var(--slides-surface)',
          border: '1px solid var(--slides-surface-edge)',
          borderRadius: 'var(--radius-md, 12px)',
          color: 'var(--slides-ink-normal)',
          fontFamily: 'var(--font-sans)',
          // Upstream Korean-copy contract (Core typography.css): lines break
          // between words, never mid-word. Inherited, so one declaration on
          // the canvas covers every layout and the deck's own markup.
          wordBreak: 'keep-all',
          overflow: 'hidden',
          ...style,
        }}
        {...rest}
      >
        {children}
        {source && (
          // Out of flow like the footer: chrome must not contribute to the
          // canvas's scroll height, or the overflow gate would measure it
          // as content.
          <p
            data-slide-source
            style={{
              position: 'absolute',
              left: 'var(--slides-safe-x)',
              right: 'var(--slides-safe-x)',
              bottom: showFooter
                ? 'calc(var(--space-6) + var(--slides-fine-line) + var(--space-3))'
                : 'var(--space-6)',
              margin: 0,
              fontSize: 'var(--slides-fine-size)',
              lineHeight: 'var(--slides-fine-line)',
              letterSpacing: 'var(--slides-fine-spacing)',
              color: 'var(--color-semantic-label-alternative)',
            }}
          >
            {source}
          </p>
        )}
        {resolvedClassification && (
          // Top-right, out of flow like every other piece of chrome. A grade
          // marking sits at the top because that is where a reader checks it
          // before reading, and it is set in cautionary tone rather than as a
          // decorative badge — this is the one label on the canvas that must
          // not be mistaken for content or for a status pill.
          <p
            data-slide-classification
            style={{
              position: 'absolute',
              top: 'var(--space-6)',
              right: 'var(--slides-safe-x)',
              margin: 0,
              fontSize: 'var(--slides-fine-size)',
              lineHeight: 'var(--slides-fine-line)',
              letterSpacing: '0.08em',
              fontWeight: 'var(--fw-semibold)',
              color: 'var(--color-semantic-status-cautionary-text, var(--color-semantic-status-cautionary))',
            }}
          >
            {resolvedClassification}
          </p>
        )}
        {showFooter && (
          // Out of flow on purpose. The footer sits in the bottom safe-area
          // band, below where content stops, so adding it re-flows nothing and
          // contributes nothing to the canvas's scroll height — the overflow
          // gate keeps measuring content, not chrome.
          <footer
            data-slide-foot
            style={{
              position: 'absolute',
              left: 'var(--slides-safe-x)',
              right: 'var(--slides-safe-x)',
              // space-6, not space-4: at 16px the band visually merged with
              // the 12px rounded corner and read as stuck to the edge
              // (user-flagged). 24px clears the corner radius with room to
              // spare and still keeps the whole chrome stack inside the
              // keynote margin band.
              bottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              fontSize: 'var(--slides-fine-size)',
              lineHeight: 'var(--slides-fine-line)',
              letterSpacing: 'var(--slides-fine-spacing)',
              color: 'var(--color-semantic-label-alternative)',
            }}
          >
            <span
              data-slide-foot-label
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              {/* A standing mark in the chrome — the logo a Korean report
                  carries on every page. It comes from the deck, not the slide:
                  a mark set per slide is a mark that will be missing on one.
                  The slot takes a node, so the mark stays Theme's. */}
              {resolvedMark && <span data-slide-mark style={{ display: 'inline-flex' }}>{resolvedMark}</span>}
              {foot}
            </span>
            {position && (
              <span data-slide-page style={{ fontVariantNumeric: 'tabular-nums' }}>
                <span data-slide-page-current>{pad(position.page)}</span>
                {' / '}
                {pad(position.total)}
              </span>
            )}
          </footer>
        )}
      </section>
    </div>
  );
}
