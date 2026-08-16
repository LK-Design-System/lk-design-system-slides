import React from 'react';
import { StatusAssessment } from '../editorial/StatusAssessment.jsx';
import { ContentSlide } from './ContentSlide.jsx';

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
export function AssessmentSlide({ eyebrow, title, governing, metrics = [], caption, source, style, ...rest }) {
  return (
    <ContentSlide
      eyebrow={eyebrow}
      title={title}
      governing={governing}
      data-lds-assessment-slide
      source={source}
      style={style}
      {...rest}
    >
      <StatusAssessment metrics={metrics} caption={caption} />
    </ContentSlide>
  );
}
