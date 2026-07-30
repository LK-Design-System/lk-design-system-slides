import React from 'react';

/**
 * LDS Slides — the deck's step counter.
 *
 * `null` means "no deck is counting" — a slide rendered on its own, in a
 * catalogue, or in a Docs page. Steps read that as fully revealed rather than
 * hiding content nobody can advance past.
 */
export const DeckStepContext = React.createContext(null);
