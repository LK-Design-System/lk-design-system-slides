import React from 'react';
import { createDeckChannel } from './deckChannel.js';

/**
 * LDS Slides — the deck state machine.
 *
 * Shared by every view of a deck so there is one definition of "where the
 * talk is": slide order, the step counter, and the rules for moving between
 * them. DeckViewer and PresenterView differ in chrome, never in navigation —
 * a presenter who learns one has learned both.
 *
 * Pass `channel` to join a named deck: state is mirrored to every other view
 * on that channel, in this document and in other windows on the origin. Both
 * directions, because a presenter drives from whichever window is in front.
 */
export function useDeck({ children, initial = 0, channel }) {
  const slides = React.Children.toArray(children);
  const count = slides.length;
  const clamp = React.useCallback(
    (value) => Math.min(Math.max(value, 0), Math.max(count - 1, 0)),
    [count]
  );
  const [index, setIndex] = React.useState(() => clamp(initial));
  const [step, setStep] = React.useState(0);
  const [stepCount, setStepCount] = React.useState(0);
  const slideRef = React.useRef(null);
  // Set just before a backwards slide change so the incoming slide can open
  // fully revealed. A ref, not state: it must not schedule its own render.
  const enterAtEndRef = React.useRef(false);
  // A slide arriving from another view carries its own step, which must
  // survive the count pass below instead of being reset to the start.
  const pendingStepRef = React.useRef(null);

  // The step count is read from the rendered slide rather than declared by
  // the author: a layout composes its own steps, and asking every deck to
  // restate the total is a number that would go stale.
  React.useLayoutEffect(() => {
    const slide = slideRef.current;
    const declared = slide
      ? [...slide.querySelectorAll('[data-lds-step]')]
        .map((node) => Number(node.getAttribute('data-step-at')) || 0)
      : [];
    const total = declared.length > 0 ? Math.max(...declared) : 0;
    setStepCount(total);
    if (pendingStepRef.current !== null) {
      setStep(Math.min(pendingStepRef.current, total));
      pendingStepRef.current = null;
    } else {
      setStep(enterAtEndRef.current ? total : 0);
    }
    enterAtEndRef.current = false;
  }, [index]);

  const channelRef = React.useRef(null);
  // The position this view is currently adopting from a peer. Reaching a
  // peer's slide takes two commits — the index lands, then the count pass
  // lands the step — and the half-state in between must never be published or
  // the room is told to un-reveal what it has already seen. So the view stays
  // silent until it arrives, and that also swallows the echo that would
  // otherwise ping-pong between two views forever.
  //
  // It is a target rather than a flag because the layout effect that finishes
  // the adoption runs BEFORE the publish effect of the same commit: a flag
  // would already be cleared by the time publishing was decided.
  const adoptingRef = React.useRef(null);
  // The receiver needs to know where this view currently is, but reading it
  // from inside a setState updater would put a side effect in a function
  // React is free to call twice. Refs keep the decision outside.
  const indexRef = React.useRef(index);
  indexRef.current = index;
  const stateRef = React.useRef({ index, step });
  stateRef.current = { index, step };
  // A view announces only its own moves. The state it mounts with is a guess
  // about a talk already in progress, so publishing it would drag every other
  // view back to the start; it asks instead.
  const joinedRef = React.useRef(false);

  React.useEffect(() => {
    const bus = createDeckChannel(channel);
    channelRef.current = bus;
    joinedRef.current = false;
    bus?.subscribe(
      (state) => {
        if (!state) return;
        adoptingRef.current = state;
        if (state.index === indexRef.current) {
          // A slide change already in flight will finish with a count pass; if
          // a newer step arrives first, that pass must land the newer value.
          if (pendingStepRef.current !== null) pendingStepRef.current = state.step;
          setStep(state.step);
          return;
        }
        pendingStepRef.current = state.step;
        setIndex(clamp(state.index));
      },
      () => stateRef.current,
    );
    bus?.request();
    return () => {
      bus?.close();
      channelRef.current = null;
    };
  }, [channel, clamp]);

  React.useEffect(() => {
    const bus = channelRef.current;
    if (!bus) return;
    if (!joinedRef.current) {
      joinedRef.current = true;
      return;
    }
    const adopting = adoptingRef.current;
    if (adopting) {
      if (adopting.index === index && adopting.step === step) adoptingRef.current = null;
      return;
    }
    bus.publish({ index, step });
  }, [index, step]);

  // Any move the presenter makes here ends an adoption, even one that never
  // landed exactly (a peer's step can exceed what this slide offers).
  const drive = (change) => {
    adoptingRef.current = null;
    change();
  };

  const go = (next) => setIndex(clamp(next));
  const forward = () => drive(() => (step < stepCount ? setStep(step + 1) : go(index + 1)));
  const backward = () => drive(() => {
    if (step > 0) {
      setStep(step - 1);
      return;
    }
    if (index === 0) return;
    enterAtEndRef.current = true;
    setIndex(index - 1);
  });
  const jump = (next) => drive(() => {
    enterAtEndRef.current = false;
    go(next);
  });

  const deckKeyHandlers = {
    ArrowRight: forward,
    PageDown: forward,
    ArrowLeft: backward,
    PageUp: backward,
    Home: () => jump(0),
    End: () => jump(count - 1),
  };

  return {
    slides,
    count,
    index,
    step,
    stepCount,
    slideRef,
    forward,
    backward,
    jump,
    deckKeyHandlers,
    atStart: index === 0 && step === 0,
    atEnd: index === count - 1 && step === stepCount,
    notes: slides[index]?.props?.notes,
    nextSlide: slides[index + 1] ?? null,
  };
}
