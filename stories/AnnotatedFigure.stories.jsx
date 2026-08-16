import React from 'react';
import { AnnotatedFigure } from '../src/index.js';

const meta = {
  title: 'Editorial/Annotated Figure',
  component: AnnotatedFigure,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '차트·이미지 같은 도판 옆에 주석을 붙이는 계약입니다. 앵커형 주석은 데이터 요소와 연결되어 재배열을 따라가고, 깨진 앵커는 숨기지 않고 표시하며, 강조는 코드가 하나로 강제합니다.',
      },
    },
  },
};

export default meta;

const DemoChart = () => (
  <svg viewBox="-6 0 332 120" role="img" aria-label="주간 처리량 추이 데모 차트" style={{ width: 360, display: 'block' }}>
    <polyline
      points="0,90 40,84 80,88 120,70 160,74 200,52 240,58 280,30 320,26"
      fill="none"
      stroke="var(--editorial-emphasis)"
      strokeWidth="2.5"
    />
    <circle data-annotation-anchor="deploy-week" cx="200" cy="52" r="4" fill="var(--editorial-emphasis)" />
    <circle data-annotation-anchor="peak-week" cx="320" cy="26" r="4" fill="var(--editorial-emphasis)" />
    <line x1="0" y1="110" x2="320" y2="110" stroke="var(--color-semantic-line-solid-normal)" />
  </svg>
);

export const Default = {
  name: 'Annotated Figure',
  render: () => (
    <AnnotatedFigure
      caption="주간 처리량 추이 (데모 데이터)"
      annotations={[
        { id: 'deploy', anchor: 'deploy-week', title: '신규 라우팅 배포', body: '6주차 경로 재계획 로직 교체', emphasis: true },
        { id: 'peak', anchor: 'peak-week', title: '최고 처리량', body: '8주차, 이전 최고 대비 +18%', emphasis: true },
        { id: 'note', title: '계측 변경 없음', body: '동일 계측 기준 유지' },
      ]}
      style={{ maxWidth: 640 }}
    >
      <DemoChart />
    </AnnotatedFigure>
  ),
  play: async ({ canvasElement }) => {
    const figure = canvasElement.querySelector('[data-lds-annotated-figure]');
    if (!figure) throw new Error('AnnotatedFigure must render.');
    const annotations = figure.querySelectorAll('[data-annotation]');
    if (annotations.length !== 3) throw new Error('All annotations must render beside the figure.');

    // 강조는 하나 — 두 주석이 요청해도 첫 번째만 승인된다.
    const emphasized = figure.querySelectorAll('[data-annotation-emphasis="true"]');
    if (emphasized.length !== 1 || !annotations[0].hasAttribute('data-annotation-emphasis')) {
      throw new Error('Two annotations requested emphasis; the first must win.');
    }

    // 앵커형/맥락형 구분 — 앵커를 가진 둘은 anchored, 나머지는 context.
    if (
      figure.querySelectorAll('[data-annotation-kind="anchored"]').length !== 2 ||
      figure.querySelectorAll('[data-annotation-kind="context"]').length !== 1
    ) {
      throw new Error('Annotations must be classified as anchored or context by their anchor.');
    }

    // 앵커는 실제 데이터 요소와 연결된다 (effect 이후 — 상태가 붙을 때까지 폴링).
    const waitFor = async (predicate, timeoutMs = 2000) => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        if (predicate()) return true;
        await new Promise((resolve) => { setTimeout(resolve, 25); });
      }
      return predicate();
    };
    await waitFor(() => figure.querySelectorAll('[data-annotation-anchor-status]').length === 2);
    const linked = figure.querySelectorAll('[data-annotation-anchor-status="linked"]');
    if (linked.length !== 2) throw new Error('Both anchored annotations must link to their data elements.');
    const target = figure.querySelector('[data-annotation-anchor="deploy-week"]');
    const details = target?.getAttribute('aria-details');
    if (!details || document.getElementById(details)?.getAttribute('data-annotation-kind') !== 'anchored') {
      throw new Error('An anchored data element must reference its note via aria-details.');
    }

    // 주석은 도판 옆에 선다.
    const body = figure.querySelector('[data-annotated-figure-body]');
    const notes = figure.querySelector('[data-annotated-figure-notes]');
    if (!(body.compareDocumentPosition(notes) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      throw new Error('Annotations must follow the figure in reading order, beside the data.');
    }

    // 지오메트리는 도판(body) 폭의 비율 + 가독성 하한이다. 이 도판(360px)의
    // 32%는 115px로 하한(200px)보다 좁으므로, 하한으로 올려 옆에 세운다.
    const notesWidth = notes.getBoundingClientRect().width;
    const bodyWidth = body.getBoundingClientRect().width;
    const expected = Math.max(Math.round(bodyWidth * 0.32), 200);
    if (figure.getAttribute('data-annotation-layout') !== 'side' || Math.abs(notesWidth - expected) > 4) {
      throw new Error(`Annotation width must be the body ratio clamped to the floor (expected ~${expected}px, got ${Math.round(notesWidth)}px).`);
    }

    // 주석은 도판에 붙지 않는다 — 간격도 비율 기반이되 16px 하한을 가진다.
    const gap = notes.getBoundingClientRect().left - body.getBoundingClientRect().right;
    if (gap < 14) {
      throw new Error(`Notes must keep a visible offset from the figure (got ${Math.round(gap)}px).`);
    }
  },
};

export const NarrowFigure = {
  name: 'Narrow Figure',
  render: () => (
    <AnnotatedFigure
      caption="좁은 도판은 주석을 아래로 내린다"
      annotations={[{ id: 'note', title: '스택 폴백', body: '하한보다 좁은 도판 옆에 주석을 세우면 글이 조각난다' }]}
    >
      <svg viewBox="0 0 120 120" role="img" aria-label="좁은 데모 도판" style={{ width: 140, display: 'block' }}>
        <circle cx="60" cy="60" r="44" fill="none" stroke="var(--editorial-emphasis)" strokeWidth="16" />
      </svg>
    </AnnotatedFigure>
  ),
  play: async ({ canvasElement }) => {
    // 하한(200px)보다 좁은 도판(140px)은 주석을 옆이 아니라 아래에 쌓는다.
    const figure = canvasElement.querySelector('[data-lds-annotated-figure]');
    const start = Date.now();
    while (figure.getAttribute('data-annotation-layout') !== 'stacked' && Date.now() - start < 2000) {
      await new Promise((resolve) => { setTimeout(resolve, 25); });
    }
    if (figure.getAttribute('data-annotation-layout') !== 'stacked') {
      throw new Error('A figure narrower than the readability floor must stack its notes underneath.');
    }
    const body = figure.querySelector('[data-annotated-figure-body]').getBoundingClientRect();
    const notes = figure.querySelector('[data-annotated-figure-notes]').getBoundingClientRect();
    if (notes.top < body.bottom - 1) {
      throw new Error('Stacked notes must sit below the figure, not beside it.');
    }
  },
};

export const MissingAnchor = {
  name: 'Missing Anchor',
  render: () => (
    <AnnotatedFigure
      annotations={[{ id: 'ghost', anchor: 'no-such-element', title: '유령 주석', body: '대상 없는 앵커 주장' }]}
      style={{ maxWidth: 640 }}
    >
      <DemoChart />
    </AnnotatedFigure>
  ),
  play: async ({ canvasElement }) => {
    // 깨진 앵커는 숨기지 않고 표시한다 (effect가 상태를 붙일 때까지 폴링).
    const figure = canvasElement.querySelector('[data-lds-annotated-figure]');
    const start = Date.now();
    while (!figure.querySelector('[data-annotation-anchor-status]') && Date.now() - start < 2000) {
      await new Promise((resolve) => { setTimeout(resolve, 25); });
    }
    const missing = figure.querySelector('[data-annotation-anchor-status="missing"]');
    if (!missing) throw new Error('A claimed anchor that matches nothing must be reported as missing.');
    if (!missing.querySelector('[data-annotation-anchor-warning]')?.textContent.includes('앵커 미확인')) {
      throw new Error('The broken anchor must be visibly declared, never silently dropped.');
    }
  },
};
