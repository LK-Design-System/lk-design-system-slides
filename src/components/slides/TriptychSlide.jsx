import React from 'react';
import { ContentSlide } from './ContentSlide.jsx';

/**
 * LDS Slides — TriptychSlide
 * Three labelled panels: 문제 / 원인 / 대책, 과거 / 현재 / 계획, three options
 * read side by side (COMPLETENESS_AUDIT C1).
 *
 * It is a separate layout rather than a third pane on SplitSlide, and the
 * reason is SplitSlide's own recorded argument: past two panes a split stops
 * being a comparison and starts being a grid. That argument is right, and this
 * layout answers it rather than overriding it — what keeps three columns from
 * being a grid is that **every panel carries a label**. Three unlabelled
 * columns of prose is a table someone forgot to draw; three labelled panels is
 * a structure the room can name. So `label` is required, and a panel without
 * one is reported on the canvas instead of rendering as an anonymous column.
 *
 * Exactly three. Two is SplitSlide (which owns the ratio vocabulary a
 * comparison needs); four or more is an exhibit row or a table, because at
 * four columns a slide's width gives each panel less than a sentence.
 *
 * Panels are equal width, always. A skewed triptych reads as "one of these is
 * more important", and if that is the claim it belongs in the emphasis, not in
 * the column widths — so `emphasis` marks one panel and the geometry stays even.
 */
const PANEL_COUNT = 3;

export function TriptychSlide({ panels = [], style, ...rest }) {
  const resolved = panels.slice(0, PANEL_COUNT);
  let emphasisTaken = false;
  const marked = resolved.map((panel) => {
    const granted = Boolean(panel.emphasis) && !emphasisTaken;
    if (granted) emphasisTaken = true;
    return { ...panel, emphasis: granted };
  });

  return (
    <ContentSlide data-lds-triptych-slide data-panel-count={marked.length} style={style} {...rest}>
      <div
        data-slide-triptych
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(marked.length, 1)}, minmax(0, 1fr))`,
          gap: 'var(--space-8)',
          height: '100%',
          minHeight: 0,
          alignItems: 'start',
        }}
      >
        {marked.map((panel, order) => (
          <section
            key={panel.id ?? panel.label ?? order}
            data-slide-panel={order + 1}
            data-panel-emphasis={panel.emphasis ? 'true' : undefined}
            style={{ minWidth: 0, display: 'grid', gap: 'var(--space-3)', alignContent: 'start' }}
          >
            <h3
              data-panel-label
              style={{
                margin: 0,
                fontSize: 'var(--slides-body-size)',
                lineHeight: 'var(--slides-body-line)',
                letterSpacing: 'var(--slides-body-spacing)',
                fontWeight: 'var(--fw-semibold)',
                color: panel.emphasis
                  ? 'var(--color-semantic-primary-strong)'
                  : 'var(--color-semantic-label-strong)',
                // The label is the thing that makes this a triptych rather than
                // a grid, so a missing one is stated, not silently absorbed.
                ...(panel.label ? null : { color: 'var(--color-semantic-status-cautionary-text, var(--color-semantic-status-cautionary))' }),
              }}
            >
              {panel.label || '레이블 없음'}
            </h3>
            {panel.body && (
              <div
                data-panel-body
                style={{
                  fontSize: 'var(--slides-caption-size)',
                  lineHeight: 'var(--slides-caption-line)',
                  letterSpacing: 'var(--slides-caption-spacing)',
                  color: 'var(--color-semantic-label-neutral)',
                }}
              >
                {panel.body}
              </div>
            )}
            {panel.children}
          </section>
        ))}
      </div>
    </ContentSlide>
  );
}
