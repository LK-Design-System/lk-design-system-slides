import React from 'react';
import { ContentSlide } from './ContentSlide.jsx';
import { SlideSurface } from './SlideSurface.jsx';

/**
 * LDS Slides — ImageSlide
 * The photograph slide: one image as the content, either inside the header
 * contract (contained) or as the whole canvas (`bleed`). FigureSlide is for
 * an exhibit that carries annotations; this is for an image that carries the
 * moment — a product shot, a site photo, a hero.
 *
 * Three things it owns, all consequences of images being ASYNC:
 *
 * The BOX. `aspect` reserves the image's space before a single byte loads,
 * so a slow photo cannot reflow the slide — the same contract Step makes for
 * reveals, held against the network instead of the presenter. The image
 * covers or fits that box (`fit`); it never sets its own height.
 *
 * The ALT. A photograph an audience is asked to read is content, and content
 * has a text channel — the Editorial doctrine's "graphics are the secondary
 * channel" applied to pixels. A missing `alt` renders a visible failure on
 * the canvas (the AnnotatedFigure 앵커-미확인 precedent): a broken contract
 * must not pass as a design choice.
 *
 * The ATTRIBUTION. `caption` names what is shown, `source` names where it
 * came from — on the canvas for contained, on a scrim for bleed, because a
 * photo without provenance is decoration, and decoration is an anti-pattern
 * this system already rejects.
 */
const ALT_WARNING = '대체 텍스트 없음 — 이 사진이 말하는 바를 alt로 쓰라';

function Attribution({ caption, source, onScrim = false }) {
  if (!caption && !source) return null;
  return (
    <figcaption
      data-image-slide-attribution
      style={{
        display: 'grid',
        gap: 'var(--space-1)',
        ...(onScrim
          ? {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 'var(--space-5) var(--slides-safe-x) var(--space-6)',
            background: 'linear-gradient(transparent, rgba(10, 10, 12, 0.72))',
          }
          : {}),
      }}
    >
      {caption && (
        <span
          data-image-slide-caption
          style={{
            fontSize: 'var(--slides-caption-size)',
            lineHeight: 'var(--slides-caption-line)',
            letterSpacing: 'var(--slides-caption-spacing)',
            fontWeight: 'var(--fw-semibold)',
            color: onScrim ? '#fafaf8' : 'var(--color-semantic-label-strong)',
          }}
        >
          {caption}
        </span>
      )}
      {source && (
        <span
          data-image-slide-source
          style={{
            fontSize: 'var(--slides-fine-size)',
            lineHeight: 'var(--slides-fine-line)',
            letterSpacing: 'var(--slides-fine-spacing)',
            color: onScrim ? 'rgba(250, 250, 248, 0.8)' : 'var(--color-semantic-label-alternative)',
          }}
        >
          {source}
        </span>
      )}
    </figcaption>
  );
}

function Image({ src, alt, fit, aspect }) {
  const missingAlt = typeof alt !== 'string' || alt.trim() === '';
  const fillsParent = aspect === 'auto';
  return (
    <span
      data-image-slide-box
      data-image-alt-missing={missingAlt ? 'true' : undefined}
      style={{
        position: 'relative',
        display: 'block',
        // The box is driven by the HEIGHT it is given, never by the file:
        // under a full header a width-driven 16/9 box runs 230px past the
        // canvas (the overflow gate caught exactly that), so the remaining
        // region hands the box its height and the ratio derives the width.
        // 'auto' means the parent already owns the box (bleed = the canvas).
        height: '100%',
        minHeight: 0,
        aspectRatio: fillsParent ? undefined : aspect,
        width: fillsParent ? '100%' : 'auto',
        maxWidth: '100%',
        overflow: 'hidden',
        borderRadius: fillsParent ? 0 : 'var(--radius-md, 12px)',
        background: 'var(--color-semantic-fill-normal)',
      }}
    >
      <img
        src={src}
        alt={missingAlt ? '' : alt}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: fit,
        }}
      />
      {missingAlt && (
        <span
          data-image-alt-warning
          style={{
            position: 'absolute',
            left: 'var(--space-3)',
            bottom: 'var(--space-3)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-md, 8px)',
            fontSize: 'var(--slides-fine-size)',
            lineHeight: 'var(--slides-fine-line)',
            background: 'var(--color-semantic-status-cautionary, #b45309)',
            color: '#fafaf8',
          }}
        >
          {ALT_WARNING}
        </span>
      )}
    </span>
  );
}

export function ImageSlide({
  eyebrow,
  title,
  governing,
  src,
  alt,
  caption,
  source,
  // The remaining content height drives the box; the ratio only shapes it.
  // A portrait or square photo declares its own ratio and keeps its box.
  aspect = '16 / 9',
  fit = 'cover',
  bleed = false,
  style,
  ...rest
}) {
  if (bleed) {
    return (
      <SlideSurface
        safeArea={false}
        data-lds-image-slide
        data-image-bleed="true"
        style={{ position: 'relative', ...style }}
        {...rest}
      >
        <figure data-image-slide-figure style={{ margin: 0, position: 'absolute', inset: 0 }}>
          <Image src={src} alt={alt} fit="cover" aspect="auto" />
          <Attribution caption={caption} source={source} onScrim />
        </figure>
      </SlideSurface>
    );
  }

  return (
    <ContentSlide
      eyebrow={eyebrow}
      title={title}
      governing={governing}
      data-lds-image-slide
      style={style}
      {...rest}
    >
      <figure
        data-image-slide-figure
        style={{
          margin: 0,
          height: '100%',
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: 'minmax(0, 1fr) auto',
          gap: 'var(--space-4)',
          justifyItems: 'start',
        }}
      >
        <Image src={src} alt={alt} fit={fit} aspect={aspect} />
        <Attribution caption={caption} source={source} />
      </figure>
    </ContentSlide>
  );
}
