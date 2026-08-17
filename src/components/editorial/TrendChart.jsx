import React from 'react';
import { LineChart } from '@lk-design-system/lds-product';

/**
 * LDS Editorial — TrendChart
 * Change over time, at reading distance. The chart itself is Core's LineChart
 * (scales, ticks, the accessible summary and the reference-line prose all stay
 * upstream); this layer owns the two things that decide whether a product
 * chart survives being put in front of a room.
 *
 * TYPE RANK. Upstream sizes its axis furniture in literals — 10px ticks, 10px
 * axis titles — which is right at a desk and gone from the back of a room.
 * Those literals became `--lk-chart-*` hooks whose fallbacks ARE the literals
 * (fifth instance of the medium re-point pattern, after Table, table cells,
 * Timeline and Stat), and this component re-points them at the editorial ramp.
 * Stroke weight travels the same way: a 2px line is a hair on a projection.
 *
 * SCALE. This is the subtle one, and the reason the component measures. Core's
 * chart is a responsive SVG — `width:100%` over a viewBox — so handing it a
 * viewBox smaller than the region does not lay it out wider, it MAGNIFIES it,
 * type included. That is precisely the rank inversion check:figure-fill was
 * written to catch (a diagram once painted 18px labels at 35px, larger than
 * its own slide's claim). So the chart is handed a viewBox equal to the box it
 * is actually granted: one design pixel, one chart pixel, and the ramp the
 * medium re-pointed is the ramp that paints.
 *
 * The measurement is `offsetWidth`, deliberately — the untransformed layout
 * width. A slide surface scales its canvas with a transform, so the rect
 * getBoundingClientRect reports is screen px; taking the layout box instead
 * keeps every number in canvas px with no scale to divide out.
 *
 * What this layer does NOT own: data. Series, domains and formatters are the
 * deck's, exactly as they are the product's upstream — an editorial wrapper
 * that started guessing at domains would be a second charting engine.
 */
const DEFAULT_ASPECT = 2.4;
// A ceiling in canvas px, because an aspect ratio alone cannot bound height: a
// figure with an annotation rail is granted ~830px and one without ~1100, and
// the same ratio turns the second into a chart 80px taller that pushes the
// caption into the source band (measured — caption 622–648 against a source
// pinned at 631). The slide's vertical budget is absolute, so the bound must be
// too. 320 leaves room for a caption under the tallest common FigureSlide.
const DEFAULT_MAX_HEIGHT = 320;

export function TrendChart({
  series = [],
  aspect = DEFAULT_ASPECT,
  maxHeight = DEFAULT_MAX_HEIGHT,
  minWidth = 320,
  // Both axis titles are swallowed, not forwarded, for one reason: an axis
  // title is a product-screen affordance and a figure on a slide already has a
  // caption. `yLabel` is drawn rotated 90° in a gutter sized for 10px ticks, so
  // at editorial rank it collides with the tick values (seen on the first
  // render) — and rotated type is the one thing every chart-text guide agrees
  // on (Datawrapper: don't rotate, don't centre), worse at projection distance
  // than anywhere else. `xLabel` is HTML that reads the PRODUCT caption ramp
  // directly, which no hook here can reach and this repository's own
  // style-ownership rule forbids reaching for. The unit rides `formatY`; what
  // the axes are rides the caption. Both belong to the deck either way.
  yLabel: _ignoredYLabel,
  xLabel: _ignoredXLabel,
  style,
  ...rest
}) {
  const hostRef = React.useRef(null);
  const [width, setWidth] = React.useState(null);

  React.useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const measure = () => {
      // Layout width, not the transformed rect: see the docstring.
      const next = host.offsetWidth;
      setWidth((previous) => (previous === next ? previous : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const resolvedWidth = Math.max(width ?? 0, minWidth);
  const resolvedHeight = Math.min(Math.round(resolvedWidth / aspect), maxHeight);

  return (
    <div
      ref={hostRef}
      data-lds-trend-chart
      style={{
        width: '100%',
        // The editorial ramp, handed to a component that only knows it has
        // hooks. Ticks and axis titles ride the caption rank — axis furniture
        // is the quietest thing on a figure — and the reference label rides
        // note-body, because a threshold is a claim about the data.
        '--lk-chart-tick-size': 'var(--editorial-caption-size)',
        '--lk-chart-axis-title-size': 'var(--editorial-caption-size)',
        '--lk-chart-reference-label-size': 'var(--editorial-note-body-size)',
        '--lk-chart-empty-label-size': 'var(--editorial-note-body-size)',
        '--lk-chart-series-stroke': 'var(--editorial-series-stroke, 3)',
        '--lk-chart-reference-stroke': 'var(--editorial-reference-stroke, 2)',
        ...style,
      }}
    >
      {/* Rendered only once measured: a first pass at the default 520px
          viewBox would paint a magnified chart for one frame, and on a
          headless capture that frame can be the one that gets photographed. */}
      {width !== null && (
        <LineChart series={series} width={resolvedWidth} height={resolvedHeight} {...rest} />
      )}
    </div>
  );
}
