import React from 'react';
import { Stat } from '@lk-design-system/lds-product';

/**
 * LDS Editorial — KeyFigure
 * One number, one claim. Composes Core's Stat for the numeral (the chart
 * layer stays upstream) and owns the narrative frame around it: the claim
 * line and an optional source note. The number is always visible text —
 * emphasis never replaces it.
 */
export function KeyFigure({ value, unit, label, claim, source, emphasis = false, style, ...rest }) {
  return (
    <figure
      data-lds-key-figure
      data-emphasis={emphasis ? 'true' : undefined}
      style={{
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-4) var(--space-5)',
        borderRadius: 'var(--radius-md, 12px)',
        background: emphasis ? 'var(--editorial-emphasis-surface)' : 'transparent',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    >
      <Stat value={value} unit={unit} label={label} accent={emphasis ? 'signal' : 'ink'} stacked />
      {claim && (
        <figcaption
          data-key-figure-claim
          style={{
            fontSize: 'var(--editorial-claim-size)',
            lineHeight: 'var(--editorial-claim-line)',
            letterSpacing: 'var(--editorial-claim-spacing)',
            color: 'var(--color-semantic-label-neutral)',
            maxWidth: '32ch',
          }}
        >
          {claim}
          {source && (
            <span
              data-key-figure-source
              style={{
                display: 'block',
                marginTop: 'var(--space-1)',
                fontSize: 'var(--editorial-caption-size)',
                lineHeight: 'var(--editorial-caption-line)',
                letterSpacing: 'var(--editorial-caption-spacing)',
                color: 'var(--color-semantic-label-alternative)',
              }}
            >
              {source}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
