import React from 'react';
import { BeforeAfter } from '../src/index.js';

const meta = {
  title: 'Editorial/Before After',
  component: BeforeAfter,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '명시된 기준 대비 편차를 발산 막대로 보여줍니다. 기준 라벨을 생략해도 컴포넌트가 값으로 자동 표기하고, 방향은 막대 방향과 부호 텍스트가 말하며, 강조는 코드가 하나로 강제합니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Before After',
  render: () => (
    <BeforeAfter
      reference={{ value: 100, label: '목표 100건' }}
      unitLabel="건"
      style={{ maxWidth: 560 }}
      items={[
        { id: 'a', label: 'A스테이션', value: 112 },
        { id: 'b', label: 'B스테이션', value: 96 },
        { id: 'c', label: 'C스테이션', value: 130, emphasis: true },
        { id: 'd', label: 'D스테이션', value: 88, emphasis: true },
        { id: 'e', label: 'E스테이션', value: 100 },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-lds-before-after]');
    if (!root) throw new Error('BeforeAfter must render.');

    // 기준은 항상 표기된다.
    if (!root.querySelector('[data-reference-label]')?.textContent.includes('목표 100건')) {
      throw new Error('The reference baseline must be visibly labeled.');
    }

    // 강조는 하나 — 두 항목이 요청해도 첫 번째(C스테이션)만 승인된다.
    const emphasized = root.querySelectorAll('[data-deviation-item][data-deviation-emphasis="true"]');
    if (emphasized.length !== 1 || !emphasized[0].textContent.includes('C스테이션')) {
      throw new Error('Two items requested emphasis; the first (C스테이션) must win.');
    }

    // 부호 텍스트 병기 — 방향을 색이 아니라 부호가 말한다.
    const values = Array.from(root.querySelectorAll('[data-deviation-value]')).map((node) => node.textContent);
    if (!values.includes('+30건') || !values.includes('−12건') || !values.includes('±0건')) {
      throw new Error('Every deviation must be stated as signed text.');
    }

    // 방향은 막대 위치가 말한다 — above 2, below 2, at 1.
    const count = (direction) => root.querySelectorAll(`[data-deviation-bar][data-deviation-direction="${direction}"]`).length;
    if (count('above') !== 2 || count('below') !== 2 || count('at') !== 1) {
      throw new Error('Bar directions must match the sign of each deviation.');
    }

    // 접근성 이름이 기준과 강조 항목의 편차를 말한다.
    if (!root.getAttribute('aria-label')?.includes('C스테이션 +30건')) {
      throw new Error('The accessible name must carry the emphasized deviation.');
    }
  },
};

export const AutoLabeledReference = {
  name: 'Auto-labeled Reference',
  render: () => (
    <BeforeAfter
      reference={{ value: 250 }}
      unitLabel="건"
      style={{ maxWidth: 560 }}
      items={[
        { id: 'p', label: '1분기', value: 268 },
        { id: 'q', label: '2분기', value: 241 },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    // 기준 라벨을 생략해도 편차는 기준 없이 그려질 수 없다 — 값으로 자동 표기된다.
    const label = canvasElement.querySelector('[data-reference-label]');
    if (!label?.textContent.includes('기준 250건')) {
      throw new Error('An omitted reference label must be auto-printed from the value.');
    }
  },
};
