import '@lk-design-system/lds-core/styles.css';
import '@lk-design-system/lds-theme/styles.css';
import '@lk-design-system/lds-product/styles.css';
// Editorial tokens now come through this package's own styles.css.
import '../styles.css';
import React from 'react';

const preview = {
  parameters: {
    layout: 'fullscreen',
    options: { storySort: { order: ['Slides'] } },
  },
  decorators: [
    (Story) => {
      // A print sheet must sit at the page origin: this harness's own padding
      // would push the first page down and spill every slide onto the next
      // sheet (measured — a 4-slide deck exported as 6 pages). The same is true
      // of any consumer layout, which is why check:print-sheet measures the
      // sheet's offset under print media rather than trusting this.
      const printing = typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).has('lds-print');
      return (
        <div
          style={{
            minHeight: printing ? undefined : '100vh',
            boxSizing: 'border-box',
            padding: printing ? 0 : 'clamp(16px, 5vw, 32px)',
            background: 'var(--color-semantic-background-normal-alternative)',
            color: 'var(--color-semantic-label-normal)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
