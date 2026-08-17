import React from 'react';

/**
 * LDS Slides — the presentation runtime seams (COMPLETENESS_AUDIT F1).
 *
 * Three behaviours that reveal.js and Slidev both treat as core, and that a
 * deck viewer without them cannot be used for an actual talk: going
 * fullscreen, addressing a slide by URL, and seeing the whole deck at once.
 * They live here rather than inside DeckViewer because each is a small piece
 * of browser plumbing with its own failure mode, and DeckViewer's own subject
 * is navigation state.
 */

/**
 * Fullscreen, with the browser's own state as the single source of truth.
 * Asking the element whether it is fullscreen (rather than tracking a boolean)
 * is what keeps the button honest when the user leaves by pressing Escape —
 * a keypress the page never sees as a keydown it can act on.
 */
export function useFullscreen(elementRef) {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const sync = () => setActive(document.fullscreenElement === elementRef.current);
    document.addEventListener('fullscreenchange', sync);
    sync();
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [elementRef]);

  const toggle = React.useCallback(() => {
    const element = elementRef.current;
    if (!element) return;
    if (document.fullscreenElement === element) {
      document.exitFullscreen?.();
      return;
    }
    // Storybook and any other embedding runs the deck in an iframe; without
    // allow="fullscreen" the request rejects. Swallow it — a deck that throws
    // on a chrome affordance is worse than one that stays windowed.
    element.requestFullscreen?.().catch(() => {});
  }, [elementRef]);

  return { active, toggle };
}

/**
 * The location hash as a deck address: `#7` is slide 7, `#7.2` is its second
 * step. One-based because it is a human-facing address — it must match the
 * page number the viewer prints, or "look at 13" sends the reader somewhere
 * else.
 *
 * Two directions, and the read direction is the delicate one: the hash is
 * adopted on mount and whenever it changes from outside (a pasted link, the
 * back button), but a hash this component itself just wrote must not bounce
 * back as an instruction, or every navigation would be applied twice.
 */
export function parseDeckHash(hash) {
  const match = /^#(\d+)(?:\.(\d+))?$/.exec(hash ?? '');
  if (!match) return null;
  return { index: Number(match[1]) - 1, step: Number(match[2] ?? 0) };
}

export function formatDeckHash(index, step) {
  return `#${index + 1}${step > 0 ? `.${step}` : ''}`;
}

export function useHashPosition({
  enabled, index, step, count, onAdopt,
}) {
  const writtenRef = React.useRef(null);
  const onAdoptRef = React.useRef(onAdopt);
  onAdoptRef.current = onAdopt;
  // Read inside the listener, so a hash arriving later is judged against the
  // deck that is mounted now rather than the one mounted when the effect ran.
  const countRef = React.useRef(count);
  countRef.current = count;
  // Where the deck actually is, for correcting the bar when a stale address is
  // rejected. The write effect below cannot do it: its dependencies did not
  // change — that is the whole situation — so it never re-runs.
  const positionRef = React.useRef({ index, step });
  positionRef.current = { index, step };

  // Read: on mount and on every external change.
  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;
    const adopt = () => {
      const hash = window.location.hash;
      if (hash === writtenRef.current) return;
      const position = parseDeckHash(hash);
      if (!position) return;
      // An address outside this deck is not a position in it — it is a STALE
      // address, and the only honest thing to do with one is refuse it.
      // Clamping was the first cut and it was wrong in a way that shows up
      // constantly: carrying `#9` from a 16-slide deck into a 4-slide one
      // opened the second deck at 4/4, its last page (measured). Nobody who
      // follows a link means "wherever this lands".
      //
      // Refusing is only half of it — the bar still shows the dead address, and
      // a reader who copies it passes the lie on. So the bar is corrected here
      // rather than by the write effect, which cannot help: its dependencies
      // did not change, and that is precisely the situation.
      if (position.index < 0 || position.index >= countRef.current) {
        if (countRef.current > 0) {
          const truthful = formatDeckHash(positionRef.current.index, positionRef.current.step);
          writtenRef.current = truthful;
          window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${truthful}`);
        }
        return;
      }
      onAdoptRef.current?.(position);
    };
    adopt();
    window.addEventListener('hashchange', adopt);
    return () => window.removeEventListener('hashchange', adopt);
  }, [enabled]);

  // Write: replaceState, not assignment — a talk is not twenty entries of
  // browser history, and the back button should leave the deck, not step
  // backwards through it.
  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined' || count === 0) return;
    const next = formatDeckHash(index, step);
    if (window.location.hash === next) return;
    writtenRef.current = next;
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`);
  }, [enabled, index, step, count]);
}
