import React from 'react';

/**
 * LDS Slides — Fit
 * Borrows room for content that runs past its frame: if the children are
 * taller than the space they have, they scale down — never up.
 *
 * This exists because the canvas is a fixed logical size. A fluid box grew
 * when a slide got too full; a fixed canvas with `overflow: hidden` instead
 * CLIPS, and clipped content is worse than ugly content because nobody sees
 * it go. So overflow gets two answers, not one: `Fit` absorbs what a little
 * scaling can absorb, and what it cannot absorb it REPORTS — `data-fit-overflow`
 * plus a console warning — so `check:slide-overflow` fails the build instead of
 * a slide quietly losing its last bullet in the room.
 *
 * The floor is where absorbing stops being honest. tahta (the Slidev design
 * system this borrows the shape from) pins it at a constant 0.42; this system
 * already owns a stronger answer, so the floor is DERIVED: body type may
 * shrink no further than `--slides-fine-*`, the smallest step the projection
 * ramp sanctions. That makes the floor follow the preset for free — briefing
 * decks may borrow a little more than keynote decks, because their floor sits
 * lower to begin with. Pin `--slides-fit-floor` to override.
 *
 * Measurement is in LAYOUT pixels (`clientHeight`, `scrollHeight`), which are
 * taken before transforms — so neither the canvas's own fit-to-container scale
 * nor this component's scale feeds back into the number being measured.
 */
const FALLBACK_FLOOR = 0.66;

export function Fit({ children, style, ...rest }) {
  const outerRef = React.useRef(null);
  const innerRef = React.useRef(null);
  const [scale, setScale] = React.useState(1);
  const [overflows, setOverflows] = React.useState(false);
  const warnedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return undefined;

    const measure = () => {
      const available = outer.clientHeight;
      const needed = inner.scrollHeight;
      // Not laid out yet (an inactive slide, a 0×0 frame) — a later observation
      // will re-measure rather than committing a meaningless scale.
      if (!available || !needed) return;

      const computed = getComputedStyle(outer);
      const pinned = Number.parseFloat(computed.getPropertyValue('--slides-fit-floor'));
      const fine = Number.parseFloat(computed.getPropertyValue('--slides-fine-size'));
      const body = Number.parseFloat(computed.getPropertyValue('--slides-body-size'));
      const floor = Number.isFinite(pinned) && pinned > 0
        ? pinned
        : (fine > 0 && body > 0 ? fine / body : FALLBACK_FLOOR);

      const ideal = available / needed;
      const next = needed > available + 1 ? Math.max(floor, ideal) : 1;
      const past = ideal < floor;

      setScale((previous) => (Math.abs(previous - next) < 0.001 ? previous : next));
      setOverflows(past);
      if (past && !warnedRef.current) {
        warnedRef.current = true;
        // eslint-disable-next-line no-console
        console.warn(
          `[lds-slides] Fit: ${Math.round(needed)}px of content in a ${Math.round(available)}px frame `
          + `needs ${ideal.toFixed(2)}× but the projection floor is ${floor.toFixed(2)}× — split this slide or cut it.`,
        );
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      data-lds-fit
      data-fit-scale={scale.toFixed(3)}
      data-fit-overflow={overflows ? 'true' : undefined}
      style={{ height: '100%', minHeight: 0, overflow: 'hidden', ...style }}
      {...rest}
    >
      <div
        ref={innerRef}
        data-fit-content
        style={{
          width: '100%',
          transform: `scale(${scale})`,
          // Top-left: these layouts are left-aligned, and an origin that moved
          // the left edge would make shrinking look like indenting.
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}
