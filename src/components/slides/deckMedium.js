import React from 'react';

/**
 * The deck's medium axes, provided by DeckViewer/PresenterView and read by
 * slides: `preset` (token axis — a slide's own prop overrides) and `kind`
 * (consumption axis — 'present' | 'read'; the adaptive anchor rules resolve
 * to top on a read deck, where pages read as documents).
 *
 * Null outside a deck (catalogue, Docs): slides fall back to their own
 * defaults, so a standalone render is byte-identical to before this context
 * existed (ADAPTIVE_CONTRACTS_PROPOSAL 변경 1).
 */
export const DeckMediumContext = React.createContext(null);

/** Resolve an auto anchor against the deck's kind: a read page is a document
 * and never centers by rule — only by an explicit prop. */
export function resolveAutoAnchor(auto, medium) {
  return medium?.kind === 'read' ? 'top' : auto;
}
