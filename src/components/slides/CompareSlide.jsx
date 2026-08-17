import React from 'react';
import { OptionAssessment } from '../editorial/OptionAssessment.jsx';
import { ContentSlide } from './ContentSlide.jsx';
import { DeckMediumContext, resolveAutoAnchor } from './deckMedium.js';

/**
 * LDS Slides — CompareSlide
 * The option-assessment slide (the consulting comparison-table pattern):
 * ContentSlide's header contract, with the content region given to one
 * Editorial `OptionAssessment`. The judgment contract — closed verdict
 * vocabulary, text-spoken verdicts, one recommended column — lives
 * upstream in Editorial; the slide owns placement, the source line, and
 * the emphasis settlement: a recommendation is spent emphasis, so the
 * accented eyebrow is dropped, same as StatSlide and FigureSlide.
 */
export function CompareSlide({
  eyebrow,
  title,
  governing,
  criteria = [],
  options = [],
  recommendation,
  caption,
  source,
  anchor,
  style,
  ...rest
}) {
  const emphasisSpent = recommendation != null;

  // Same band-or-document rule as AssessmentSlide: up to four option rows
  // center by rule, more pin to the top; read resolves to top; an explicit
  // anchor wins (ADAPTIVE_CONTRACTS_PROPOSAL 변경 2).
  const medium = React.useContext(DeckMediumContext);
  const resolvedAnchor = anchor ?? resolveAutoAnchor(options.length <= 4 ? 'center' : 'top', medium);

  return (
    <ContentSlide
      eyebrow={emphasisSpent ? undefined : eyebrow}
      title={title}
      governing={governing}
      data-lds-compare-slide
      source={source}
      data-emphasis-spent={emphasisSpent ? 'recommendation' : undefined}
      anchor={resolvedAnchor}
      style={style}
      {...rest}
    >
      <OptionAssessment
        criteria={criteria}
        options={options}
        recommendation={recommendation}
        caption={caption}
      />
    </ContentSlide>
  );
}
