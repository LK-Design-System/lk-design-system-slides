import React from 'react';

/**
 * LDS Slides — DeckViewer
 * The deck container: owns slide order, keyboard navigation, and the
 * progress display — and nothing inside a slide. One slide is mounted at a
 * time (a deck is a sequence, not a scroll), the ends clamp rather than
 * wrap (a presenter must feel the last slide), and every navigation
 * affordance exists twice: keys (← → Home End) for the presenter, visible
 * buttons for everyone else. The chrome sits on the alternative background
 * and stays quiet — the counter is fine print, and the progress bar is the
 * only accent the viewer spends.
 */
export function DeckViewer({ children, initial = 0, label = '슬라이드 덱', style, ...rest }) {
  const slides = React.Children.toArray(children);
  const count = slides.length;
  const clamp = React.useCallback(
    (value) => Math.min(Math.max(value, 0), Math.max(count - 1, 0)),
    [count]
  );
  const [index, setIndex] = React.useState(() => clamp(initial));
  const go = (next) => setIndex(clamp(next));

  const onKeyDown = (event) => {
    const handlers = {
      ArrowRight: index + 1,
      PageDown: index + 1,
      ArrowLeft: index - 1,
      PageUp: index - 1,
      Home: 0,
      End: count - 1,
    };
    if (event.key in handlers) {
      event.preventDefault();
      go(handlers[event.key]);
    }
  };

  return (
    <section
      data-lds-deck-viewer
      role="group"
      aria-roledescription="슬라이드 덱"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={{ display: 'grid', gap: 'var(--space-4)', outlineOffset: 4, ...style }}
      {...rest}
    >
      <div data-deck-slide>{slides[index]}</div>
      <footer
        data-deck-chrome
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <button
          type="button"
          data-deck-prev
          onClick={() => go(index - 1)}
          disabled={index === 0}
          style={{ font: 'inherit' }}
        >
          이전
        </button>
        <button
          type="button"
          data-deck-next
          onClick={() => go(index + 1)}
          disabled={index === count - 1}
          style={{ font: 'inherit' }}
        >
          다음
        </button>
        <div
          data-deck-progress-track
          aria-hidden="true"
          style={{
            flex: 1,
            height: 3,
            borderRadius: 'var(--radius-pill, 999px)',
            background: 'var(--color-semantic-fill-normal)',
            overflow: 'hidden',
          }}
        >
          <div
            data-deck-progress-fill
            style={{
              width: count > 0 ? `${((index + 1) / count) * 100}%` : 0,
              height: '100%',
              background: 'var(--color-semantic-primary-normal)',
            }}
          />
        </div>
        <p
          data-deck-progress
          aria-live="polite"
          style={{
            margin: 0,
            fontSize: 'var(--slides-fine-size)',
            lineHeight: 'var(--slides-fine-line)',
            letterSpacing: 'var(--slides-fine-spacing)',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          {count > 0 ? `${index + 1} / ${count}` : '0 / 0'}
        </p>
      </footer>
    </section>
  );
}
