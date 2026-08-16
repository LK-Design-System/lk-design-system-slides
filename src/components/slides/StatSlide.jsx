import React from 'react';
import { KeyFigure } from '../editorial/KeyFigure.jsx';
import { ContentSlide } from './ContentSlide.jsx';

/**
 * LDS Slides — StatSlide
 * A figure slide: the header contract from ContentSlide, and a row of key
 * figures below it. The slide places and ranks; it does not render numerals —
 * `KeyFigure` (Editorial) owns the claim frame and Product's `Stat` owns the
 * numeral. Nothing about a number is re-implemented here.
 *
 * The slide is where "one claim at a time" becomes enforceable. Editorial can
 * only police emphasis inside a single figure; the competition is between
 * figures, and between a figure and the slide's own eyebrow. So the budget is
 * spent here: the first figure asking for emphasis gets it, the rest are
 * demoted, and a slide that spends emphasis on a figure drops the accented
 * eyebrow rather than letting two accents argue.
 */
export function StatSlide({ eyebrow, title, figures = [], source, style, ...rest }) {
  let emphasisTaken = false;
  const resolved = figures.map((figure) => {
    const granted = Boolean(figure.emphasis) && !emphasisTaken;
    if (granted) emphasisTaken = true;
    return { ...figure, emphasis: granted };
  });

  return (
    <ContentSlide
      eyebrow={emphasisTaken ? undefined : eyebrow}
      title={title}
      data-lds-stat-slide
      data-emphasis-spent={emphasisTaken ? 'figure' : undefined}
      source={source}
      style={style}
      {...rest}
    >
      <div
        data-stat-slide-figures
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          // Was `var(--space-9)` — a step the 4px ramp never had, so the gap
          // silently resolved to 0 and the cards touched (the exact
          // missing-token failure SKILL.md's 함정 2 warns about, found live
          // 2026-08-16). The figure-gap seam is the real knob.
          gap: 'var(--editorial-figure-gap)',
          alignItems: 'flex-start',
          // The cards' inline padding is invisible on every card that is not
          // spending emphasis (transparent background), so without this the
          // whole row reads as indented for no reason relative to the
          // header. Bleed the cards outward instead: numerals align with the
          // title, and an emphasis surface extends past the text edge the
          // way a hover surface does.
          marginInline: 'calc(var(--editorial-figure-pad-inline) * -1)',
        }}
      >
        {resolved.map(({ id, ...figure }, index) => (
          // Figures share the row's width instead of huddling at their
          // intrinsic size — two figures take half the canvas each, four a
          // quarter (COMPOSITION_PROPOSAL.md A). The 240px basis keeps the
          // wrap behavior: a crowd of figures still breaks into rows instead
          // of squeezing. The slide owns placement, so this is a direct
          // call, not a seam variable.
          <KeyFigure key={id ?? index} style={{ flex: '1 1 240px', minWidth: 0 }} {...figure} />
        ))}
      </div>
    </ContentSlide>
  );
}
