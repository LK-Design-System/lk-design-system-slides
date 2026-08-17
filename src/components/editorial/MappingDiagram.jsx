import React from 'react';

/**
 * LDS Editorial — MappingDiagram
 * Two ordered lists and the correspondence between them: a token ramp mapped to
 * a medium's steps, a legacy field mapped to its replacement, a role mapped to
 * an owner. Promoted from a real pilot the same way WeekSpanRows was — the
 * hand-drawn version lived in the 매체와 논증의 분리 deck (COMPLETENESS_AUDIT B2,
 * which flagged that hand-drawing a diagram contradicts this system's own
 * "don't hand-draw a table or a timeline" discipline).
 *
 * Three decisions the pilot paid for:
 *
 * - HTML, NOT SVG. The pilot's first version was a fixed viewBox stretched to
 *   width:100%, which fills by MAGNIFYING: labels specced at fine rank painted
 *   at ×1.97, larger than the slide's own governing claim. A diagram that
 *   carries type lays out wider; only pure geometry scales.
 * - THE CHANNEL TAKES THE SLACK. The connector column is `minmax(64px, 0.6fr)`
 *   and the cells hold their content width, so a wider canvas lengthens the
 *   correspondence rather than stretching the labels.
 * - ONE LIT ROW. A mapping diagram exists to make one correspondence
 *   inarguable; the rest is context. `emphasis` marks a single row, and if
 *   several ask the first wins — the same budget the rest of the system spends.
 *
 * `rows` is the whole contract: `[{ from, to, emphasis? }]`. Both columns get a
 * heading, because a mapping without named sides is a list of coincidences.
 */
export function MappingDiagram({
  rows = [],
  fromLabel,
  toLabel,
  label,
  style,
  ...rest
}) {
  let emphasisTaken = false;
  const resolved = rows.map((row) => {
    const granted = Boolean(row.emphasis) && !emphasisTaken;
    if (granted) emphasisTaken = true;
    return { ...row, emphasis: granted };
  });

  const head = {
    fontSize: 'var(--editorial-caption-size)',
    lineHeight: 'var(--editorial-caption-line)',
    letterSpacing: 'var(--editorial-caption-spacing)',
    color: 'var(--color-semantic-label-alternative)',
    paddingBottom: 'var(--space-2)',
  };
  const cell = (lit) => ({
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-2, 4px)',
    background: lit ? 'var(--editorial-emphasis-surface)' : 'var(--color-semantic-fill-normal)',
    color: lit ? 'var(--color-semantic-label-strong)' : 'var(--color-semantic-label-neutral)',
    fontWeight: lit ? 'var(--fw-semibold)' : 'var(--fw-regular)',
    fontSize: 'var(--editorial-note-body-size)',
    lineHeight: 'var(--editorial-note-body-line)',
    letterSpacing: 'var(--editorial-note-body-spacing)',
  });

  return (
    <div
      data-lds-mapping-diagram
      role="img"
      aria-label={label ?? `${fromLabel ?? '왼쪽'}과 ${toLabel ?? '오른쪽'}의 대응 관계`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(64px, 0.6fr) minmax(0, 1fr)',
        rowGap: 'var(--space-2)',
        alignItems: 'center',
        ...style,
      }}
      {...rest}
    >
      <div style={head}>{fromLabel}</div>
      <div />
      <div style={head}>{toLabel}</div>
      {resolved.map((row, order) => (
        <React.Fragment key={row.id ?? `${row.from}-${row.to}-${order}`}>
          <div data-mapping-from style={cell(row.emphasis)}>{row.from}</div>
          <div
            data-mapping-channel
            data-mapping-emphasis={row.emphasis ? 'true' : undefined}
            style={{
              position: 'relative', height: '100%', display: 'flex', alignItems: 'center',
            }}
          >
            <span
              style={{
                flex: 1,
                height: row.emphasis ? 2 : 1,
                background: row.emphasis ? 'var(--editorial-emphasis)' : 'var(--color-semantic-line-normal-normal)',
              }}
            />
            {row.emphasis && (
              <span
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--editorial-emphasis)',
                }}
              />
            )}
          </div>
          <div data-mapping-to style={cell(false)}>{row.to}</div>
        </React.Fragment>
      ))}
    </div>
  );
}
