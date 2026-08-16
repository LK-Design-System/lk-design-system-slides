import React from 'react';

/**
 * LDS Editorial — OptionAssessment
 * The narrative frame for judging options against criteria (the consulting
 * comparison-table pattern). Editorial owns the judgment contract, not the
 * table styling fashion: the verdict vocabulary is closed, every verdict is
 * spoken in text (the glyph is an auxiliary channel, per the "graphics are
 * secondary" convention), and emphasis is spent on at most one option — the
 * recommendation. A recommendation that matches no option is not dropped;
 * it visibly reports "권고 미확인", mirroring AnnotatedFigure's broken-anchor
 * honesty: a dangling claim must not pass as a clean table.
 */
const VERDICTS = {
  strong: { label: '우수', glyph: '●' },
  fair: { label: '보통', glyph: '◐' },
  weak: { label: '미흡', glyph: '○' },
};

export function OptionAssessment({ criteria = [], options = [], recommendation, caption, style, ...rest }) {
  const recommended = recommendation != null
    ? options.find((option) => option.id === recommendation || option.name === recommendation)
    : undefined;
  const recommendationMissing = recommendation != null && !recommended;

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

  return (
    <figure
      data-lds-option-assessment
      style={{ margin: 0, display: 'inline-block', width: 'var(--editorial-table-width)', maxWidth: '100%', fontFamily: 'var(--font-sans)', ...style }}
      {...rest}
    >
      <table style={{ borderCollapse: 'collapse', width: 'var(--editorial-table-width)' }}>
        <thead>
          <tr>
            <th scope="col" style={headCell} aria-label="평가 기준" />
            {options.map((option) => {
              const isRecommended = option === recommended;
              return (
                <th
                  key={option.id ?? option.name}
                  scope="col"
                  data-assessment-option
                  data-assessment-recommended={isRecommended || undefined}
                  style={{
                    ...headCell,
                    color: isRecommended ? 'var(--color-semantic-primary-strong)' : headCell.color,
                    background: isRecommended ? 'var(--editorial-emphasis-surface)' : undefined,
                  }}
                >
                  {option.name}
                  {isRecommended && (
                    <span
                      data-assessment-recommendation-tag
                      style={{ display: 'block', fontWeight: 'var(--fw-regular)', fontSize: 'var(--editorial-caption-size)', lineHeight: 'var(--editorial-caption-line)' }}
                    >
                      권고안
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {criteria.map((criterion, row) => (
            <tr key={criterion}>
              <th
                scope="row"
                style={{
                  ...headCell,
                  fontWeight: 'var(--fw-regular)',
                  color: 'var(--color-semantic-label-neutral)',
                  borderBottom: '1px solid var(--color-semantic-line-normal-neutral, var(--color-semantic-line-normal-normal))',
                }}
              >
                {criterion}
              </th>
              {options.map((option) => {
                const verdict = VERDICTS[option.verdicts?.[row]];
                const isRecommended = option === recommended;
                return (
                  <td
                    key={option.id ?? option.name}
                    data-assessment-verdict={option.verdicts?.[row]}
                    style={{
                      padding: 'var(--editorial-cell-pad-block) var(--editorial-cell-pad-inline)',
                      // The verdict is this component's payload — the
                      // judgment the room came to read — so it carries the
                      // note rank, not the note-body fine print. Header and
                      // cell share a size; weight and the glyph carry the
                      // hierarchy, as tables conventionally do.
                      fontSize: 'var(--editorial-note-size)',
                      lineHeight: 'var(--editorial-note-line)',
                      letterSpacing: 'var(--editorial-note-spacing)',
                      color: 'var(--color-semantic-label-neutral)',
                      background: isRecommended ? 'var(--editorial-emphasis-surface)' : undefined,
                      borderBottom: '1px solid var(--color-semantic-line-normal-neutral, var(--color-semantic-line-normal-normal))',
                    }}
                  >
                    {verdict ? (
                      <>
                        <span aria-hidden="true" style={{ marginRight: 'var(--space-1)', color: isRecommended ? 'var(--editorial-emphasis)' : 'var(--editorial-muted)' }}>
                          {verdict.glyph}
                        </span>
                        {verdict.label}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {recommendationMissing && (
        <p
          data-assessment-recommendation-warning
          style={{
            margin: 'var(--space-2) 0 0',
            fontSize: 'var(--editorial-caption-size)',
            lineHeight: 'var(--editorial-caption-line)',
            letterSpacing: 'var(--editorial-caption-spacing)',
            color: 'var(--color-semantic-status-cautionary-text, var(--color-semantic-status-cautionary))',
          }}
        >
          권고 미확인: {String(recommendation)}
        </p>
      )}
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
