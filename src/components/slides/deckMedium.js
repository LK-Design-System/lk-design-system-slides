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

/**
 * Whether any slide of the deck carries an eyebrow — the deck-wide switch for
 * ContentSlide's reserved eyebrow line (HEADER_SYSTEM_PROPOSAL R5).
 *
 * The title only jumps between slides when a deck MIXES eyebrowed and bare
 * content slides, so the slot is reserved exactly then. A deck that never
 * uses an eyebrow keeps the whole region: reserving it everywhere cost every
 * bare content slide ~38 design px, and two dense exhibit slides ran into
 * the chrome band the moment it shipped (check:deck-content, chrome-intrusion).
 * Read off the slide elements' props — a deck-defined wrapper that hides its
 * eyebrow inside is not seen, and simply does not get the reservation.
 */
export function deckUsesEyebrows(slides) {
  return slides.some((slide) => React.isValidElement(slide) && Boolean(slide.props?.eyebrow));
}

/** Resolve an auto anchor against the deck's kind: a read page is a document
 * and never centers by rule — only by an explicit prop. */
export function resolveAutoAnchor(auto, medium) {
  return medium?.kind === 'read' ? 'top' : auto;
}
