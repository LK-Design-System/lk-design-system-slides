import React from 'react';

function deltaText(start, end) {
  if (end < start) return `▲${start - end}`;
  if (end > start) return `▼${end - start}`;
  return '–';
}

/**
 * LDS Editorial — RankShift
 * Rank change between two points in time as a slope graphic. Ranks are
 * ordinal, not measured: the slope is the primary channel, color is
 * reinforcement. Every item is labeled directly with its rank on both
 * sides (no color-only legend), and at most one item carries emphasis —
 * if several ask, the first wins and the rest are demoted.
 */
export function RankShift({ items = [], startLabel, endLabel, rowHeight = 28, style, ...rest }) {
  let emphasisTaken = false;
  const resolved = items.map((item) => {
    const wantsEmphasis = Boolean(item.emphasis);
    const granted = wantsEmphasis && !emphasisTaken;
    if (granted) emphasisTaken = true;
    return { ...item, emphasis: granted };
  });

  const maxRank = Math.max(1, ...resolved.flatMap((item) => [item.start, item.end]));
  const height = maxRank * rowHeight;
  const centerY = (rank) => (rank - 0.5) * rowHeight;
  const emphasized = resolved.find((item) => item.emphasis);
  const ariaLabel = emphasized
    ? `순위 변화, ${startLabel} 대비 ${endLabel}: ${emphasized.label} ${emphasized.start}위에서 ${emphasized.end}위로`
    : `순위 변화, ${startLabel} 대비 ${endLabel}`;

  // Labels sit in real grid rows (one per rank) so the columns size to the
  // longest label instead of collapsing under absolutely positioned text.
  const rankColumnStyle = {
    display: 'grid',
    gridTemplateRows: `repeat(${maxRank}, ${rowHeight}px)`,
  };
  const labelStyle = (item, rank) => ({
    gridRow: rank,
    alignSelf: 'center',
    whiteSpace: 'nowrap',
    fontSize: 'var(--editorial-note-size)',
    lineHeight: `${rowHeight}px`,
    letterSpacing: 'var(--editorial-note-spacing)',
    fontWeight: item.emphasis ? 'var(--fw-bold)' : 'var(--fw-medium)',
    color: item.emphasis ? 'var(--color-semantic-primary-strong)' : 'var(--color-semantic-label-neutral)',
  });

  return (
    <div
      data-lds-rank-shift
      role="img"
      aria-label={ariaLabel}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(96px, 1fr) auto',
        gap: 'var(--space-3)',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 'var(--space-2)' }}>
        <span data-rank-shift-start style={{ fontSize: 'var(--editorial-caption-size)', lineHeight: 'var(--editorial-caption-line)', letterSpacing: 'var(--editorial-caption-spacing)', color: 'var(--color-semantic-label-alternative)' }}>
          {startLabel}
        </span>
        <div style={{ ...rankColumnStyle, justifyItems: 'end' }}>
          {resolved.map((item) => (
            <span
              key={item.id ?? item.label}
              data-rank-label-start
              data-rank-emphasis={item.emphasis ? 'true' : undefined}
              style={labelStyle(item, item.start)}
            >
              {item.label} <span style={{ fontVariantNumeric: 'tabular-nums' }}>{item.start}위</span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 'var(--space-2)' }}>
        <span aria-hidden="true" style={{ fontSize: 'var(--editorial-caption-size)', lineHeight: 'var(--editorial-caption-line)' }}>&nbsp;</span>
        <svg
          data-rank-shift-lines
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ width: '100%', height, display: 'block' }}
        >
          {resolved
            .filter((item) => !item.emphasis)
            .map((item) => (
              <line
                key={item.id ?? item.label}
                data-rank-line
                x1="0"
                y1={centerY(item.start)}
                x2="100"
                y2={centerY(item.end)}
                stroke="var(--editorial-muted)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          {emphasized && (
            <line
              data-rank-line
              data-rank-emphasis="true"
              x1="0"
              y1={centerY(emphasized.start)}
              x2="100"
              y2={centerY(emphasized.end)}
              stroke="var(--editorial-emphasis)"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 'var(--space-2)' }}>
        <span data-rank-shift-end style={{ fontSize: 'var(--editorial-caption-size)', lineHeight: 'var(--editorial-caption-line)', letterSpacing: 'var(--editorial-caption-spacing)', color: 'var(--color-semantic-label-alternative)' }}>
          {endLabel}
        </span>
        <div style={{ ...rankColumnStyle, justifyItems: 'start' }}>
          {resolved.map((item) => (
            <span
              key={item.id ?? item.label}
              data-rank-label-end
              data-rank-emphasis={item.emphasis ? 'true' : undefined}
              style={labelStyle(item, item.end)}
            >
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{item.end}위</span> {item.label}{' '}
              <span
                data-rank-delta
                style={{ color: item.emphasis ? 'var(--color-semantic-primary-strong)' : 'var(--color-semantic-label-alternative)' }}
              >
                ({deltaText(item.start, item.end)})
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
