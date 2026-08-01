import React from 'react';
import { DeckPositionContext } from './deckPosition.js';

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
 */
export function SlideSurface({
  children,
  safeArea = true,
  preset,
  // Speaker notes ride on the slide element so DeckViewer can read them off
  // its own children, but they must never reach the canvas: the surface the
  // room sees carries nothing written for the presenter. Destructured here so
  // it neither renders nor leaks onto the DOM node.
  notes,
  // Footer label — usually the deck or team name. The page number comes from
  // the deck, not from here. `footer={false}` drops the whole strip.
  foot,
  footer = true,
  style,
  ...rest
}) {
  const frameRef = React.useRef(null);
  const [scale, setScale] = React.useState(null);
  const position = React.useContext(DeckPositionContext);
  const showFooter = footer !== false && (foot || position);

  // Layout effect, not effect: the first paint must already be scaled, or the
  // slide flashes at full logical size before snapping down.
  React.useLayoutEffect(() => {
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
  }, []);

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
        data-slides-preset={preset}
        style={{
          boxSizing: 'border-box',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 'var(--slides-canvas-width)',
          aspectRatio: 'var(--slides-aspect)',
          transform: `scale(${scale ?? 1})`,
          transformOrigin: 'top left',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: safeArea ? 'var(--slides-safe-y) var(--slides-safe-x)' : 0,
          background: 'var(--slides-surface)',
          border: '1px solid var(--slides-surface-edge)',
          borderRadius: 'var(--radius-md, 12px)',
          color: 'var(--color-semantic-label-normal)',
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
              bottom: 'var(--space-4)',
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
            <span data-slide-foot-label>{foot}</span>
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
