import React from 'react';
import { SplitSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Split Slide',
  component: SplitSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '2분할 콘텐츠 레이아웃입니다. ContentSlide의 헤더 계약(eyebrow·제목·거버닝)을 그대로 상속하고, 콘텐츠 영역의 분할 지오메트리(비율 어휘 1:1·2:1·1:2, 거터)만 추가로 소유합니다. 패널 내용은 덱의 몫입니다.',
      },
    },
  },
};

export default meta;

export const Comparison = {
  name: 'Split Slide',
  render: () => (
    <SplitSlide
      preset="briefing"
      eyebrow="아키텍처 검토"
      title="수집 파이프라인 개편안"
      governing="스트리밍 전환은 지연을 절반으로 줄이지만, 운영 비용은 배치 유지가 유리합니다."
      ratio="2:1"
      left={
        <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
          <li>스트리밍: 수집–반영 지연 41분 → 18분.</li>
          <li>배치 유지: 월 운영 비용 32% 절감.</li>
        </ul>
      }
      right={<p style={{ margin: 0 }}>권고: 지연 민감 테이블만 스트리밍으로 이관.</p>}
    />
  ),
  play: async ({ canvasElement }) => {
    const split = canvasElement.querySelector('[data-slide-split]');
    const panes = canvasElement.querySelectorAll('[data-slide-pane]');
    if (!split || panes.length !== 2) {
      throw new Error('SplitSlide must render exactly two panes inside the split region.');
    }
    const governing = canvasElement.querySelector('[data-slide-governing]');
    if (!governing) {
      throw new Error("ContentSlide's header contract (governing included) must flow through SplitSlide.");
    }
    if (!(governing.compareDocumentPosition(split) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      throw new Error('The split region substantiates the governing message, so it must follow it.');
    }
    const [left, right] = panes;
    const observed = left.getBoundingClientRect().width / right.getBoundingClientRect().width;
    if (Math.abs(observed - 2) > 0.2) {
      throw new Error(`ratio="2:1" must yield a ~2:1 pane split (got ${observed.toFixed(2)}:1).`);
    }
    const surface = canvasElement.querySelector('[data-lds-split-slide]');
    if (surface.getAttribute('data-slide-ratio') !== '2:1') {
      throw new Error('The surface must expose the ratio vocabulary for audit (data-slide-ratio).');
    }
  },
};
