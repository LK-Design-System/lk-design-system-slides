import React from 'react';
import { ContentSlide } from './ContentSlide.jsx';

/**
 * LDS Slides — CodeSlide
 * Code at projection distance. The header contract comes from ContentSlide;
 * this layout owns what changes when a listing is read from the back of a
 * room rather than in an editor.
 *
 * Three things it owns. The MEASURE: code does not wrap on a slide, so the
 * listing is capped in columns and anything past that is a listing that needs
 * cutting, not shrinking. The MONO RAMP: mono type at the same nominal size
 * as prose reads larger, so the listing sits one step down from body and gets
 * its own line height. And EMPHASIS: `highlight` names the lines that carry
 * the point, and everything else recedes — the same one-claim budget the rest
 * of the system spends, applied to a listing.
 *
 * It does NOT highlight syntax. A tokenizer is a dependency and a language
 * matrix, and neither belongs to a slide layout; if the system ever wants
 * coloured code it belongs upstream in Core next to the other content
 * primitives. `caption` carries the file name, which is what an audience
 * actually needs to place the snippet.
 */
const MAX_COLUMNS = 62;

export function CodeSlide({
  eyebrow,
  title,
  governing,
  code = '',
  caption,
  highlight = [],
  style,
  ...rest
}) {
  const lines = String(code).replace(/\n$/, '').split('\n');
  const lit = new Set(highlight);

  return (
    <ContentSlide eyebrow={eyebrow} title={title} governing={governing} style={style} {...rest}>
      <figure
        data-lds-code
        style={{
          margin: 0,
          display: 'grid',
          gap: 'var(--space-3)',
          // The listing is width-capped by its measure, so on a canvas the
          // capped block centres — a snippet hugging the left rail with the
          // right half dead is document inertia, the same class as the
          // intrinsic-width table. The code inside stays left: reading
          // anchors are the text's, placement is the canvas's.
          justifyItems: 'center',
        }}
      >
        <pre
          data-code-listing
          data-code-columns={MAX_COLUMNS}
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            // One step under body: mono reads larger than prose at the same
            // nominal size, and a listing is support for the claim, not the claim.
            fontSize: 'var(--slides-caption-size)',
            lineHeight: 'var(--slides-caption-line)',
            // Code does not wrap — a wrapped line lies about the code's shape.
            // Past the measure the listing is too wide and must be cut.
            whiteSpace: 'pre',
            overflow: 'hidden',
            maxWidth: `${MAX_COLUMNS}ch`,
            padding: 'var(--space-4) var(--space-5)',
            borderRadius: 'var(--radius-md, 12px)',
            background: 'var(--color-semantic-background-normal-alternative)',
            border: '1px solid var(--slides-surface-edge)',
            color: 'var(--color-semantic-label-neutral)',
          }}
        >
          {lines.map((line, order) => {
            const number = order + 1;
            const emphasised = lit.has(number);
            return (
              <div
                key={number}
                data-code-line={number}
                data-code-emphasis={emphasised ? 'true' : undefined}
                style={{
                  color: emphasised
                    ? 'var(--color-semantic-label-strong)'
                    : 'var(--color-semantic-label-alternative)',
                  fontWeight: emphasised ? 'var(--fw-semibold)' : 'var(--fw-regular)',
                }}
              >
                {line === '' ? ' ' : line}
              </div>
            );
          })}
        </pre>
        {caption && (
          <figcaption
            data-code-caption
            style={{
              fontSize: 'var(--slides-fine-size)',
              lineHeight: 'var(--slides-fine-line)',
              letterSpacing: 'var(--slides-fine-spacing)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-semantic-label-alternative)',
            }}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    </ContentSlide>
  );
}
