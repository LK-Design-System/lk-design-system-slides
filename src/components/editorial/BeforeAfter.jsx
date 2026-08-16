import React from 'react';

function signedText(delta, unitLabel) {
  const unit = unitLabel || '';
  if (delta > 0) return `+${delta.toLocaleString('ko-KR')}${unit}`;
  if (delta < 0) return `−${Math.abs(delta).toLocaleString('ko-KR')}${unit}`;
  return `±0${unit}`;
}

/**
 * LDS Editorial — BeforeAfter
 * Deviation from an explicit reference as diverging bars. A deviation
 * without a stated baseline cannot exist here: omit the reference label
 * and the component prints one from the value itself. Direction is carried
 * by bar side and signed text — color is reinforcement — and at most one
 * item carries emphasis; if several ask, the first wins.
 */
export function BeforeAfter({ reference = {}, items = [], unitLabel = '', barHeight = 14, style, ...rest }) {
  const refValue = Number(reference.value ?? 0);
  const refLabel = reference.label || `기준 ${refValue.toLocaleString('ko-KR')}${unitLabel}`;

  let emphasisTaken = false;
  const resolved = items.map((item) => {
    const wantsEmphasis = Boolean(item.emphasis);
    const granted = wantsEmphasis && !emphasisTaken;
    if (granted) emphasisTaken = true;
    const delta = Number(item.value) - refValue;
    return { ...item, emphasis: granted, delta };
  });

  const maxAbs = Math.max(1, ...resolved.map((item) => Math.abs(item.delta)));
  const emphasized = resolved.find((item) => item.emphasis);
  const ariaLabel = emphasized
    ? `${refLabel} 대비 편차: ${emphasized.label} ${signedText(emphasized.delta, unitLabel)}`
    : `${refLabel} 대비 편차`;

  return (
    <div
      data-lds-before-after
      role="img"
      aria-label={ariaLabel}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(160px, 1fr) auto',
        columnGap: 'var(--space-3)',
        rowGap: 'var(--space-2)',
        alignItems: 'center',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    >
      <span aria-hidden="true" />
      <span
        data-reference-label
        style={{
          justifySelf: 'center',
          fontSize: 'var(--editorial-caption-size)',
          lineHeight: 'var(--editorial-caption-line)',
          letterSpacing: 'var(--editorial-caption-spacing)',
          color: 'var(--color-semantic-label-alternative)',
        }}
      >
        {refLabel}
      </span>
      <span aria-hidden="true" />

      {resolved.map((item) => {
        const direction = item.delta > 0 ? 'above' : item.delta < 0 ? 'below' : 'at';
        const widthPct = (Math.abs(item.delta) / maxAbs) * 50;
        const accent = item.emphasis ? 'var(--editorial-emphasis)' : 'var(--editorial-muted)';
        return (
          <React.Fragment key={item.id ?? item.label}>
            <span
              data-deviation-item
              data-deviation-emphasis={item.emphasis ? 'true' : undefined}
              style={{
                justifySelf: 'end',
                whiteSpace: 'nowrap',
                fontSize: 'var(--editorial-note-size)',
                lineHeight: 'var(--editorial-note-line)',
                letterSpacing: 'var(--editorial-note-spacing)',
                fontWeight: item.emphasis ? 'var(--fw-bold)' : 'var(--fw-medium)',
                color: item.emphasis ? 'var(--color-semantic-primary-strong)' : 'var(--color-semantic-label-neutral)',
              }}
            >
              {item.label}
            </span>
            <span aria-hidden="true" style={{ position: 'relative', display: 'block', height: barHeight }}>
              <span
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: -2,
                  bottom: -2,
                  width: 2,
                  transform: 'translateX(-1px)',
                  background: 'var(--editorial-annotation-line)',
                }}
              />
              <span
                data-deviation-bar
                data-deviation-direction={direction}
                style={{
                  position: 'absolute',
                  top: 1,
                  bottom: 1,
                  left: direction === 'below' ? `${50 - widthPct}%` : '50%',
                  width: `${Math.max(widthPct, direction === 'at' ? 0.5 : 1)}%`,
                  background: accent,
                  borderRadius: 2,
                }}
              />
            </span>
            <span
              data-deviation-value
              style={{
                justifySelf: 'start',
                whiteSpace: 'nowrap',
                fontSize: 'var(--editorial-note-size)',
                lineHeight: 'var(--editorial-note-line)',
                letterSpacing: 'var(--editorial-note-spacing)',
                fontVariantNumeric: 'tabular-nums',
                fontWeight: item.emphasis ? 'var(--fw-bold)' : 'var(--fw-medium)',
                color: item.emphasis ? 'var(--color-semantic-primary-strong)' : 'var(--color-semantic-label-neutral)',
              }}
            >
              {signedText(item.delta, unitLabel)}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
