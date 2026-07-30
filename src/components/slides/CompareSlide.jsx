import React from 'react';
import { OptionAssessment } from '@lk-robotics/lds-editorial-ui';
import { ContentSlide } from './ContentSlide.jsx';

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
  style,
  ...rest
}) {
  const emphasisSpent = recommendation != null;

  return (
    <ContentSlide
      eyebrow={emphasisSpent ? undefined : eyebrow}
      title={title}
      governing={governing}
      data-lds-compare-slide
      data-emphasis-spent={emphasisSpent ? 'recommendation' : undefined}
      style={style}
      {...rest}
    >
      <OptionAssessment
        criteria={criteria}
        options={options}
        recommendation={recommendation}
        caption={caption}
      />
      {source && (
        <p
          data-compare-slide-source
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
