import React from 'react';
import { BarChart } from '@lk-design-system/lds-product';
import { AnnotatedFigure } from '../src/index.js';

// Distribution is an assembly category: the histogram is upstream's BarChart,
// this layer adds the claim frame and enforces the Urban rules (zero baseline,
// bounded bin count, values as visible text).
const BINS = [
  { id: 'b1', label: '0–2분', value: 12 },
  { id: 'b2', label: '2–4분', value: 34 },
  { id: 'b3', label: '4–6분', value: 48 },
  { id: 'b4', label: '6–8분', value: 27 },
  { id: 'b5', label: '8–10분', value: 9 },
  { id: 'b6', label: '10분+', value: 4 },
];

const meta = {
  title: 'Assembly/Distribution',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Distribution은 조립 카테고리입니다. 히스토그램은 Product BarChart가 그리고, 이 층은 주장 프레임과 Urban 규칙(영 기준선·구간 수 상한·값 병기)을 play 단언으로 강제합니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Distribution',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 760 }}>
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
        주행 소요시간, 4–6분 구간에 최다 분포
      </h3>
      <AnnotatedFigure
        caption="출처: 주행 로그 134건, 2026-07 4주차 · 구간 폭 2분"
        annotations={[
          { id: 'mode', title: '최빈 구간 4–6분', body: '전체의 36%, 계획 소요시간과 일치', emphasis: true },
          { id: 'tail', title: '10분+ 꼬리 4건', body: '전 건 수동 개입 이력과 중복' },
        ]}
      >
        <BarChart aria-label="주행 소요시간 분포" data={BINS} height={180} style={{ width: 460 }} />
      </AnnotatedFigure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Urban 규칙 — 구간 수 상한 7.
    const bars = Array.from(canvasElement.querySelectorAll('[data-bar-value]'));
    if (bars.length === 0 || bars.length > 7) {
      throw new Error(`A distribution must keep its bin count bounded (≤7, got ${bars.length}).`);
    }

    // 영 기준선 — 모든 막대가 최저 구간 대비 값의 비율만큼 높아야 한다. 최대값
    // 막대도 예외가 아니다. 잘린 축이면 어떤 쌍의 비례든 깨진다.
    const byValue = new Map(bars.map((bar) => [Number(bar.getAttribute('data-bar-value')), bar]));
    const short = byValue.get(12).getBoundingClientRect().height;
    for (const bin of BINS) {
      const ratio = byValue.get(bin.value).getBoundingClientRect().height / short;
      const expected = bin.value / 12;
      if (Math.abs(ratio - expected) > 0.05) {
        throw new Error(`Bar heights must be proportional from a zero baseline (${bin.value}/12 should read ${expected.toFixed(2)}x, got ${ratio.toFixed(2)}x).`);
      }
    }

    // 값 병기 — 모든 구간의 값이 텍스트로 보인다.
    const text = canvasElement.querySelector('[data-lds-annotated-figure]').textContent;
    for (const bin of BINS) {
      if (!text.includes(String(bin.value)) || !text.includes(bin.label)) {
        throw new Error(`Every bin must show its label and value as text (missing ${bin.label}).`);
      }
    }

    // 주장형 제목, 명사형 종결.
    const title = canvasElement.querySelector('[data-assembly-title]');
    if (!title?.textContent.includes('4–6분') || /다[.!]?$/.test(title.textContent.trim())) {
      throw new Error('The assembly must open with a noun-final claim.');
    }
  },
};
