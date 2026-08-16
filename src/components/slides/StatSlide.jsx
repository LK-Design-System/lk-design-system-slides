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
      style={style}
      {...rest}
    >
      <div
        data-stat-slide-figures
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-9)',
          alignItems: 'flex-start',
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
      {source && (
        <p
          data-stat-slide-source
          style={{
            margin: 'var(--space-6) 0 0',
            fontSize: 'var(--slides-fine-size)',
            lineHeight: 'var(--slides-fine-line)',
            letterSpacing: 'var(--slides-fine-spacing)',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          {source}
        </p>
      )}
    </ContentSlide>
  );
}
