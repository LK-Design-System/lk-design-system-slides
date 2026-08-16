import React from 'react';
import { PictogramRow } from '../src/index.js';

const meta = {
  title: 'Editorial/Pictogram Row',
  component: PictogramRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '수량을 반복 단위(ISOTYPE)로 표현합니다. 픽토그램은 보조 채널이며, 정확한 값은 항상 텍스트와 접근성 이름으로 함께 제공됩니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Pictogram Row',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-6)', maxWidth: 520 }}>
      <PictogramRow value={179} per={20} unitLabel="개" label="React 컴포넌트" />
      <PictogramRow value={111} per={20} unitLabel="건" label="play 함수 단언" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll('[data-lds-pictogram-row]');
    if (rows.length !== 2) throw new Error('Both pictogram rows must render.');
    const first = rows[0];
    if (!first.getAttribute('aria-label')?.includes('179')) {
      throw new Error('The accessible name must carry the exact value, not the unit count.');
    }
    if (!first.querySelector('[data-pictogram-value]')?.textContent.includes('179')) {
      throw new Error('The exact value must be visible text beside the pictogram.');
    }
    const filled = first.querySelectorAll('[data-pictogram-unit="filled"]').length;
    const partial = first.querySelectorAll('[data-pictogram-unit="partial"]').length;
    if (filled !== 8 || partial !== 1) {
      throw new Error('179 at 20 per unit must render 8 full units and 1 partial unit.');
    }
    if (!first.querySelector('[data-pictogram-scale]')) {
      throw new Error('A scaled pictogram must declare its unit scale.');
    }
  },
};
