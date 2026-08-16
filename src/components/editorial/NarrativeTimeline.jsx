import React from 'react';
import { Timeline } from '@lk-design-system/lds-core';

/**
 * LDS Editorial — NarrativeTimeline
 * A chronology that makes a claim. The rail itself is Core's Timeline
 * (ol/time semantics stay upstream); this layer owns the narrative
 * contract: events render in chronological order regardless of input
 * order, an event without a date cannot sit on the rail — it is demoted
 * to a visible "시점 미상" footnote instead of being placed by guesswork —
 * and at most one event carries emphasis; if several ask, the first wins.
 * Spacing between events is reading rhythm, not measured duration: a
 * duration claim belongs in a chart, not here.
 *
 * `direction` is the medium's call, like reading distance: a flowing
 * document reads a chronology top-down ('column', the default — Core's
 * Timeline), a fixed canvas reads it left-to-right ('row'). Core has no
 * horizontal rail yet, so the row branch renders its own ol/time markup
 * with the same resolved events — one narrative contract, two rails. When
 * upstream grows a Timeline orientation (proposed:
 * lk-design-system/docs/TIMELINE_ORIENTATION_PROPOSAL.md), the row branch
 * collapses back into one delegation.
 */
export function NarrativeTimeline({ events = [], label, direction = 'column', style, ...rest }) {
  let emphasisTaken = false;
  const resolved = events.map((event) => {
    const wantsEmphasis = Boolean(event.emphasis);
    const granted = wantsEmphasis && !emphasisTaken;
    if (granted) emphasisTaken = true;
    return { ...event, emphasis: granted };
  });

  const dated = resolved
    .filter((event) => typeof event.date === 'string' && event.date.trim() !== '')
    .sort((a, b) => a.date.localeCompare(b.date));
  const undated = resolved.filter((event) => !(typeof event.date === 'string' && event.date.trim() !== ''));

  const emphasized = dated.find((event) => event.emphasis);
  const railLabel =
    label ?? (emphasized ? `사건 시간렬, 강조: ${emphasized.date} ${emphasized.label}` : '사건 시간렬');

  const items = dated.map((event) => ({
    id: event.id ?? `${event.date}-${event.label}`,
    time: event.date,
    dateTime: event.date,
    tone: event.emphasis ? 'signal' : 'neutral',
    title: (
      <span
        data-timeline-event
        data-event-emphasis={event.emphasis ? 'true' : undefined}
        style={event.emphasis ? { color: 'var(--color-semantic-primary-strong)' } : undefined}
      >
        {event.label}
      </span>
    ),
    description: event.body,
  }));

  const rail = direction === 'row' ? (
    <ol
      data-timeline-rail-row
      aria-label={railLabel}
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(0, 1fr)',
        gap: 'var(--editorial-figure-gap)',
        width: '100%',
      }}
    >
      {dated.map((event, order) => (
        <li key={event.id ?? `${event.date}-${event.label}`} style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <span
              aria-hidden="true"
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                flex: 'none',
                background: event.emphasis
                  ? 'var(--color-semantic-primary-normal)'
                  : 'var(--color-semantic-label-alternative)',
              }}
            />
            {/* The rail segment stops before the last node: the chronology
                ends there, and a line running off-canvas claims otherwise. */}
            {order < dated.length - 1 && (
              <span aria-hidden="true" style={{ flex: 1, height: 1, background: 'var(--color-semantic-line-normal-normal)' }} />
            )}
          </div>
          <time
            dateTime={event.date}
            style={{
              display: 'block',
              fontSize: 'var(--editorial-caption-size)',
              lineHeight: 'var(--editorial-caption-line)',
              letterSpacing: 'var(--editorial-caption-spacing)',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--color-semantic-label-alternative)',
            }}
          >
            {event.date}
          </time>
          <span
            data-timeline-event
            data-event-emphasis={event.emphasis ? 'true' : undefined}
            style={{
              display: 'block',
              marginTop: 'var(--space-1)',
              fontSize: 'var(--editorial-note-size)',
              lineHeight: 'var(--editorial-note-line)',
              letterSpacing: 'var(--editorial-note-spacing)',
              fontWeight: 'var(--fw-semibold)',
              color: event.emphasis
                ? 'var(--color-semantic-primary-strong)'
                : 'var(--color-semantic-label-strong)',
            }}
          >
            {event.label}
          </span>
          {event.body && (
            <span
              style={{
                display: 'block',
                marginTop: 'var(--space-1)',
                fontSize: 'var(--editorial-note-body-size)',
                lineHeight: 'var(--editorial-note-body-line)',
                letterSpacing: 'var(--editorial-note-body-spacing)',
                color: 'var(--color-semantic-label-neutral)',
              }}
            >
              {event.body}
            </span>
          )}
        </li>
      ))}
    </ol>
  ) : (
    <Timeline label={railLabel} items={items} />
  );

  return (
    <div data-lds-narrative-timeline data-timeline-direction={direction === 'row' ? 'row' : undefined} style={{ display: 'grid', gap: 'var(--space-3)', fontFamily: 'var(--font-sans)', ...style }} {...rest}>
      {rail}
      {undated.length > 0 && (
        <p
          data-timeline-undated
          style={{
            margin: 0,
            fontSize: 'var(--editorial-caption-size)',
            lineHeight: 'var(--editorial-caption-line)',
            letterSpacing: 'var(--editorial-caption-spacing)',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          시점 미상: {undated.map((event) => event.label).join(' · ')} — 날짜 확인 시 시간렬 등재
        </p>
      )}
    </div>
  );
}
