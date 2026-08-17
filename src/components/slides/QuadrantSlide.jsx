import React from 'react';
import { ContentSlide } from './ContentSlide.jsx';

/**
 * LDS Slides — QuadrantSlide
 * A 2×2 matrix: the priority matrix, the effort/impact grid, the classic
 * consulting placement (COMPLETENESS_AUDIT C1).
 *
 * Why it cannot be a table. CompareSlide already puts options against criteria,
 * and for most comparisons that is the better instrument — a table is readable
 * and a scatter is not. What a table cannot say is the thing this layout exists
 * for: **the position IS the claim**. "High impact, low effort" is an argument
 * about where something sits relative to two continua, and a cell reading
 * "high/low" turns a continuum into a label.
 *
 * So items are placed by coordinate, not by quadrant name: `x` and `y` are
 * 0–1 along the two axes. A quadrant name would be the table again, one level
 * up. The four quadrant labels are optional furniture that names the regions
 * the reader is already seeing.
 *
 * Emphasis is one item, like everywhere else in this system. Collision is the
 * author's composition — two items at the same coordinate is a statement that
 * they rank the same, and moving them apart automatically would be the layout
 * editing the argument. What the layout does guarantee is that nothing lands
 * outside the plot: coordinates are clamped, and an item without coordinates is
 * reported rather than dropped at the origin.
 *
 * Axis direction is stated in words at both ends, never assumed. "Effort" with
 * an arrow means nothing without knowing which way is more.
 */
const clamp01 = (value) => Math.min(Math.max(Number(value), 0), 1);
const hasCoordinates = (item) => Number.isFinite(Number(item.x)) && Number.isFinite(Number(item.y));

export function QuadrantSlide({
  xAxis = {},
  yAxis = {},
  quadrants = [],
  items = [],
  style,
  ...rest
}) {
  let emphasisTaken = false;
  const marked = items.map((item) => {
    const granted = Boolean(item.emphasis) && !emphasisTaken;
    if (granted) emphasisTaken = true;
    return { ...item, emphasis: granted };
  });
  const placed = marked.filter(hasCoordinates);
  const unplaced = marked.filter((item) => !hasCoordinates(item));

  const axisLabel = {
    margin: 0,
    fontSize: 'var(--slides-fine-size)',
    lineHeight: 'var(--slides-fine-line)',
    letterSpacing: 'var(--slides-fine-spacing)',
    color: 'var(--color-semantic-label-alternative)',
  };
  const axisName = {
    ...axisLabel,
    fontWeight: 'var(--fw-semibold)',
    color: 'var(--color-semantic-label-strong)',
  };

  return (
    <ContentSlide data-lds-quadrant-slide style={style} {...rest}>
      <div
        data-slide-quadrant
        style={{
          display: 'grid',
          // A column for the y-axis rail, then the plot. Three rows: the
          // y-axis NAME on top (horizontal — see below), the plot, then the
          // x-axis rail. The rails are chrome and take only what they need.
          gridTemplateColumns: 'auto minmax(0, 1fr)',
          gridTemplateRows: 'auto minmax(0, 1fr) auto',
          columnGap: 'var(--space-3)',
          rowGap: 'var(--space-2)',
          height: '100%',
          minHeight: 0,
        }}
      >
        {/* The y-axis NAME sits horizontally above the plot, not sideways
            beside it. Korean set in `writing-mode: vertical-rl` stacks one
            syllable block per line and collided with the pole labels on the
            first render — and rotated type is the thing every chart-text guide
            tells you not to do (this repository already banned it inside
            TrendChart, so allowing it here would be the same mistake twice). */}
        <div
          data-quadrant-y-name
          style={{
            gridRow: 1, gridColumn: 2, ...axisName, paddingBottom: 'var(--space-2)',
          }}
        >
          {yAxis.name}
        </div>

        <div
          data-quadrant-y-axis
          style={{
            gridRow: 2,
            gridColumn: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 'var(--space-2)',
          }}
        >
          <span style={axisLabel}>{yAxis.high ?? '높음'}</span>
          <span style={axisLabel}>{yAxis.low ?? '낮음'}</span>
        </div>

        <div
          data-quadrant-plot
          style={{
            gridRow: 2,
            gridColumn: 2,
            position: 'relative',
            minHeight: 0,
            border: '1px solid var(--color-semantic-line-normal-normal)',
            borderRadius: 'var(--radius-2, 4px)',
            background: 'var(--color-semantic-fill-alternative)',
          }}
        >
          {/* The two dividing lines: the axes themselves, drawn once. */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'var(--color-semantic-line-normal-normal)',
          }}
          />
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'var(--color-semantic-line-normal-normal)',
          }}
          />

          {quadrants.slice(0, 4).map((quadrant, order) => {
            // Reading order is the matrix's own: top-left, top-right,
            // bottom-left, bottom-right.
            const top = order < 2;
            const left = order % 2 === 0;
            return (
              <span
                key={quadrant.label ?? order}
                data-quadrant-label={order + 1}
                style={{
                  position: 'absolute',
                  ...(top ? { top: 'var(--space-3)' } : { bottom: 'var(--space-3)' }),
                  ...(left ? { left: 'var(--space-3)' } : { right: 'var(--space-3)' }),
                  fontSize: 'var(--slides-fine-size)',
                  lineHeight: 'var(--slides-fine-line)',
                  letterSpacing: 'var(--slides-fine-spacing)',
                  color: 'var(--color-semantic-label-assistive)',
                }}
              >
                {quadrant.label}
              </span>
            );
          })}

          {placed.map((item, order) => {
            const x = clamp01(item.x);
            const y = clamp01(item.y);
            return (
              <span
                key={item.id ?? item.label ?? order}
                data-quadrant-item
                data-item-emphasis={item.emphasis ? 'true' : undefined}
                style={{
                  position: 'absolute',
                  left: `${x * 100}%`,
                  // y grows upward, as an axis does; CSS grows downward.
                  top: `${(1 - y) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '46%',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-pill, 999px)',
                  fontSize: 'var(--slides-caption-size)',
                  lineHeight: 'var(--slides-caption-line)',
                  letterSpacing: 'var(--slides-caption-spacing)',
                  textAlign: 'center',
                  background: item.emphasis
                    ? 'var(--color-semantic-primary-normal)'
                    : 'var(--color-semantic-background-elevated-normal)',
                  color: item.emphasis
                    ? 'var(--color-semantic-static-white, #fff)'
                    : 'var(--color-semantic-label-strong)',
                  fontWeight: item.emphasis ? 'var(--fw-semibold)' : 'var(--fw-regular)',
                  border: item.emphasis ? 'none' : '1px solid var(--color-semantic-line-normal-normal)',
                }}
              >
                {item.label}
              </span>
            );
          })}
        </div>

        <div
          data-quadrant-x-axis
          style={{
            gridRow: 3,
            gridColumn: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 'var(--space-2)',
          }}
        >
          <span style={axisLabel}>{xAxis.low ?? '낮음'}</span>
          <span style={axisName}>{xAxis.name}</span>
          <span style={axisLabel}>{xAxis.high ?? '높음'}</span>
        </div>

        {unplaced.length > 0 && (
          <p
            data-quadrant-unplaced
            style={{
              gridRow: 4,
              gridColumn: '1 / -1',
              margin: 0,
              fontSize: 'var(--slides-fine-size)',
              lineHeight: 'var(--slides-fine-line)',
              letterSpacing: 'var(--slides-fine-spacing)',
              color: 'var(--color-semantic-status-cautionary-text, var(--color-semantic-status-cautionary))',
            }}
          >
            좌표 미지정: {unplaced.map((item) => item.label).join(', ')}
          </p>
        )}
      </div>
    </ContentSlide>
  );
}
