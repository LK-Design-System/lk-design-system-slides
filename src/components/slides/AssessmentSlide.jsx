import React from 'react';
import { StatusAssessment } from '../editorial/StatusAssessment.jsx';
import { ContentSlide } from './ContentSlide.jsx';
import { DeckMediumContext, resolveAutoAnchor } from './deckMedium.js';

/**
 * LDS Slides — AssessmentSlide
 * The status-report slide (the consulting traffic-light table): ContentSlide's
 * header contract, with the content region given to one Editorial
 * `StatusAssessment`. The judgment contract — closed vocabulary, text-spoken
 * statuses, achromatic met badge — lives upstream; the slide owns placement
 * and the source line. Unlike the emphasis-bearing slides (Stat/Figure/
 * Compare/Roadmap), no eyebrow settlement happens here: status tints are the
 * deviation channel, not the accent channel, so they do not compete with an
 * accented eyebrow.
 */
export function AssessmentSlide({ eyebrow, title, governing, metrics = [], caption, source, anchor, style, ...rest }) {
  // A small table is a band, a large one is a document: up to four metric
  // rows the exhibit centers by rule, five or more pin to the top (measured:
  // the gate pages' manual repairs chose center at 2 rows). A read deck
  // resolves to top; an explicit anchor wins (ADAPTIVE_CONTRACTS_PROPOSAL 변경 2).
  const medium = React.useContext(DeckMediumContext);
  const resolvedAnchor = anchor ?? resolveAutoAnchor(metrics.length <= 4 ? 'center' : 'top', medium);
  return (
    <ContentSlide
      eyebrow={eyebrow}
      title={title}
      governing={governing}
      data-lds-assessment-slide
      source={source}
      anchor={resolvedAnchor}
      style={style}
      {...rest}
    >
      <StatusAssessment metrics={metrics} caption={caption} />
    </ContentSlide>
  );
}
