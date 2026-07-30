import React from 'react';

/**
 * LDS Slides — where this slide sits in its deck.
 *
 * `null` means no deck is counting — a slide in a catalogue, a Docs page, a
 * single layout under review. Those render without a page number rather than
 * inventing "1 / 1", because a lone slide has no position to report.
 *
 * Separate from the step counter on purpose: a step is something a presenter
 * spends inside one slide, a position is where that slide falls in the talk.
 * Conflating them would make a layout that reads the page number re-render on
 * every reveal.
 */
export const DeckPositionContext = React.createContext(null);
