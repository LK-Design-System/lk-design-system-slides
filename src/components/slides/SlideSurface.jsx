import React from 'react';

/**
 * LDS Slides — SlideSurface
 * The one canonical slide canvas: a 16:9 surface that scales with its
 * container and keeps content inside the projection-safe area. Layout
 * components render inside it; it owns geometry, never content meaning.
 *
 * `preset` names the deck kind ('keynote' | 'briefing'): it only switches
 * which `--slides-*` token values apply. Unset means the `:root` default
 * (keynote — the strictest projection floor).
 */
export function SlideSurface({ children, safeArea = true, preset, style, ...rest }) {
  return (
    <section
      data-lds-slide-surface
      data-slides-preset={preset}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: 'var(--slides-canvas-max-width)',
        aspectRatio: 'var(--slides-aspect)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: safeArea ? 'var(--slides-safe-y) var(--slides-safe-x)' : 0,
        background: 'var(--slides-surface)',
        border: '1px solid var(--slides-surface-edge)',
        borderRadius: 'var(--radius-md, 12px)',
        color: 'var(--color-semantic-label-normal)',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {children}
    </section>
  );
}
