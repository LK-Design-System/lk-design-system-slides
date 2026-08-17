import React from 'react';

/**
 * LDS Editorial — AnnotatedFigure
 * Wraps any figure (a Core chart, an image, an SVG) and owns the annotation
 * contract. The anchor decides the seat (ANNOTATION_REDESIGN_PROPOSAL):
 *
 * - An annotation WITH an `anchor` is a CALLOUT: it renders ON the canvas
 *   above or below its data element — never beside it, because a chart runs
 *   left to right and "beside the point" lands on the mark — tied to it by a
 *   short leader line and an anchor
 *   dot — "put the note where the action is" (FT/Datawrapper practice, and
 *   content-rules §3: 청중이 찾게 하지 않는다). Overlap with data is answered
 *   by a text halo, not by exiling the note off-canvas. The figure marks the
 *   element with `data-annotation-anchor="<id>"`; the link survives
 *   reordering, and the element gains `aria-details` to its note. A claimed
 *   anchor that matches nothing still shows in the rail with a visible
 *   "앵커 미확인" — a broken link cannot pass as prose.
 * - An annotation WITHOUT an anchor is CONTEXT: it has no point to sit
 *   beside, so it keeps the rail — but quietly. No card chrome; the lead
 *   rides note-body semibold (one rank below where it used to sit — an
 *   annotation stays quieter than the prose it serves) and the two-level
 *   hierarchy is carried by weight and colour, not size (Datawrapper's
 *   two-clearly-different-levels rule at annotation scale).
 *
 * At most one annotation carries emphasis; if several ask, the first wins —
 * enforced in code, not prose.
 *
 * Callout geometry is measured (anchor rects, figure size) — the same class
 * of measurement the rail width already does with its ResizeObserver, static
 * once layout settles.
 */
const CALLOUT_RATIO = 0.30;
const CALLOUT_MIN = 170;
const CALLOUT_GAP = 14;
// Which half a callout escapes into. An anchor below this line is annotated
// from ABOVE, one above it from BELOW — the note goes into the emptier half of
// the canvas. Slightly above centre because figures are usually bottom-weighted
// by their axis.
const CALLOUT_FLIP = 0.45;

export function AnnotatedFigure({ children, annotations = [], caption, style, ...rest }) {
  let emphasisTaken = false;
  const resolved = annotations.map((annotation) => {
    const wantsEmphasis = Boolean(annotation.emphasis);
    const granted = wantsEmphasis && !emphasisTaken;
    if (granted) emphasisTaken = true;
    return { ...annotation, emphasis: granted };
  });

  const bodyRef = React.useRef(null);
  const listId = React.useId();
  const anchorKey = resolved.map((annotation) => annotation.anchor ?? '').join('|');

  // Callout seats: anchor rects measured relative to the figure body. Also the
  // authority on which anchors exist — a missing one demotes its annotation to
  // the rail with the visible warning.
  const [seats, setSeats] = React.useState({});
  const measure = React.useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    const bodyRect = body.getBoundingClientRect();
    if (bodyRect.width === 0 || body.offsetWidth === 0) return;
    // getBoundingClientRect reports SCREEN px, but a seat is written back as
    // ordinary CSS px inside the body — and a slide surface scales its canvas
    // with a transform, so the two spaces differ by that factor. Divide it out
    // or every callout lands short of its anchor (measured 439 → 354 at 0.81
    // scale). ResizeObserver cannot see this: a transform changes no layout
    // box, which is also why the drift survived the observer.
    const scale = bodyRect.width / body.offsetWidth;
    const toLocal = (value) => value / scale;
    const bodyWidth = toLocal(bodyRect.width);
    const bodyHeight = toLocal(bodyRect.height);
    const calloutWidth = Math.max(Math.round(bodyWidth * CALLOUT_RATIO), CALLOUT_MIN);
    const next = {};
    resolved.forEach((annotation, index) => {
      if (!annotation.anchor) return;
      const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(annotation.anchor) : annotation.anchor;
      const target = body.querySelector(`[data-annotation-anchor="${escaped}"]`);
      if (!target) {
        next[annotation.anchor] = { status: 'missing' };
        return;
      }
      target.setAttribute('aria-details', `${listId}-${index}`);
      const rect = target.getBoundingClientRect();
      const cx = toLocal(rect.left - bodyRect.left + rect.width / 2);
      const cy = toLocal(rect.top - bodyRect.top + rect.height / 2);
      // A callout escapes VERTICALLY, not sideways. Seating it beside the
      // anchor puts it exactly where the data is on the commonest subject we
      // annotate — a line chart runs left to right, so "next to the point" is
      // "on the line", and the first cut duly printed a note through the curve
      // (user-flagged, 2026-08-17). Going into the emptier half clears the
      // mark, and the leader that ties them then runs ACROSS the data's
      // direction instead of along it, which is what makes it readable.
      const above = cy > bodyHeight * CALLOUT_FLIP;
      // Anchored to the anchor's x and clamped inside the canvas; the seat is
      // expressed from whichever edge the callout grows away from, so its own
      // height never needs measuring.
      const left = Math.min(Math.max(cx - CALLOUT_GAP, 0), Math.max(bodyWidth - calloutWidth, 0));
      next[annotation.anchor] = {
        status: 'linked',
        side: above ? 'above' : 'below',
        left,
        top: above ? undefined : cy + CALLOUT_GAP,
        bottom: above ? Math.max(bodyHeight - (cy - CALLOUT_GAP), 0) : undefined,
        width: calloutWidth,
        anchorX: cx,
        anchorY: cy,
        bodyWidth,
        bodyHeight,
      };
    });
    setSeats((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
    // resolved is rebuilt every render; anchorKey captures the part that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorKey, listId]);

  React.useEffect(() => {
    measure();
    const body = bodyRef.current;
    if (!body) return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  }, [measure]);

  const callouts = resolved
    .map((annotation, index) => ({ annotation, index, seat: annotation.anchor ? seats[annotation.anchor] : undefined }))
    .filter((entry) => entry.seat?.status === 'linked');
  const railNotes = resolved
    .map((annotation, index) => ({ annotation, index, seat: annotation.anchor ? seats[annotation.anchor] : undefined }))
    .filter((entry) => !entry.annotation.anchor || entry.seat?.status === 'missing');

  // The halo that lets a callout sit over data and stay readable — the
  // surface colour, stroked around the glyphs (Datawrapper's text outline).
  const halo = 'var(--color-semantic-background-elevated-normal)';
  const haloShadow = `0 0 2px ${halo}, 0 0 2px ${halo}, 0 0 3px ${halo}, 0 0 4px ${halo}`;

  const noteLead = (emphasis) => ({
    margin: 0,
    fontSize: 'var(--editorial-note-body-size)',
    lineHeight: 'var(--editorial-note-body-line)',
    letterSpacing: 'var(--editorial-note-body-spacing)',
    fontWeight: 'var(--fw-semibold)',
    color: emphasis ? 'var(--color-semantic-primary-strong)' : 'var(--color-semantic-label-strong)',
  });
  const noteBody = {
    margin: 'var(--space-1) 0 0',
    fontSize: 'var(--editorial-note-body-size)',
    lineHeight: 'var(--editorial-note-body-line)',
    letterSpacing: 'var(--editorial-note-body-spacing)',
    color: 'var(--color-semantic-label-neutral)',
  };

  return (
    <figure
      data-lds-annotated-figure
      data-annotation-layout={railNotes.length > 0 ? 'side' : 'canvas'}
      style={{
        margin: 0,
        display: 'inline-flex',
        flexDirection: 'row',
        // A container too narrow for figure + rail wraps the rail underneath —
        // the stacked fallback, now by flow instead of measurement.
        flexWrap: 'wrap',
        // Width policy is the medium's (--editorial-figure-width): auto in
        // prose, 100% on a slide.
        width: 'var(--editorial-figure-width)',
        maxWidth: '100%',
        columnGap: 'var(--editorial-figure-gap)',
        rowGap: 'var(--editorial-row-gap)',
        alignItems: 'flex-start',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    >
      <div ref={bodyRef} data-annotated-figure-body style={{ position: 'relative', minWidth: 0, flex: '1 1 auto' }}>
        {children}
        {/* Leader lines under the callouts: short, straight, thinner than a
            data mark, with a dot planted at the anchor. */}
        {callouts.length > 0 && (
          <svg
            data-annotation-leaders
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
          >
            {callouts.map(({ annotation, seat }) => {
              const stroke = annotation.emphasis ? 'var(--editorial-emphasis)' : 'var(--color-semantic-label-alternative)';
              // Straight down or straight up from the dot to the callout's near
              // edge — short, and crossing the data rather than following it.
              const toY = seat.side === 'above' ? seat.anchorY - CALLOUT_GAP : seat.anchorY + CALLOUT_GAP;
              return (
                <g key={annotation.anchor}>
                  <line x1={seat.anchorX} y1={seat.anchorY} x2={seat.anchorX} y2={toY} stroke={stroke} strokeWidth="1.5" />
                  <circle cx={seat.anchorX} cy={seat.anchorY} r="3.5" fill={stroke} />
                </g>
              );
            })}
          </svg>
        )}
        {callouts.map(({ annotation, index, seat }) => (
          <div
            key={annotation.id ?? index}
            id={`${listId}-${index}`}
            data-annotation
            data-annotation-kind="anchored"
            data-annotation-anchor-status="linked"
            data-annotation-emphasis={annotation.emphasis ? 'true' : undefined}
            style={{
              position: 'absolute',
              left: seat.left,
              top: seat.top,
              bottom: seat.bottom,
              width: seat.width,
              maxWidth: '100%',
              textShadow: haloShadow,
              pointerEvents: 'none',
            }}
          >
            <p style={noteLead(annotation.emphasis)}>{annotation.title}</p>
            {annotation.body && <p style={noteBody}>{annotation.body}</p>}
          </div>
        ))}
        {caption && (
          <figcaption
            style={{
              marginTop: 'var(--space-2)',
              fontSize: 'var(--editorial-caption-size)',
              lineHeight: 'var(--editorial-caption-line)',
              letterSpacing: 'var(--editorial-caption-spacing)',
              color: 'var(--color-semantic-label-alternative)',
            }}
          >
            {caption}
          </figcaption>
        )}
      </div>
      {railNotes.length > 0 && (
        <ul
          data-annotated-figure-notes
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--editorial-row-gap)',
            flex: 'none',
            width: 'var(--editorial-annotation-min-width)',
          }}
        >
          {railNotes.map(({ annotation, index, seat }) => (
            <li
              key={annotation.id ?? index}
              id={`${listId}-${index}`}
              data-annotation
              data-annotation-kind={annotation.anchor ? 'anchored' : 'context'}
              data-annotation-anchor-status={seat?.status}
              data-annotation-emphasis={annotation.emphasis ? 'true' : undefined}
            >
              <p style={noteLead(annotation.emphasis)}>{annotation.title}</p>
              {annotation.body && <p style={noteBody}>{annotation.body}</p>}
              {seat?.status === 'missing' && (
                <p
                  data-annotation-anchor-warning
                  style={{
                    margin: 'var(--space-1) 0 0',
                    fontSize: 'var(--editorial-caption-size)',
                    lineHeight: 'var(--editorial-caption-line)',
                    letterSpacing: 'var(--editorial-caption-spacing)',
                    color: 'var(--color-semantic-status-cautionary-text, var(--color-semantic-status-cautionary))',
                  }}
                >
                  앵커 미확인: {annotation.anchor}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
