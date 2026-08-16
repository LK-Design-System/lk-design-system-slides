import React from 'react';

/**
 * LDS Editorial — AnnotatedFigure
 * Wraps any figure (a Core chart, an image, an SVG) and owns the annotation
 * contract: annotations sit beside the figure — never on top of data — and
 * at most one annotation carries emphasis. If several ask for emphasis the
 * first wins and the rest are demoted; the contract is enforced in code,
 * not prose.
 *
 * Two annotation kinds (Datawrapper convention): an annotation with an
 * `anchor` points at a specific data element — the figure marks it with
 * `data-annotation-anchor="<id>"`, the link survives reordering, and the
 * element gains `aria-details` to its note. An annotation without an anchor
 * is context. A claimed anchor that matches nothing is not hidden — the
 * note visibly reports "앵커 미확인" so a broken link cannot pass as prose.
 * Geometry (offset, note width) is a ratio of the figure width, not pixels,
 * clamped up to a readability floor; a figure narrower than the floor
 * stacks its notes underneath instead of beside.
 */
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
  const [anchorStatus, setAnchorStatus] = React.useState({});
  const anchorKey = resolved.map((annotation) => annotation.anchor ?? '').join('|');

  // The annotation column is a ratio of the FIGURE's width, not the outer
  // container's: a small donut gets a narrow nearby note, a wide chart a
  // wider one. Percent-of-parent cannot express that (the parent hugs its
  // content), so the body is measured and tracked with a ResizeObserver.
  // The ratio is clamped up to a readability floor, and a figure narrower
  // than the floor stacks its notes underneath instead of beside.
  const [notesLayout, setNotesLayout] = React.useState(null);
  React.useEffect(() => {
    const body = bodyRef.current;
    if (!body) return undefined;
    const computed = getComputedStyle(body);
    const ratioText = computed.getPropertyValue('--editorial-annotation-width').trim();
    const ratio = ratioText.endsWith('%') ? Number.parseFloat(ratioText) / 100 : 0.32;
    const minWidth = Number.parseFloat(computed.getPropertyValue('--editorial-annotation-min-width')) || 200;
    const offsetText = computed.getPropertyValue('--editorial-annotation-offset').trim();
    const offsetRatio = offsetText.endsWith('%') ? Number.parseFloat(offsetText) / 100 : 0.03;
    const update = () => {
      const bodyWidth = body.getBoundingClientRect().width;
      const ideal = Math.round(bodyWidth * ratio);
      // A percent column-gap resolves to zero inside a fit-content container,
      // so the offset ratio is converted to pixels here too, floored so the
      // notes never touch the figure.
      const gap = Math.max(Math.round(bodyWidth * offsetRatio), 16);
      const next =
        ideal >= minWidth
          ? { mode: 'side', width: ideal, gap }
          : bodyWidth >= minWidth
            ? { mode: 'side', width: Math.round(minWidth), gap }
            : { mode: 'stacked', width: Math.round(bodyWidth), gap };
      setNotesLayout((previous) =>
        previous && previous.mode === next.mode && previous.width === next.width && previous.gap === next.gap
          ? previous
          : next,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(body);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const status = {};
    resolved.forEach((annotation, index) => {
      if (!annotation.anchor) return;
      const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(annotation.anchor) : annotation.anchor;
      const target = body.querySelector(`[data-annotation-anchor="${escaped}"]`);
      if (target) {
        status[annotation.anchor] = 'linked';
        target.setAttribute('aria-details', `${listId}-${index}`);
      } else {
        status[annotation.anchor] = 'missing';
      }
    });
    setAnchorStatus((previous) =>
      JSON.stringify(previous) === JSON.stringify(status) ? previous : status,
    );
    // resolved is rebuilt every render; anchorKey captures the part that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorKey, listId]);

  return (
    <figure
      data-lds-annotated-figure
      data-annotation-layout={notesLayout?.mode ?? 'side'}
      style={{
        margin: 0,
        display: 'inline-flex',
        flexDirection: notesLayout?.mode === 'stacked' ? 'column' : 'row',
        maxWidth: '100%',
        columnGap: notesLayout != null ? notesLayout.gap : 'var(--space-4)',
        rowGap: 'var(--space-3)',
        alignItems: 'flex-start',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    >
      <div ref={bodyRef} data-annotated-figure-body style={{ minWidth: 0, flex: '0 1 auto' }}>
        {children}
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
      {resolved.length > 0 && (
        <ul
          data-annotated-figure-notes
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            flex: 'none',
            width: notesLayout != null ? notesLayout.width : 'var(--editorial-annotation-min-width)',
          }}
        >
          {resolved.map(({ id, title, body, emphasis, anchor }, index) => {
            const kind = anchor ? 'anchored' : 'context';
            const status = anchor ? anchorStatus[anchor] : undefined;
            return (
              <li
                key={id ?? index}
                id={`${listId}-${index}`}
                data-annotation
                data-annotation-kind={kind}
                data-annotation-anchor-status={status}
                data-annotation-emphasis={emphasis ? 'true' : undefined}
                style={{
                  borderLeft: `2px solid ${emphasis ? 'var(--editorial-emphasis)' : 'var(--editorial-annotation-line)'}`,
                  paddingLeft: 'var(--space-3)',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--editorial-note-size)',
                    lineHeight: 'var(--editorial-note-line)',
                    letterSpacing: 'var(--editorial-note-spacing)',
                    fontWeight: 'var(--fw-semibold)',
                    color: emphasis ? 'var(--color-semantic-primary-strong)' : 'var(--color-semantic-label-strong)',
                  }}
                >
                  {kind === 'anchored' && (
                    <span aria-hidden="true" style={{ marginRight: 'var(--space-1)' }}>↘</span>
                  )}
                  {title}
                </p>
                {body && (
                  <p
                    style={{
                      margin: 'var(--space-1) 0 0',
                      fontSize: 'var(--editorial-note-body-size)',
                      lineHeight: 'var(--editorial-note-body-line)',
                      letterSpacing: 'var(--editorial-note-body-spacing)',
                      color: 'var(--color-semantic-label-neutral)',
                    }}
                  >
                    {body}
                  </p>
                )}
                {status === 'missing' && (
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
                    앵커 미확인: {anchor}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </figure>
  );
}
