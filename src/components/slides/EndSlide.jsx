import React from 'react';
import { SlideSurface } from './SlideSurface.jsx';
import { phrased } from './phrasing.jsx';
import { sparseScale, SPARSE_TYPE } from './sparseScale.js';

/**
 * LDS Slides — EndSlide
 * The closing slide (막지) of the Korean deck skeleton. It stays on screen
 * through Q&A, so the contract favors residue over farewell: `message` is
 * the one line worth leaving on the wall — a takeaway or a thanks, the
 * deck decides — and `contact` is the fine print that lets the room follow
 * up. Nothing else: an end slide that argues is a content slide that
 * arrived late.
 *
 * `lockup` is the same SLOT the cover has, for the same reason and on the
 * same terms (the mark is Theme's, its tone is the caller's). The closing
 * slide is the second place a deck asserts whose it is — it stays on the
 * wall through Q&A — and without a slot the only way to say it was to TYPE
 * the organisation into `contact`, which is a mark set as text. It rides
 * between the message and the contact line as its own block rather than
 * inline in that line: an inline lockup needs a 156px slot by upstream's own
 * usage rules and its 20px minimum height overruns caption type, so beside
 * the email it would either not fit or tower over it.
 */
export function EndSlide({
  message, contact, lockup, style, ...rest
}) {
  // "감사합니다" carries hero; a takeaway sentence stays at display
  // (COMPOSITION_PROPOSAL.md B). Centred — the room stares at this slide
  // through Q&A, and a residue line belongs in the middle of the wall.
  const scale = sparseScale(message);
  return (
    <SlideSurface
      data-lds-end-slide
      style={{ alignItems: 'center', textAlign: 'center', ...style }}
      {...rest}
    >
      <p
        data-slide-message
        data-slide-scale={scale}
        style={{
          margin: 0,
          ...SPARSE_TYPE[scale],
          fontWeight: 'var(--fw-bold)',
          color: 'var(--slides-ink-strong)',
          maxWidth: '18ch',
          textWrap: 'balance',
        }}
      >
        {phrased(message)}
      </p>
      {lockup && (
        <div
          data-slide-lockup
          style={{ margin: 'var(--space-8) 0 0', display: 'flex', alignItems: 'center' }}
        >
          {lockup}
        </div>
      )}
      {contact && (
        <p
          data-slide-contact
          style={{
            // The mark, when present, already opened the gap under the
            // message; a second full step would set the email adrift.
            margin: lockup ? 'var(--space-4) 0 0' : 'var(--space-8) 0 0',
            fontSize: 'var(--slides-caption-size)',
            lineHeight: 'var(--slides-caption-line)',
            letterSpacing: 'var(--slides-caption-spacing)',
            color: 'var(--slides-ink-neutral)',
          }}
        >
          {contact}
        </p>
      )}
    </SlideSurface>
  );
}
