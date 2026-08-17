import React from 'react';

/**
 * LDS Editorial — WeekSpanRows
 * The gantt-lite of a weekly plan (READING_DECK_PROPOSAL 변경 2-3): plan
 * items lying as span bars on a week axis, reusing the table grammar (banded
 * data rows, bare header) and the --editorial-* density seam.
 *
 * Three settled design decisions, each bought by a defect:
 * - TIME GRID: every week column carries a left hairline tick from header
 *   through the rows, and week headers center over their columns like axis
 *   labels. Without the grid the bars read as floating lines, not spans on
 *   an axis (user-flagged on the first build).
 * - ONE-PIECE SPAN: the bar is a single element placed by grid-column
 *   across its weeks — the "spans and rails do not break at boundaries"
 *   rule implemented honestly. Per-cell fragments met with a visible seam;
 *   a broken span reads as two plans. The grid ticks passing behind the
 *   bar are correct — the bar crosses the grid, the grid does not cut the
 *   bar. (Same continuity rule as NarrativeTimeline's rail.)
 * - CONTINUATION ARROWHEAD: `continues` ends the bar in a triangle of the
 *   same token, wider than the bar, overshooting the table edge — the
 *   source idiom's arrow poking out of the table. A glyph laid on the bar
 *   was primary-on-primary and invisible.
 */
export function WeekSpanRows({ weeks = [], rows = [], label, style, ...rest }) {
  const cellPad = 'var(--editorial-cell-pad-block) var(--editorial-cell-pad-inline)';
  const band = 'var(--color-semantic-fill-alternative)';
  const tick = '1px solid var(--color-semantic-line-normal-neutral, var(--color-semantic-line-normal-normal))';
  return (
    <div
      role="table"
      aria-label={label}
      data-lds-week-span-rows
      style={{
        display: 'grid',
        gridTemplateColumns: `minmax(0, 1fr) minmax(0, 2fr) repeat(${Math.max(weeks.length, 1)}, minmax(0, 0.7fr))`,
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--editorial-note-size)',
        lineHeight: 'var(--editorial-note-line)',
        letterSpacing: 'var(--editorial-note-spacing)',
        ...style,
      }}
      {...rest}
    >
      {['프로젝트', '업무 내용', ...weeks].map((head, column) => (
        <div
          key={head}
          role="columnheader"
          style={{
            gridRow: 1,
            gridColumn: column + 1,
            padding: cellPad,
            fontWeight: 'var(--fw-semibold)',
            color: 'var(--color-semantic-label-strong)',
            borderBottom: '1px solid var(--color-semantic-line-normal-normal)',
            textAlign: column >= 2 ? 'center' : 'left',
            borderLeft: column >= 2 ? tick : 'none',
          }}
        >
          {head}
        </div>
      ))}
      {rows.map(({ name, work, from, to, continues }, row) => (
        <React.Fragment key={name}>
          <div role="rowheader" style={{ gridRow: row + 2, gridColumn: 1, padding: cellPad, background: band, fontWeight: 'var(--fw-semibold)', color: 'var(--color-semantic-label-strong)' }}>
            {name}
          </div>
          <div role="cell" style={{ gridRow: row + 2, gridColumn: 2, padding: cellPad, background: band, color: 'var(--color-semantic-label-neutral)' }}>
            {work}
          </div>
          {weeks.map((week, order) => (
            <div
              key={week}
              role="cell"
              style={{ gridRow: row + 2, gridColumn: order + 3, background: band, borderLeft: tick }}
            />
          ))}
          <div
            data-span-bar
            aria-label={`${weeks[from]}부터 ${continues ? `${weeks[to]} 이후까지 계속` : `${weeks[to]}까지`} 진행`}
            style={{
              gridRow: row + 2,
              gridColumn: `${from + 3} / ${to + 4}`,
              alignSelf: 'center',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 'var(--space-3)',
              paddingRight: continues ? 0 : 'var(--space-3)',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                flex: 1,
                height: 16,
                background: 'var(--color-semantic-primary-normal)',
                borderRadius: continues ? '8px 0 0 8px' : '8px',
              }}
            />
            {continues && (
              <span
                data-span-continues
                style={{
                  width: 0,
                  height: 0,
                  flex: 'none',
                  borderTop: '11px solid transparent',
                  borderBottom: '11px solid transparent',
                  borderLeft: '14px solid var(--color-semantic-primary-normal)',
                }}
              />
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
