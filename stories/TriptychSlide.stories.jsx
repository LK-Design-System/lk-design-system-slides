import React from 'react';
import { TriptychSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Triptych Slide',
  component: TriptychSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '레이블이 붙은 세 패널 — 문제/원인/대책, 과거/현재/계획. SplitSlide에 세 번째 칸을 넣지 않은 이유는 SplitSlide 자신의 논거입니다: 두 칸을 넘으면 비교가 아니라 그리드가 된다. 그 논거는 맞고, 이 레이아웃은 그것을 **레이블로** 답합니다 — 레이블 없는 세 열은 그리지 않은 표이고, 레이블 붙은 세 패널은 방이 이름을 부를 수 있는 구조입니다. 폭은 항상 균등: 한 패널이 더 중요하면 그것은 강조이지 칸 너비가 아닙니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Triptych Slide',
  render: () => (
    <TriptychSlide
      eyebrow="진단"
      title="지연의 세 갈래"
      governing="병목은 수집이 아니라 반영 단계의 배치 대기입니다."
      panels={[
        { id: 'collect', label: '수집', body: '주문·텔레메트리 5종. p95 2분 이내로 안정.' },
        { id: 'batch', label: '반영 (배치 대기)', body: '15분 주기 배치가 지연의 대부분을 만든다.', emphasis: true },
        { id: 'serve', label: '조회', body: '캐시 적중률 99.7%. 여기서 잃는 시간은 없다.' },
      ]}
      foot="플랫폼팀 · 2026 3분기"
    />
  ),
  play: async ({ canvasElement }) => {
    const panels = [...canvasElement.querySelectorAll('[data-slide-panel]')];
    if (panels.length !== 3) throw new Error(`A triptych has three panels, got ${panels.length}.`);

    // Equal widths, always: a skewed triptych says "one of these matters more"
    // with geometry, which is the emphasis's job.
    const widths = panels.map((panel) => Math.round(panel.getBoundingClientRect().width));
    if (Math.max(...widths) - Math.min(...widths) > 1) {
      throw new Error(`Panels must be equal width, measured ${widths.join(' / ')}.`);
    }

    // Every panel carries a label — the property that keeps this from being a
    // grid, so it is the property worth asserting.
    for (const panel of panels) {
      const label = panel.querySelector('[data-panel-label]');
      if (!label || !label.textContent.trim()) {
        throw new Error('Every panel is labelled; an unlabelled column is an undrawn table.');
      }
    }

    if (canvasElement.querySelectorAll('[data-panel-emphasis="true"]').length !== 1) {
      throw new Error('At most one panel carries emphasis.');
    }
  },
};

export const MissingLabel = {
  name: 'Missing Label',
  render: () => (
    <TriptychSlide
      title="레이블 없는 패널은 표시된다"
      governing="레이블이 이 레이아웃을 그리드와 가르는 유일한 성질입니다."
      panels={[
        { id: 'a', label: '있음', body: '정상.' },
        { id: 'b', body: '레이블이 없다.' },
        { id: 'c', label: '있음', body: '정상.' },
      ]}
      foot="LDS 플랫폼 · 2026 Q3"
    />
  ),
  play: async ({ canvasElement }) => {
    const labels = [...canvasElement.querySelectorAll('[data-panel-label]')].map((node) => node.textContent.trim());
    if (!labels.includes('레이블 없음')) {
      throw new Error('A panel without a label must say so on the canvas rather than render anonymous.');
    }
  },
};
