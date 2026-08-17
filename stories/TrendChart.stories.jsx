import React from 'react';
import { TrendChart, FigureSlide } from '../src/index.js';

const meta = {
  title: 'Editorial/Trend Chart',
  component: TrendChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '추이를 읽는 거리에서 그립니다. 차트 자체는 Core의 LineChart이고, 이 층이 소유하는 것은 두 가지입니다 — 축 활자를 매체의 램프로 재지정하는 것(`--lk-chart-*`), 그리고 **viewBox를 부여된 폭에 맞추는 것**. 반응형 SVG는 폭을 채울 때 배치가 아니라 배율을 채우므로, 재보지 않으면 축 글자가 슬라이드의 주장보다 커집니다.',
      },
    },
  },
};

export default meta;

const WEEKS = [22, 23, 24, 25, 26, 27, 28, 29];
const P95 = [41, 39, 40, 34, 31, 22, 20, 18];
const SERIES = [
  {
    id: 'p95',
    name: '수집–반영 p95',
    accessibleLabel: '수집에서 반영까지 걸린 시간의 95분위',
    points: WEEKS.map((week, index) => ({ x: week, y: P95[index] })),
  },
];

export const Default = {
  name: 'Trend Chart',
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <TrendChart
        series={SERIES}
        yDomain={[0, 45]}
        yTicks={3}
        formatY={(value) => `${Math.round(value)}분`}
        xTicks={[22, 25, 29]}
        referenceLines={[{ y: 20, label: '목표 20분' }]}
        description="수집에서 반영까지의 p95 지연이 6월 이후 절반으로 내려온 추이."
        showLegend={false}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('[data-lds-trend-chart]');
    if (!host) throw new Error('TrendChart must render.');
    const waitFor = async (predicate, timeoutMs = 2000) => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        if (predicate()) return true;
        await new Promise((resolve) => { setTimeout(resolve, 25); });
      }
      return predicate();
    };
    await waitFor(() => host.querySelector('svg[data-chart-type="line"]') !== null);
    const svg = host.querySelector('svg[data-chart-type="line"]');

    // ONE DESIGN PIXEL, ONE CHART PIXEL. The viewBox must equal the box the
    // chart was granted, or the responsive SVG magnifies everything inside it.
    const [, , viewWidth] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
    const painted = svg.getBoundingClientRect().width;
    if (Math.abs(viewWidth - painted) > 1.5) {
      throw new Error(
        `The chart is drawn at ${painted}px from a ${viewWidth}px viewBox — a responsive SVG `
        + 'fills width by magnifying, so the axis type would outgrow the ramp.',
      );
    }

    // The axis rides the medium's ramp, not the product's 10px literal.
    const tick = svg.querySelector('text');
    const probe = document.createElement('span');
    probe.style.fontSize = 'var(--editorial-caption-size)';
    host.append(probe);
    const captionSize = Number.parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    const tickSize = Number.parseFloat(getComputedStyle(tick).fontSize);
    if (Math.abs(tickSize - captionSize) > 0.5) {
      throw new Error(
        `Axis ticks render at ${tickSize}px, not the medium's caption rank (${captionSize}px) — `
        + 'the --lk-chart-* re-point did not reach them.',
      );
    }
    if (tickSize <= 10) {
      throw new Error('The re-point must actually move the size off the 10px product literal.');
    }

    // NO ROTATED TYPE. Upstream draws a `yLabel` sideways in a gutter sized for
    // 10px ticks; at editorial rank it collided with the tick values. This
    // layer swallows the prop, and the assertion is what keeps it swallowed —
    // the unit belongs in the tick format or the caption.
    const rotated = [...svg.querySelectorAll('text')].filter((node) => (node.getAttribute('transform') ?? '').includes('rotate'));
    if (rotated.length > 0) {
      throw new Error(`${rotated.length} chart label(s) are rotated — sideways type is a product-screen idiom, not a projected one.`);
    }
  },
};

export const OnASlide = {
  name: 'On a Slide',
  render: () => (
    <FigureSlide
      eyebrow="지연 추이"
      title="수집–반영 p95 지연"
      governing="셰도우 전환 이후 지연이 절반으로 내려와 목표선 안에 들어왔습니다."
      annotations={[{ id: 'method', title: '동일 계측 기준', body: '집계 방식 변경 없음' }]}
      caption="주간 p95 지연(분), 22–29주차 (데모 데이터)"
      source="출처: 파이프라인 텔레메트리, 2026-07 집계"
      foot="플랫폼팀 · 2026 3분기"
    >
      <TrendChart
        series={SERIES}
        xTicks={[22, 25, 29]}
        yDomain={[0, 45]}
        yTicks={3}
        formatY={(value) => `${Math.round(value)}분`}
        referenceLines={[{ y: 20, label: '목표 20분' }]}
        showLegend={false}
      />
    </FigureSlide>
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    if (!surface) throw new Error('The chart must compose into a FigureSlide.');
    const waitFor = async (predicate, timeoutMs = 2500) => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        if (predicate()) return true;
        await new Promise((resolve) => { setTimeout(resolve, 25); });
      }
      return predicate();
    };
    await waitFor(() => surface.querySelector('svg[data-chart-type="line"]') !== null);
    const svg = surface.querySelector('svg[data-chart-type="line"]');
    const body = surface.querySelector('[data-annotated-figure-body]');

    // The exhibit fills its region — the horizontal rule check:figure-fill
    // measures on every deck.
    const fill = svg.getBoundingClientRect().width / body.getBoundingClientRect().width;
    if (fill < 0.9) {
      throw new Error(`The chart draws only ${Math.round(fill * 100)}% of the region it was granted.`);
    }
  },
};
