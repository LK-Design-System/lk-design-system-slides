import React from 'react';
import { KeyFigure } from '../src/index.js';

const meta = {
  title: 'Editorial/Key Figure',
  component: KeyFigure,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '숫자 하나에 주장 하나를 붙이는 핵심 수치입니다. 숫자는 Core Stat이 그리고, 이 컴포넌트는 주장·출처·강조의 서사 프레임만 소유합니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Key Figure',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
      <KeyFigure
        value="534"
        label="스토리"
        claim="모든 컴포넌트 계약을 실행 가능한 스토리로 문서화"
        source="Core Storybook 인덱스, 2026-07"
      />
      <KeyFigure
        value="0"
        label="무음 실패"
        claim="story-play 래칫 도입 후 알려진 실패 0건"
        emphasis
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const figures = canvasElement.querySelectorAll('[data-lds-key-figure]');
    if (figures.length !== 2) throw new Error('Both key figures must render.');
    const emphasized = canvasElement.querySelectorAll('[data-lds-key-figure][data-emphasis="true"]');
    if (emphasized.length !== 1) {
      throw new Error('Exactly one key figure carries emphasis in this composition.');
    }
    if (!figures[0].textContent.includes('534')) {
      throw new Error('The numeral must always be visible text.');
    }
    const claim = figures[0].querySelector('[data-key-figure-claim]');
    if (!claim) throw new Error('The claim line must render beneath the numeral.');
  },
};
