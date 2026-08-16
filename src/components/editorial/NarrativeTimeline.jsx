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
 */
export function NarrativeTimeline({ events = [], label, style, ...rest }) {
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

  return (
    <div data-lds-narrative-timeline style={{ display: 'grid', gap: 'var(--space-3)', fontFamily: 'var(--font-sans)', ...style }} {...rest}>
      <Timeline label={railLabel} items={items} />
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
