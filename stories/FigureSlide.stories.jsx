import React from 'react';
import { FigureSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Figure Slide',
  component: FigureSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '도판 슬라이드입니다. 헤더 계약은 ContentSlide에서, 주석 규약은 Editorial AnnotatedFigure에서 오고, 슬라이드는 배치와 출처, 강조 예산 정산만 소유합니다. 도판은 슬라이드당 하나 — 두 번째 차트는 두 번째 슬라이드입니다.',
      },
    },
  },
};

export default meta;

const DemoChart = () => (
  <svg
    viewBox="-6 0 332 120"
    role="img"
    aria-label="주간 처리 지연 추이 데모 차트"
    style={{ width: 420, display: 'block' }}
  >
    <polyline
      points="0,30 40,34 80,32 120,44 160,48 200,72 240,78 280,88 320,92"
      fill="none"
      stroke="var(--editorial-emphasis)"
      strokeWidth="2.5"
    />
    <circle data-annotation-anchor="streaming-cutover" cx="200" cy="72" r="4" fill="var(--editorial-emphasis)" />
    <line x1="0" y1="110" x2="320" y2="110" stroke="var(--color-semantic-line-solid-normal)" />
  </svg>
);

export const Default = {
  name: 'Figure Slide',
  render: () => (
    <FigureSlide
      preset="briefing"
      eyebrow="파이프라인 성능"
      title="수집–반영 지연 추이"
      governing="스트리밍 전환 이후 지연이 절반으로 내려와 목표선 안에 들어왔습니다."
      caption="주간 p95 지연, 6월–7월 (데모 데이터)"
      source="출처: 파이프라인 텔레메트리, 2026-07 집계"
      annotations={[
        {
          id: 'cutover',
          anchor: 'streaming-cutover',
          title: '스트리밍 전환',
          body: '6주차, 지연 민감 테이블 이관',
          emphasis: true,
        },
        { id: 'method', title: '동일 계측 기준', body: '집계 방식 변경 없음' },
      ]}
    >
      <DemoChart />
    </FigureSlide>
  ),
  play: async ({ canvasElement }) => {
    const slide = canvasElement.querySelector('[data-lds-figure-slide]');
    const figure = canvasElement.querySelector('[data-lds-annotated-figure]');
    if (!slide || !figure) throw new Error('FigureSlide must place one Editorial AnnotatedFigure.');
    if (canvasElement.querySelectorAll('[data-lds-annotated-figure]').length !== 1) {
      throw new Error('One exhibit per figure slide — a second chart is a second slide.');
    }
    if (!canvasElement.querySelector('[data-slide-governing]')) {
      throw new Error("ContentSlide's header contract must flow through FigureSlide.");
    }
    // 강조 예산: 주석이 강조를 썼으면 악센트 eyebrow는 내려간다.
    if (slide.getAttribute('data-emphasis-spent') !== 'annotation') {
      throw new Error('An emphasized annotation must be settled as the slide-level emphasis spend.');
    }
    if (canvasElement.querySelector('[data-slide-eyebrow]')) {
      throw new Error('When an annotation spends emphasis, the accented eyebrow must be dropped.');
    }
    // 주석 규약은 Editorial 것이 그대로 산다 — 앵커 연결을 대기 후 확인.
    const waitFor = async (predicate, timeoutMs = 2000) => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        if (predicate()) return true;
        await new Promise((resolve) => { setTimeout(resolve, 25); });
      }
      return predicate();
    };
    const linked = await waitFor(
      () => figure.querySelectorAll('[data-annotation-anchor-status="linked"]').length === 1
    );
    if (!linked) throw new Error("Editorial's anchor contract must survive being placed on a slide.");
    const source = canvasElement.querySelector('[data-figure-slide-source]');
    const fineSize = parseFloat(
      getComputedStyle(slide).getPropertyValue('--slides-fine-size')
    );
    if (!source || parseFloat(getComputedStyle(source).fontSize) !== fineSize) {
      throw new Error('The source line reads at the fine floor — provenance, not content.');
    }
  },
};
