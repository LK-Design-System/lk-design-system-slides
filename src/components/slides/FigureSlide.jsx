import React from 'react';
import { AnnotatedFigure } from '../editorial/AnnotatedFigure.jsx';
import { ContentSlide } from './ContentSlide.jsx';

/**
 * LDS Slides — FigureSlide
 * The chart slide: ContentSlide's header contract, with the content region
 * given to one annotated figure. The slide renders no figure and no note —
 * `AnnotatedFigure` (Editorial) owns the annotation contract and the chart
 * inside it (Product, an image, an SVG) owns the drawing. One exhibit per
 * figure slide, mirrored from the exhibit-discipline convention: a second
 * chart is a second slide.
 *
 * The emphasis budget follows StatSlide: Editorial can only police emphasis
 * inside the figure, so the slide settles the remaining competition — when
 * an annotation spends emphasis, the accented eyebrow is dropped rather
 * than letting two accents argue across the slide.
 */
export function FigureSlide({
  eyebrow,
  title,
  governing,
  annotations = [],
  caption,
  source,
  children,
  style,
  ...rest
}) {
  const emphasisSpent = annotations.some((annotation) => Boolean(annotation.emphasis));

  return (
    <ContentSlide
      eyebrow={emphasisSpent ? undefined : eyebrow}
      title={title}
      governing={governing}
      data-lds-figure-slide
      source={source}
      data-emphasis-spent={emphasisSpent ? 'annotation' : undefined}
      style={style}
      {...rest}
    >
      <AnnotatedFigure annotations={annotations} caption={caption}>
        {children}
      </AnnotatedFigure>
    </ContentSlide>
  );
}
