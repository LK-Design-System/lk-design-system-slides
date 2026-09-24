// The content and figure thresholds, in one place. The gates enforce them,
// and check:skill-shipping holds the prose that teaches them (README, the
// shipped deck skill, AGENT_SKILL_REFERENCE) to the same numbers — the
// numbers used to live as literals in each gate and as retyped digits in
// each document, with nothing tying the two. Sources for every value are in
// the header of check-deck-content.mjs and check-figure-fill.mjs.
export const CONTENT = Object.freeze({
  governingChars: 55,
  bullets: 7,
  bodyCap: Object.freeze({ present: 140, read: 300 }),
  statementBudget: 2,
});

export const FIGURE = Object.freeze({
  minimumFill: 0.70,
});
