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
 *   same token, overshooting the table edge — the source idiom's arrow
 *   poking out of the table. A glyph laid on the bar was primary-on-primary
 *   and invisible. Proportions are the block-arrow classic: the head flares
 *   to ~2× the shaft — a head barely wider than its shaft reads as a
 *   blunted bar, not an arrow (user-flagged at 16px shaft / 22px head).
 */
const SHAFT = 10;
const HEAD_HALF = 10;
const HEAD_LENGTH = 16;
export function WeekSpanRows({
  weeks = [], groups = [], rows = [], label, style, ...rest
}) {
  const headerRow = groups.length > 0 ? 2 : 1;
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
      {/* Optional super-header over the week columns: 8월 | 9월 above 3주차 |
          4주차 | 1주차. Korean report tables carry this constantly, and the
          alternative is what the pilot deck actually did — repeat the month in
          every column label, spending the narrowest columns on the most
          repeated word (COMPLETENESS_AUDIT B3). Spans are DECLARED, not derived
          from label prefixes: parsing "8월 3주차" would be a guess that breaks
          the first time a period is named differently, and a wrong span is a
          table that lies about when work happened. A group whose spans do not
          cover the axis is reported rather than silently short-drawn. */}
      {groups.length > 0 && (() => {
        const spanned = groups.reduce((sum, group) => sum + Math.max(Number(group.span) || 0, 0), 0);
        const cells = groups.map((group, order) => {
          const start = groups.slice(0, order).reduce((sum, previous) => sum + (Number(previous.span) || 0), 0);
          return (
            <div
              key={group.id ?? group.label ?? order}
              role="columnheader"
              data-week-group={order + 1}
              style={{
                gridRow: 1,
                gridColumn: `${start + 3} / span ${Math.max(Number(group.span) || 0, 1)}`,
                padding: '0 var(--editorial-cell-pad-inline) var(--space-1)',
                textAlign: 'center',
                fontSize: 'var(--editorial-caption-size)',
                lineHeight: 'var(--editorial-caption-line)',
                letterSpacing: 'var(--editorial-caption-spacing)',
                color: 'var(--color-semantic-label-alternative)',
                borderLeft: tick,
              }}
            >
              {group.label}
            </div>
          );
        });
        if (spanned !== weeks.length) {
          cells.push(
            <div
              key="group-mismatch"
              data-week-group-mismatch
              style={{
                gridRow: 1,
                gridColumn: '1 / 3',
                padding: '0 var(--editorial-cell-pad-inline) var(--space-1)',
                fontSize: 'var(--editorial-caption-size)',
                lineHeight: 'var(--editorial-caption-line)',
                color: 'var(--color-semantic-status-cautionary-text, var(--color-semantic-status-cautionary))',
              }}
            >
              구간 합 {spanned} ≠ 기간 {weeks.length}
            </div>,
          );
        }
        return cells;
      })()}
      {['프로젝트', '업무 내용', ...weeks].map((head, column) => (
        <div
          key={head}
          role="columnheader"
          style={{
            gridRow: headerRow,
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
          <div role="rowheader" style={{ gridRow: row + headerRow + 1, gridColumn: 1, padding: cellPad, background: band, fontWeight: 'var(--fw-semibold)', color: 'var(--color-semantic-label-strong)' }}>
            {name}
          </div>
          <div role="cell" style={{ gridRow: row + headerRow + 1, gridColumn: 2, padding: cellPad, background: band, color: 'var(--color-semantic-label-neutral)' }}>
            {work}
          </div>
          {weeks.map((week, order) => (
            <div
              key={week}
              role="cell"
              style={{ gridRow: row + headerRow + 1, gridColumn: order + 3, background: band, borderLeft: tick }}
            />
          ))}
          <div
            data-span-bar
            aria-label={`${weeks[from]}부터 ${continues ? `${weeks[to]} 이후까지 계속` : `${weeks[to]}까지`} 진행`}
            style={{
              gridRow: row + headerRow + 1,
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
                height: SHAFT,
                background: 'var(--color-semantic-primary-normal)',
                borderRadius: continues ? `${SHAFT / 2}px 0 0 ${SHAFT / 2}px` : `${SHAFT / 2}px`,
              }}
            />
            {continues && (
              <span
                data-span-continues
                style={{
                  width: 0,
                  height: 0,
                  flex: 'none',
                  borderTop: `${HEAD_HALF}px solid transparent`,
                  borderBottom: `${HEAD_HALF}px solid transparent`,
                  borderLeft: `${HEAD_LENGTH}px solid var(--color-semantic-primary-normal)`,
                }}
              />
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
