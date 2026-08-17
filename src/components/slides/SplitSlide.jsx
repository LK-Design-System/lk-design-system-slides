import React from 'react';
import { ContentSlide } from './ContentSlide.jsx';

/**
 * LDS Slides — SplitSlide
 * The two-pane content layout: ContentSlide's header contract (eyebrow,
 * title, governing all flow through) with the content region split into
 * left and right panes. The slide owns the split geometry — the ratio
 * vocabulary and the gutter — and nothing about what fills a pane.
 *
 * `ratio` is a closed vocabulary ('1:1' | '2:1' | '1:2'), not free-form
 * columns: a slide is read in one glance, and past two panes (or past a
 * 2:1 skew) the layout stops being a comparison and starts being a grid —
 * that belongs to a table or a figure inside one pane.
 */
const RATIOS = { '1:1': [1, 1], '2:1': [2, 1], '1:2': [1, 2] };

export function SplitSlide({ ratio = '1:1', anchor, left, right, style, ...rest }) {
  const [a, b] = RATIOS[ratio] ?? RATIOS['1:1'];

  return (
    <ContentSlide data-lds-split-slide data-slide-ratio={ratio} anchor={anchor} style={style} {...rest}>
      <div
        data-slide-split
        style={{
          display: 'grid',
          gridTemplateColumns: `${a}fr ${b}fr`,
          gap: 'var(--space-8)',
          height: '100%',
          minHeight: 0,
          alignItems: 'start',
          // The pane grid fills the region, so the region's own centring has
          // nothing left to move — `anchor="center"` was silently a no-op here
          // until this line. Moving the ROW TRACK is what centres the pair;
          // centring the ITEMS instead would let two panes of different length
          // drift apart, and a comparison's two columns must start on one line
          // (which is what alignItems: start is for).
          alignContent: anchor === 'center' ? 'center' : 'stretch',
        }}
      >
        <div data-slide-pane="left" style={{ minWidth: 0 }}>
          {left}
        </div>
        <div data-slide-pane="right" style={{ minWidth: 0 }}>
          {right}
        </div>
      </div>
    </ContentSlide>
  );
}
