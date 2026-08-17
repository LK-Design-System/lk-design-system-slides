import React from 'react';
import { NarrativeTimeline } from '../editorial/NarrativeTimeline.jsx';
import { ContentSlide } from './ContentSlide.jsx';
import { DeckMediumContext, resolveAutoAnchor } from './deckMedium.js';

/**
 * LDS Slides — RoadmapSlide
 * The phases slide (the consulting roadmap pattern): ContentSlide's header
 * contract, with the content region given to one Editorial
 * `NarrativeTimeline`. The chronology contract lives upstream — events
 * sort themselves, an undated phase is a visible footnote rather than a
 * guess on the rail, and rhythm is not duration. The slide owns placement,
 * the source line, and the emphasis settlement: an emphasized phase is
 * spent emphasis, so the accented eyebrow is dropped, same as the other
 * figure-bearing slides.
 */
export function RoadmapSlide({ eyebrow, title, governing, phases = [], source, anchor, style, ...rest }) {
  const emphasisSpent = phases.some((phase) => Boolean(phase.emphasis));
  // A horizontal rail is one band — it centers by rule (measured: the manual
  // repair chose center); a read deck resolves to top. Explicit anchor wins.
  const medium = React.useContext(DeckMediumContext);
  const resolvedAnchor = anchor ?? resolveAutoAnchor('center', medium);

  return (
    <ContentSlide
      eyebrow={emphasisSpent ? undefined : eyebrow}
      title={title}
      governing={governing}
      data-lds-roadmap-slide
      source={source}
      data-emphasis-spent={emphasisSpent ? 'phase' : undefined}
      anchor={resolvedAnchor}
      style={style}
      {...rest}
    >
      {/* The slide medium reads a chronology left-to-right: a vertical rail
          is a document idiom, and on a fixed canvas it strands the right
          half (full-deck review, 2026-08-16). */}
      <NarrativeTimeline events={phases} label="실행 로드맵" direction="row" />
    </ContentSlide>
  );
}
