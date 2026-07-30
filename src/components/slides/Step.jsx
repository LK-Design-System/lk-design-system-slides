import React from 'react';
import { DeckStepContext } from './stepContext.js';

/**
 * LDS Slides — Step
 * Progressive disclosure: content that arrives on the presenter's cue rather
 * than with the slide. `at` is the cue number within the slide, counting from
 * one; DeckViewer owns the counter and spends ← → on steps before it spends
 * them on slides.
 *
 * The contract is that REVEALING MUST NOT REFLOW. A pending step keeps its
 * box — it is transparent, not unmounted and not `display: none` — so the
 * slide is laid out once, in its final composition, and the audience never
 * watches text jump as items appear. A deck author can therefore trust the
 * fit they see with everything revealed.
 *
 * Outside a deck the context is `null` and every step renders revealed: a
 * slide in a catalogue must show its whole content, not an empty canvas.
 *
 * `as` picks the element so a step can be the list item it belongs to rather
 * than a div wrapped around one — the reveal contract must not cost the
 * markup its semantics.
 */
export function Step({ at = 1, as: Element = 'div', children, style, ...rest }) {
  const current = React.useContext(DeckStepContext);
  const revealed = current === null || current >= at;
  return (
    <Element
      data-lds-step
      data-step-at={at}
      data-step-state={revealed ? 'revealed' : 'pending'}
      // Transparent content is still in the accessibility tree, so a pending
      // step has to be hidden from assistive technology explicitly or a
      // screen reader reads ahead of the room.
      aria-hidden={revealed ? undefined : 'true'}
      style={{
        opacity: revealed ? 1 : 0,
        transition: 'opacity var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Element>
  );
}
