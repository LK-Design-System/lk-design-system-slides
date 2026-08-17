import React from 'react';
import { QuadrantSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Quadrant Slide',
  component: QuadrantSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '2×2 행렬 — 우선순위 매트릭스. 표(CompareSlide)로 대체되지 않는 이유는 **자리가 곧 주장**이기 때문입니다: "효과는 크고 비용은 작다"는 두 연속선 위의 상대 위치에 대한 논증이고, 셀에 "높음/낮음"을 적으면 연속선이 라벨로 주저앉습니다. 그래서 항목은 사분면 이름이 아니라 좌표(0–1)로 놓습니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Quadrant Slide',
  render: () => (
    <QuadrantSlide
      eyebrow="선별"
      title="다음 분기 후보 배치"
      governing="PDF 내보내기와 다크 표면이 비용 대비 효과가 가장 큽니다."
      xAxis={{ name: '구현 비용', low: '작다', high: '크다' }}
      yAxis={{ name: '덱 저작에 주는 효과', low: '작다', high: '크다' }}
      quadrants={[
        { label: '먼저 한다' },
        { label: '계획해서 한다' },
        { label: '틈에 한다' },
        { label: '하지 않는다' },
      ]}
      items={[
        { id: 'pdf', label: 'PDF 내보내기', x: 0.28, y: 0.86, emphasis: true },
        { id: 'dark', label: '다크 표면', x: 0.34, y: 0.62 },
        { id: 'trend', label: '시계열 조립', x: 0.52, y: 0.72 },
        { id: 'pptx', label: 'PPTX 내보내기', x: 0.88, y: 0.34 },
        { id: 'draw', label: '판서', x: 0.74, y: 0.12 },
      ]}
      source="출처: COMPLETENESS_AUDIT, 2026-08"
      foot="LDS 플랫폼 · 2026 Q3"
    />
  ),
  play: async ({ canvasElement }) => {
    const plot = canvasElement.querySelector('[data-quadrant-plot]');
    if (!plot) throw new Error('QuadrantSlide must render a plot.');
    const box = plot.getBoundingClientRect();
    const items = [...canvasElement.querySelectorAll('[data-quadrant-item]')];
    if (items.length !== 5) throw new Error(`Expected 5 placed items, got ${items.length}.`);

    // Nothing lands outside the plot: the layout clamps coordinates, because an
    // item drawn past the axes is a claim about a position that does not exist.
    for (const item of items) {
      const rect = item.getBoundingClientRect();
      const centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;
      if (centreX < box.left - 1 || centreX > box.right + 1 || centreY < box.top - 1 || centreY > box.bottom + 1) {
        throw new Error(`"${item.textContent}" sits outside the plot.`);
      }
    }

    // y grows upward. This is the one thing a reader cannot check and a
    // coordinate bug cannot be seen in: the highest-value item must be highest.
    const byTop = [...items].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    if (byTop[0].textContent.trim() !== 'PDF 내보내기') {
      throw new Error(`y=0.86 must render highest; "${byTop[0].textContent}" did.`);
    }

    // Emphasis budget: one item, enforced in code.
    if (canvasElement.querySelectorAll('[data-item-emphasis="true"]').length !== 1) {
      throw new Error('At most one item carries emphasis.');
    }

    // Both axes state their direction in words — an arrow alone says nothing.
    for (const axis of ['[data-quadrant-x-axis]', '[data-quadrant-y-axis]']) {
      const text = canvasElement.querySelector(axis).textContent;
      if (!text.includes('작다') || !text.includes('크다')) {
        throw new Error(`${axis} must name both poles, not just the axis.`);
      }
    }

    // THE PLOT CLEARS THE CHROME. This layout is the only one that fills its
    // region, which makes it the only one that can collide with the
    // out-of-flow source line — and it did, x-axis rail and source printed on
    // top of each other (user-caught). Asserted here rather than left to the
    // deck gate, because the deck gate only sees decks that happen to use it.
    const source = canvasElement.querySelector('[data-slide-source]');
    const xAxis = canvasElement.querySelector('[data-quadrant-x-axis]');
    if (source && xAxis && xAxis.getBoundingClientRect().bottom > source.getBoundingClientRect().top) {
      throw new Error('The x-axis rail must clear the source line — the chrome band is out of flow, so a filling layout has to reserve it.');
    }

    // NO ROTATED TYPE, here either. The y-axis name reads horizontally above
    // the plot: Korean in vertical writing-mode stacks one block per line and
    // collided with the pole labels.
    const rotated = [...canvasElement.querySelectorAll('[data-slide-quadrant] *')].filter((node) => {
      const computed = getComputedStyle(node);
      return computed.writingMode !== 'horizontal-tb' || /rotate/.test(computed.transform ?? '');
    });
    if (rotated.length > 0) {
      throw new Error(`${rotated.length} element(s) set sideways type — the axis name reads horizontally.`);
    }
  },
};

export const MissingCoordinates = {
  name: 'Missing Coordinates',
  render: () => (
    <QuadrantSlide
      title="좌표 없는 항목은 신고된다"
      governing="놓을 자리를 모르는 항목은 원점에 떨어지지 않고 이름이 불립니다."
      xAxis={{ name: '비용' }}
      yAxis={{ name: '효과' }}
      items={[
        { id: 'ok', label: '좌표 있음', x: 0.7, y: 0.7 },
        { id: 'ghost', label: '좌표 없음' },
      ]}
      foot="LDS 플랫폼 · 2026 Q3"
    />
  ),
  play: async ({ canvasElement }) => {
    // Silently dropping it at the origin would be the layout inventing a claim.
    const notice = canvasElement.querySelector('[data-quadrant-unplaced]');
    if (!notice || !notice.textContent.includes('좌표 없음')) {
      throw new Error('An item without coordinates must be named on the canvas, not placed by guesswork.');
    }
    if (canvasElement.querySelectorAll('[data-quadrant-item]').length !== 1) {
      throw new Error('Only the item with coordinates is plotted.');
    }
  },
};
