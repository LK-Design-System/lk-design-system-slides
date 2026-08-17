import React from 'react';

/**
 * LDS Editorial — ExhibitRow
 * Evidence beside the prose (READING_DECK_PROPOSAL 변경 2-2): a reading page
 * keeps its exhibits on the page, unlike the presentation discipline of one
 * exhibit per slide. N exhibits share the row as equal columns.
 *
 * Height is REMAINING-HEIGHT DRIVEN, never fixed — the row stretches to the
 * space its container grants (`minmax(0,1fr)` + `height:100%`, the same
 * height-driven contract as ImageSlide). The fixed-height first draft is
 * banned by measurement, not taste: 220px exhibits pushed their captions
 * into the chrome band and no gate saw it (READING_DECK_PILOT 마찰 3 — the
 * finding that produced the chrome-intrusion guard). For the contract to
 * hold, the caller's container must grant a bounded height (grid row
 * `minmax(0, 1fr)` and `minHeight: 0` on the chain).
 *
 * Captions are one ellipsis line at caption rank: on a page the exhibit is
 * scanned, and a caption that wraps is a paragraph asking to be prose.
 */
export function ExhibitRow({ exhibits = [], style, ...rest }) {
  return (
    <div
      data-lds-exhibit-row
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(exhibits.length, 1)}, minmax(0, 1fr))`,
        gap: 'var(--editorial-figure-gap)',
        minHeight: 0,
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    >
      {exhibits.map(({ src, caption, alt }) => (
        <figure
          key={caption ?? src}
          data-exhibit
          style={{
            margin: 0,
            minWidth: 0,
            minHeight: 0,
            display: 'grid',
            gridTemplateRows: 'minmax(0, 1fr) auto',
            gap: 'var(--space-2)',
          }}
        >
          <img
            src={src}
            alt={alt ?? caption ?? ''}
            style={{
              width: '100%',
              height: '100%',
              minHeight: 0,
              objectFit: 'cover',
              borderRadius: 'var(--radius-md, 12px)',
            }}
          />
          {caption && (
            <figcaption
              style={{
                fontSize: 'var(--editorial-caption-size)',
                lineHeight: 'var(--editorial-caption-line)',
                letterSpacing: 'var(--editorial-caption-spacing)',
                color: 'var(--color-semantic-label-alternative)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
