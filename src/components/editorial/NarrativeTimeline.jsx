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
 * document reads a chronology top-down ('column'), a fixed canvas reads it
 * left-to-right ('row'). BOTH delegate to Core's Timeline — the row branch's
 * hand-rolled ol/time markup was retired once upstream grew
 * `orientation="horizontal"` and the `--lk-timeline-*` type hooks
 * (lk-design-system/docs/TIMELINE_ORIENTATION_PROPOSAL.md, rc.69.27). Rail
 * geometry is upstream's; this layer keeps only what it owns: the narrative
 * contract above, and the medium's type ranks, re-pointed through the hooks
 * so the chronology reads at editorial rank instead of product rank.
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

  /* One delegation, two orientations. The medium re-points Core's type hooks
     to its own ranks — what moves is rank, not size: stamp at caption,
     event label at note, body at note-body, exactly the ranks the hand-rolled
     rail used to hard-code. */
  const rail = (
    <Timeline
      label={railLabel}
      items={items}
      orientation={direction === 'row' ? 'horizontal' : 'vertical'}
      style={{
        '--lk-timeline-time-size': 'var(--editorial-caption-size)',
        '--lk-timeline-time-line': 'var(--editorial-caption-line)',
        '--lk-timeline-time-spacing': 'var(--editorial-caption-spacing)',
        '--lk-timeline-title-size': 'var(--editorial-note-size)',
        '--lk-timeline-title-line': 'var(--editorial-note-line)',
        '--lk-timeline-title-spacing': 'var(--editorial-note-spacing)',
        '--lk-timeline-desc-size': 'var(--editorial-note-body-size)',
        '--lk-timeline-desc-line': 'var(--editorial-note-body-line)',
        '--lk-timeline-desc-spacing': 'var(--editorial-note-body-spacing)',
      }}
    />
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
