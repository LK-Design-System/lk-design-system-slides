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
    (Story) => (
      <div
        style={{
          minHeight: '100vh',
          boxSizing: 'border-box',
          padding: 'clamp(16px, 5vw, 32px)',
          background: 'var(--color-semantic-background-normal-alternative)',
          color: 'var(--color-semantic-label-normal)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
