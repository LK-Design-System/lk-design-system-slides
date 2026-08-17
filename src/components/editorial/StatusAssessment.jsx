import React from 'react';
import { StatusBadge } from '@lk-design-system/lds-core';
// Table lives in the Product layer (LDS Product/Data/Collections/Table).
import { Table } from '@lk-design-system/lds-product';

/**
 * LDS Editorial — StatusAssessment
 * The narrative frame for reporting metrics against targets (the consulting
 * traffic-light assessment pattern). The TABLE is Core's Table — banding,
 * group runs, row-header semantics and cell geometry all live upstream since
 * rc.69.27 (docs/TABLE_MEDIUM_CONTRACT_PROPOSAL.md); the hand-rolled table
 * this layer used to carry was duplication waiting for those three contracts.
 *
 * What stays here is the judgment contract: the status vocabulary is closed
 * (met / watch / missed), every status is spoken in text (달성·주의·미달 —
 * the tint is an auxiliary channel), and color marks deviation only: a met
 * metric wears the achromatic badge, never green — on a report, color is
 * the exception channel, and a wall of green would drown the two cells
 * that matter. A status outside the vocabulary is not coerced to neutral;
 * it visibly reports "판정 미상", mirroring the broken-anchor honesty of
 * AnnotatedFigure: an unjudged row must not pass as a judged one.
 *
 * The medium re-points Core's `--lk-table-*` hooks to the editorial seam, so
 * the same table reads at slide density and slide rank without this layer
 * owning a single cell style.
 */
const STATUSES = {
  met: { label: '달성', tone: 'normal' },
  watch: { label: '주의', tone: 'cautionary' },
  missed: { label: '미달', tone: 'negative' },
};

const MEASURE_COLUMN = { align: 'right', width: '1%' };

export function StatusAssessment({ metrics = [], caption, style, ...rest }) {
  const columns = [
    // Column intent, not auto distribution: the surplus belongs to the LABEL
    // column alone. Measure columns pin to their content (1% is the
    // table-layout idiom for shrink-to-fit; Core's cells are already nowrap),
    // so 목표·실적·판정 stay clustered at the right rail where they are
    // compared, instead of drifting apart across the canvas.
    { key: 'name', label: '지표' },
    { key: 'target', label: '목표', ...MEASURE_COLUMN },
    { key: 'actual', label: '실적', ...MEASURE_COLUMN },
    {
      key: 'status',
      label: '판정',
      width: '1%',
      render: (metric) => {
        const status = STATUSES[metric.status];
        return (
          <span data-assessment-status={status ? metric.status : undefined}>
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
          </span>
        );
      },
    },
  ];

  return (
    <figure
      data-lds-status-assessment
      style={{ margin: 0, display: 'inline-block', width: 'var(--editorial-table-width)', maxWidth: '100%', fontFamily: 'var(--font-sans)', ...style }}
      {...rest}
    >
      <Table
        columns={columns}
        rows={metrics}
        banded
        hover={false}
        groupKey="group"
        rowHeaderKey="name"
        getRowId={(metric, index) => metric.id ?? metric.name ?? index}
        getRowProps={() => ({ 'data-assessment-band': '' })}
        tableLabel={caption ? undefined : '목표 대비 실적'}
        style={{
          width: 'var(--editorial-table-width)',
          // The medium's density and rank, re-pointed through Core's hooks —
          // the slide reads farther away than a product screen.
          '--lk-table-cell-pad-md': 'var(--editorial-cell-pad-block) var(--editorial-cell-pad-inline)',
          '--lk-table-head-size': 'var(--editorial-note-size)',
          '--lk-table-head-line': 'var(--editorial-note-line)',
          '--lk-table-head-spacing': 'var(--editorial-note-spacing)',
          '--lk-table-cell-size': 'var(--editorial-note-size)',
          '--lk-table-cell-line': 'var(--editorial-note-line)',
          '--lk-table-group-size': 'var(--editorial-caption-size)',
          '--lk-table-group-line': 'var(--editorial-caption-line)',
          '--lk-table-group-spacing': '0.08em',
        }}
      />
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
