import React from 'react';

function Unit({ state, emphasis }) {
  const accent = emphasis ? 'var(--editorial-emphasis)' : 'var(--editorial-muted)';
  const fill = state === 'filled' || state === 'partial' ? accent : 'var(--color-semantic-fill-strong)';
  return (
    <svg
      data-pictogram-unit={state}
      width="var(--editorial-unit-size)"
      height="var(--editorial-unit-size)"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ width: 'var(--editorial-unit-size)', height: 'var(--editorial-unit-size)', flex: 'none' }}
    >
      {state === 'partial' ? (
        <>
          <rect x="1" y="1" width="14" height="14" rx="3" fill="var(--color-semantic-fill-strong)" />
          <path d="M1 4 a3 3 0 0 1 3-3 h4 v14 h-4 a3 3 0 0 1 -3-3 z" fill={fill} />
        </>
      ) : (
        <rect x="1" y="1" width="14" height="14" rx="3" fill={fill} />
      )}
    </svg>
  );
}

/**
 * LDS Editorial — PictogramRow
 * A quantity as repeated units (ISOTYPE style). The pictogram is redundant
 * reinforcement: the exact value is always rendered as text and carried on
 * the accessible name, so the graphic never becomes the only channel.
 * In comparisons, all rows but the one carrying the claim take
 * `emphasis={false}` so the emphasis budget stays at one. Unlike the other
 * components the default is ON: a lone pictogram row IS the claim, and a
 * muted one reads as a disabled control.
 *
 * `unit` and `emphasis` are the system-wide names (KeyFigure's `unit`, every
 * other component's boolean `emphasis`). `unitLabel` and `tone` are the
 * pre-0.1.0-alpha.12 spellings, still accepted.
 */
export function PictogramRow({
  value, per = 1, unit, unitLabel: legacyUnitLabel, label, maxUnits = 20, emphasis, tone: legacyTone, style, ...rest
}) {
  const unitText = unit ?? legacyUnitLabel;
  const emphasized = emphasis ?? (legacyTone ? legacyTone !== 'muted' : true);
  const exact = value / per;
  const full = Math.min(Math.floor(exact), maxUnits);
  const hasPartial = exact > full && full < maxUnits;
  const units = [
    ...Array.from({ length: full }, () => 'filled'),
    ...(hasPartial ? ['partial'] : []),
  ];
  const valueText = `${value.toLocaleString('ko-KR')}${unitText ? ` ${unitText}` : ''}`;

  return (
    <div
      data-lds-pictogram-row
      data-emphasis={emphasized ? 'true' : undefined}
      role="img"
      aria-label={`${label}: ${valueText}`}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontFamily: 'var(--font-sans)', ...style }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
        <span
          data-pictogram-value
          style={{
            fontSize: 'var(--editorial-value-size)',
            lineHeight: 'var(--editorial-value-line)',
            letterSpacing: 'var(--editorial-value-spacing)',
            fontWeight: 'var(--fw-bold)',
            color: 'var(--color-semantic-label-strong)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {valueText}
        </span>
        <span
          style={{
            fontSize: 'var(--editorial-claim-size)',
            lineHeight: 'var(--editorial-claim-line)',
            letterSpacing: 'var(--editorial-claim-spacing)',
            color: 'var(--color-semantic-label-neutral)',
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--editorial-unit-gap)' }}>
        {units.map((state, index) => (
          <Unit key={index} state={state} emphasis={emphasized} />
        ))}
      </div>
      {per !== 1 && (
        <span
          data-pictogram-scale
          style={{
            fontSize: 'var(--editorial-caption-size)',
            lineHeight: 'var(--editorial-caption-line)',
            letterSpacing: 'var(--editorial-caption-spacing)',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          ■ = {per.toLocaleString('ko-KR')}{unitText ? ` ${unitText}` : ''}
        </span>
      )}
    </div>
  );
}
