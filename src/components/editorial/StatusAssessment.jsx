import React from 'react';
import { StatusBadge } from '@lk-design-system/lds-core';

/**
 * LDS Editorial — StatusAssessment
 * The narrative frame for reporting metrics against targets (the consulting
 * traffic-light assessment pattern). Editorial owns the judgment contract,
 * Core's StatusBadge owns the badge: the status vocabulary is closed
 * (met / watch / missed), every status is spoken in text (달성·주의·미달 —
 * the tint is an auxiliary channel), and color marks deviation only: a met
 * metric wears the achromatic badge, never green — on a report, color is
 * the exception channel, and a wall of green would drown the two cells
 * that matter. A status outside the vocabulary is not coerced to neutral;
 * it visibly reports "판정 미상", mirroring the broken-anchor honesty of
 * AnnotatedFigure: an unjudged row must not pass as a judged one.
 */
const STATUSES = {
  met: { label: '달성', tone: 'normal' },
  watch: { label: '주의', tone: 'cautionary' },
  missed: { label: '미달', tone: 'negative' },
};

export function StatusAssessment({ metrics = [], caption, style, ...rest }) {
  const headCell = {
    padding: 'var(--editorial-cell-pad-block) var(--editorial-cell-pad-inline)',
    textAlign: 'left',
    fontSize: 'var(--editorial-note-size)',
    lineHeight: 'var(--editorial-note-line)',
    letterSpacing: 'var(--editorial-note-spacing)',
    fontWeight: 'var(--fw-semibold)',
    color: 'var(--color-semantic-label-strong)',
    borderBottom: '1px solid var(--color-semantic-line-normal-normal)',
  };
  const bodyCell = {
    padding: 'var(--editorial-cell-pad-block) var(--editorial-cell-pad-inline)',
    // Metric names and measures are the report's payload, so data cells
    // carry the note rank alongside the headers; weight alone separates
    // the header row, the table convention.
    fontSize: 'var(--editorial-note-size)',
    lineHeight: 'var(--editorial-note-line)',
    letterSpacing: 'var(--editorial-note-spacing)',
    color: 'var(--color-semantic-label-neutral)',
    borderBottom: '1px solid var(--color-semantic-line-normal-neutral, var(--color-semantic-line-normal-normal))',
  };
  // nowrap matches the column intent set in the header row: a measure —
  // numeric or a short phrase ("전건 통과") — is one token and never wraps;
  // the label column is the one that absorbs width pressure.
  const numberCell = { ...bodyCell, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

  // Group headers render once per contiguous run; the caller's order is the
  // report's order, so a scattered group is the caller's claim, not ours to fix.
  const rows = [];
  let lastGroup;
  for (const metric of metrics) {
    if (metric.group && metric.group !== lastGroup) {
      rows.push({ kind: 'group', label: metric.group });
    }
    lastGroup = metric.group;
    rows.push({ kind: 'metric', metric });
  }

  return (
    <figure
      data-lds-status-assessment
      style={{ margin: 0, display: 'inline-block', width: 'var(--editorial-table-width)', maxWidth: '100%', fontFamily: 'var(--font-sans)', ...style }}
      {...rest}
    >
      <table style={{ borderCollapse: 'collapse', width: 'var(--editorial-table-width)' }}>
        <thead>
          <tr>
            {/* Column intent, not auto distribution: when the medium grants
                the table full width, the surplus belongs to the LABEL column
                alone. The measure columns pin to their content (1% + nowrap
                is the table-layout idiom for shrink-to-fit), so 목표·실적·
                판정 stay clustered at the right rail where they are compared,
                instead of drifting apart across the canvas. */}
            <th scope="col" style={headCell}>지표</th>
            <th scope="col" style={{ ...headCell, textAlign: 'right', width: '1%', whiteSpace: 'nowrap' }}>목표</th>
            <th scope="col" style={{ ...headCell, textAlign: 'right', width: '1%', whiteSpace: 'nowrap' }}>실적</th>
            <th scope="col" style={{ ...headCell, width: '1%', whiteSpace: 'nowrap' }}>판정</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            if (row.kind === 'group') {
              return (
                <tr key={`group-${row.label}-${index}`}>
                  <th
                    scope="colgroup"
                    colSpan={4}
                    data-assessment-group
                    style={{
                      ...headCell,
                      paddingTop: 'var(--space-4)',
                      fontSize: 'var(--editorial-caption-size)',
                      lineHeight: 'var(--editorial-caption-line)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-semantic-label-alternative)',
                      borderBottom: 'none',
                    }}
                  >
                    {row.label}
                  </th>
                </tr>
              );
            }
            const { metric } = row;
            const status = STATUSES[metric.status];
            return (
              // The band is what lets a full-width row read as ONE row: with
              // the label left and the measures pinned right, a hairline
              // alone cannot carry the eye across the gutter between them.
              // EVERY metric row wears the band — zebra was tried first and
              // with three rows it read as emphasis, which color must never
              // claim here (색은 이탈만 표시). The quietest fill on the ramp,
              // so the verdict badges keep the only color; group headers
              // stay bare and the bands alone say "data row".
              <tr
                key={metric.id ?? metric.name}
                data-assessment-band
                style={{ background: 'var(--color-semantic-fill-alternative)' }}
              >
                <th scope="row" style={{ ...bodyCell, fontWeight: 'var(--fw-regular)', textAlign: 'left' }}>
                  {metric.name}
                </th>
                <td style={numberCell}>{metric.target}</td>
                <td style={numberCell}>{metric.actual}</td>
                <td data-assessment-status={status ? metric.status : undefined} style={bodyCell}>
                  {status ? (
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  ) : (
                    <span
                      data-assessment-status-unknown
                      style={{ color: 'var(--color-semantic-status-cautionary-text, var(--color-semantic-status-cautionary))' }}
                    >
                      판정 미상: {String(metric.status)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {caption && (
        <figcaption
          style={{
            marginTop: 'var(--space-2)',
            fontSize: 'var(--editorial-caption-size)',
            lineHeight: 'var(--editorial-caption-line)',
            letterSpacing: 'var(--editorial-caption-spacing)',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
