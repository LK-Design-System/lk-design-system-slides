import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';

/**
 * LDS Slides — EndSlide
 * The closing slide (막지) of the Korean deck skeleton. It stays on screen
 * through Q&A, so the contract favors residue over farewell: `message` is
 * the one line worth leaving on the wall — a takeaway or a thanks, the
 * deck decides — and `contact` is the fine print that lets the room follow
 * up. Nothing else: an end slide that argues is a content slide that
 * arrived late.
 */
export function EndSlide({ message, contact, style, ...rest }) {
  return (
    <SlideSurface data-lds-end-slide style={style} {...rest}>
      <p
        data-slide-message
        style={{
          margin: 0,
          fontSize: 'var(--slides-display-size)',
          lineHeight: 'var(--slides-display-line)',
          letterSpacing: 'var(--slides-display-spacing)',
          fontWeight: 'var(--fw-bold)',
          color: 'var(--color-semantic-label-strong)',
          maxWidth: '18ch',
        }}
      >
        {message}
      </p>
      {contact && (
        <p
          data-slide-contact
          style={{
            margin: 'var(--space-8) 0 0',
            fontSize: 'var(--slides-caption-size)',
            lineHeight: 'var(--slides-caption-line)',
            letterSpacing: 'var(--slides-caption-spacing)',
            color: 'var(--color-semantic-label-neutral)',
          }}
        >
          {contact}
        </p>
      )}
    </SlideSurface>
  );
}
