import React from 'react';
import { LineChart } from '@lk-design-system/lds-product';
import { AnnotatedFigure } from '../src/index.js';

// Correlation is an assembly category. Product has no scatterplot yet, and the
// FT "line + column on two axes" pattern is banned by the Urban dual-axis rule
// — so two measures share one x-axis as small multiples, each with its own
// honest y-axis, instead of one chart with two.
const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const THROUGHPUT = [812, 798, 805, 840, 833, 905, 918, 1024, 1041];
const BATTERY = [18, 17, 18, 19, 19, 22, 23, 26, 27];

const meta = {
  title: 'Assembly/Correlation',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Correlation은 조립 카테고리입니다. 이중 축 차트 대신 x축을 공유하는 스몰 멀티플로 조립하며, play 단언이 차트 분리와 영 기준선을 강제합니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Correlation',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 820 }}>
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
        처리량 상승 구간에서 배터리 소모 동반 증가
      </h3>
      <AnnotatedFigure
        caption="출처: 운영 텔레메트리 주간 집계, 2026-05~07 · 이중 축 대신 x축을 공유하는 스몰 멀티플"
        annotations={[
          { id: 'rise', title: '6주차 이후 동반 상승', body: '처리량 +18%, 소모율 +5%p — 증차 없이 가동률로 흡수한 구간', emphasis: true },
          { id: 'axes', title: '축은 각자 정직하게', body: '두 단위를 한 축에 겹치지 않고 차트를 나눔 · 추세 축은 0 강제 없이 데이터 범위에 맞춤' },
        ]}
      >
        <div data-small-multiples style={{ display: 'grid', gap: 'var(--space-4)', minWidth: 0 }}>
          {/* 추세(위치 부호화)를 말하는 선 차트라 0 강제 없이 축을 데이터에 맞춘다 —
              단, 선이 프레임에 닿지 않게 라운드 눈금으로 위아래 여유를 둔다.
              EDITORIAL_METHODOLOGY 절차 5(상류 lk-design-system docs/EDITORIAL_METHODOLOGY.md).
              0 시작은 길이·면적 부호화(막대·픽토그램)의 규칙이다. */}
          <LineChart
            aria-label="주간 처리량"
            width={420}
            height={150}
            yDomain={[750, 1050]}
            yTicks={3}
            xTicks={WEEKS}
            yLabel="건"
            series={[{ name: '주간 처리량', points: WEEKS.map((week, index) => ({ x: week, y: THROUGHPUT[index] })) }]}
          />
          <LineChart
            aria-label="주간 평균 배터리 소모율"
            width={420}
            height={150}
            yDomain={[15, 30]}
            yTicks={3}
            xTicks={WEEKS}
            yLabel="%"
            series={[{ name: '배터리 소모율', points: WEEKS.map((week, index) => ({ x: week, y: BATTERY[index] })) }]}
          />
        </div>
      </AnnotatedFigure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Urban 규칙 — 이중 축 금지: 한 차트에 두 y축이 아니라, 차트 두 개.
    const multiples = canvasElement.querySelector('[data-small-multiples]');
    const charts = multiples.querySelectorAll('svg');
    if (charts.length !== 2) {
      throw new Error(`Two measures must be two charts sharing an x-axis, never one dual-axis chart (got ${charts.length} svg).`);
    }

    // 추세 축은 0 강제가 아니다 — 축을 데이터 범위에 맞추되 눈금은 명시하고,
    // 선이 프레임에 닿지 않게 데이터 위아래로 여유를 둔다.
    const series = [THROUGHPUT, BATTERY];
    charts.forEach((chart, index) => {
      const ticks = Array.from(chart.querySelectorAll('text'))
        .map((node) => Number(node.textContent.trim().replace(/,/g, '')))
        .filter((value) => Number.isFinite(value) && value >= 10); // x축 주차(1–9) 제외
      if (ticks.length < 3) {
        throw new Error('A fitted trend axis must still declare its tick labels.');
      }
      if (Math.min(...ticks) <= 0) {
        throw new Error('A trend axis fitted to the data must not be padded down to zero.');
      }
      const dataMin = Math.min(...series[index]);
      const dataMax = Math.max(...series[index]);
      if (Math.min(...ticks) >= dataMin || Math.max(...ticks) <= dataMax) {
        throw new Error('A fitted axis must keep headroom — the line may not touch the frame.');
      }
    });

    // 주장형 제목, 명사형 종결.
    const title = canvasElement.querySelector('[data-assembly-title]');
    if (!title?.textContent.includes('동반') || /다[.!]?$/.test(title.textContent.trim())) {
      throw new Error('The assembly must open with a noun-final claim.');
    }

    // 강조는 하나.
    if (canvasElement.querySelectorAll('[data-annotation-emphasis="true"]').length !== 1) {
      throw new Error('Exactly one annotation may carry emphasis.');
    }
  },
};
