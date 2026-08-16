import React from 'react';
import { RankShift } from '../src/index.js';

const meta = {
  title: 'Editorial/Rank Shift',
  component: RankShift,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '두 시점 사이의 순위 변화를 기울기로 보여줍니다. 모든 항목이 양쪽에 순위 텍스트로 직접 라벨링되고, 강조는 코드가 하나로 강제합니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Rank Shift',
  render: () => (
    <RankShift
      startLabel="2025"
      endLabel="2026"
      style={{ maxWidth: 560 }}
      items={[
        { id: 'a', label: 'A라인', start: 1, end: 2 },
        { id: 'b', label: 'B라인', start: 2, end: 3 },
        { id: 'c', label: 'C라인', start: 4, end: 1, emphasis: true },
        { id: 'd', label: 'D라인', start: 3, end: 4, emphasis: true },
        { id: 'e', label: 'E라인', start: 5, end: 5 },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-lds-rank-shift]');
    if (!root) throw new Error('RankShift must render.');

    // 강조는 하나 — 두 항목이 요청해도 첫 번째(C라인)만 승인된다.
    const emphasizedLines = root.querySelectorAll('[data-rank-line][data-rank-emphasis="true"]');
    if (emphasizedLines.length !== 1) {
      throw new Error('Two items requested emphasis; the contract must grant exactly one.');
    }
    const emphasizedLabels = root.querySelectorAll('[data-rank-label-end][data-rank-emphasis="true"]');
    if (emphasizedLabels.length !== 1 || !emphasizedLabels[0].textContent.includes('C라인')) {
      throw new Error('The first emphasis request (C라인) must win; later ones are demoted.');
    }

    // 직접 라벨링 — 모든 항목이 양쪽에 순위 텍스트를 가진다.
    if (root.querySelectorAll('[data-rank-label-start]').length !== 5 || root.querySelectorAll('[data-rank-label-end]').length !== 5) {
      throw new Error('Every item must be labeled directly on both sides.');
    }
    const cEnd = emphasizedLabels[0].textContent;
    if (!cEnd.includes('1위') || !cEnd.includes('▲3')) {
      throw new Error('End labels must state the exact rank and the signed change.');
    }

    // 접근성 이름이 강조 항목의 변화를 말한다.
    if (!root.getAttribute('aria-label')?.includes('4위에서 1위로')) {
      throw new Error('The accessible name must carry the emphasized rank change.');
    }
  },
};
