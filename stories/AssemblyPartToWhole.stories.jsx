import React from 'react';
import { DonutChart } from '@lk-design-system/lds-product';
import { AnnotatedFigure } from '../src/index.js';

// Part-to-Whole is an assembly category: the chart is upstream's, this layer
// adds the claim frame and enforces the Urban rules (fewer than 5 slices).
const SEGMENTS = [
  { id: 'transport', label: '운송', value: 520 },
  { id: 'picking', label: '피킹', value: 310 },
  { id: 'charging', label: '충전', value: 90 },
  { id: 'idle', label: '대기', value: 80 },
];

const meta = {
  title: 'Assembly/Part-to-Whole',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Part-to-Whole는 조립 카테고리입니다. 도넛은 Product DonutChart가 그리고, 이 층은 주장 프레임과 Urban 규칙(조각 5개 미만)을 play 단언으로 강제합니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Part-to-Whole',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 720 }}>
      <h3
        data-assembly-title
        style={{
          margin: 0,
          fontSize: 'var(--headline1-size)',
          lineHeight: 'var(--headline1-line)',
          fontWeight: 'var(--fw-semibold)',
          color: 'var(--color-semantic-label-strong)',
        }}
      >
        임무 시간의 절반 이상이 운송에 집중
      </h3>
      <AnnotatedFigure
        caption="출처: 임무 로그 월간 집계, 2026-07 기준 · 단위: 시간"
        annotations={[
          { id: 'transport', title: '운송 52%', body: '전월 대비 +4%p, 신규 물류동 증차 영향', emphasis: true },
          { id: 'idle', title: '대기 8%', body: '목표 상한 10% 이내 유지' },
        ]}
      >
        <DonutChart aria-label="임무 유형별 시간 비중" segments={SEGMENTS} />
      </AnnotatedFigure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Urban 규칙 — 파이/도넛 조각은 5개 미만.
    const slices = canvasElement.querySelectorAll('[data-donut-segment]');
    if (slices.length === 0 || slices.length >= 5) {
      throw new Error(`A part-to-whole donut must keep fewer than 5 slices (got ${slices.length}).`);
    }

    // 직접 라벨링 — 모든 조각의 라벨이 텍스트로 보인다.
    const text = canvasElement.querySelector('[data-lds-annotated-figure]').textContent;
    for (const segment of SEGMENTS) {
      if (!text.includes(segment.label)) {
        throw new Error(`Every slice must be labeled as visible text (missing ${segment.label}).`);
      }
    }

    // 주장형 제목, 명사형 종결.
    const title = canvasElement.querySelector('[data-assembly-title]');
    if (!title?.textContent.includes('절반')) {
      throw new Error('The assembly must open with a claim, not a data name.');
    }
    if (/다[.!]?$/.test(title.textContent.trim())) {
      throw new Error('Korean headlines must end with a noun, not a declarative ending.');
    }

    // 강조는 하나.
    if (canvasElement.querySelectorAll('[data-annotation-emphasis="true"]').length !== 1) {
      throw new Error('Exactly one annotation may carry emphasis.');
    }
  },
};
