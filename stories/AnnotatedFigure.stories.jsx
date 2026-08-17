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
          '도판 주석의 계약입니다. 앵커형 주석은 캔버스 위 데이터 지점 곁에 콜아웃으로 앉아 지시선으로 이어지고("주석은 액션이 있는 곳에"), 맥락형 주석은 옆 레일에 조용히 섭니다. 깨진 앵커는 숨기지 않고 표시하며, 강조는 코드가 하나로 강제합니다.',
      },
    },
  },
};

export default meta;

const DemoChart = () => (
  <svg viewBox="-6 0 332 120" role="img" aria-label="주간 처리량 추이 데모 차트" style={{ width: '100%', display: 'block' }}>
    <polyline
      points="0,90 40,84 80,88 120,70 160,74 200,52 240,58 280,30 320,26"
      fill="none"
      stroke="var(--editorial-emphasis)"
      strokeWidth="2.5"
    />
    <circle data-annotation-anchor="deploy-week" cx="200" cy="52" r="4" fill="var(--editorial-emphasis)" />
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
        { id: 'note', title: '계측 변경 없음', body: '동일 계측 기준 유지', emphasis: true },
      ]}
      style={{ maxWidth: 760 }}
    >
      <DemoChart />
    </AnnotatedFigure>
  ),
  play: async ({ canvasElement }) => {
    const figure = canvasElement.querySelector('[data-lds-annotated-figure]');
    if (!figure) throw new Error('AnnotatedFigure must render.');
    const waitFor = async (predicate, timeoutMs = 2000) => {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        if (predicate()) return true;
        await new Promise((resolve) => { setTimeout(resolve, 25); });
      }
      return predicate();
    };

    // 앵커형 주석은 캔버스 위 콜아웃이다 — 도판 body 사각형 안에 앉는다.
    await waitFor(() => figure.querySelector('[data-annotation-kind="anchored"]') !== null);
    const body = figure.querySelector('[data-annotated-figure-body]');
    const callout = figure.querySelector('[data-annotation-kind="anchored"]');
    if (!body.contains(callout)) {
      throw new Error('An anchored annotation is a callout ON the canvas, not a rail card.');
    }
    const bodyRect = body.getBoundingClientRect();
    const calloutRect = callout.getBoundingClientRect();
    if (calloutRect.left < bodyRect.left - 1 || calloutRect.right > bodyRect.right + 1) {
      throw new Error('The callout must stay inside the figure canvas.');
    }

    // 콜아웃은 앵커의 위나 아래로 비켜 앉는다. 옆에 앉으면 차트가 좌우로
    // 흐르는 탓에 곧 데이터 위다 — 첫 판이 실제로 곡선을 관통했다.
    const anchorEl = figure.querySelector('[data-annotation-anchor="deploy-week"]');
    const anchorRect = anchorEl.getBoundingClientRect();
    const anchorY = anchorRect.top + anchorRect.height / 2;
    if (calloutRect.top <= anchorY && calloutRect.bottom >= anchorY) {
      throw new Error('A callout escapes above or below its anchor — beside it is on the data.');
    }

    // 지시선 + 앵커 점이 콜아웃과 지점을 잇는다 — 독자가 찾게 하지 않는다.
    const leaders = figure.querySelector('[data-annotation-leaders]');
    if (!leaders || leaders.querySelectorAll('line').length !== 1 || leaders.querySelectorAll('circle').length !== 1) {
      throw new Error('Each callout ties to its point with one leader line and one anchor dot.');
    }

    // 맥락형 주석(앵커 없음)은 레일에 남는다.
    const rail = figure.querySelector('[data-annotated-figure-notes]');
    if (!rail || rail.querySelectorAll('[data-annotation-kind="context"]').length !== 1) {
      throw new Error('A context annotation has no point to sit beside — it keeps the rail.');
    }

    // 강조 예산: 둘이 요청해도 첫째(콜아웃)만 승인된다.
    const emphasized = figure.querySelectorAll('[data-annotation-emphasis="true"]');
    if (emphasized.length !== 1 || emphasized[0] !== callout) {
      throw new Error('Two annotations requested emphasis; the first must win.');
    }

    // 접근성 링크는 유지된다.
    const target = figure.querySelector('[data-annotation-anchor="deploy-week"]');
    const details = target?.getAttribute('aria-details');
    if (!details || document.getElementById(details) !== callout) {
      throw new Error('An anchored data element must reference its callout via aria-details.');
    }

    // 주석은 본문보다 조용하다: 리드가 note-body 랭크로 내려갔고, 2층 위계는
    // 크기가 아니라 무게가 나른다.
    const lead = rail.querySelector('p');
    const probe = document.createElement('span');
    probe.style.fontSize = 'var(--editorial-note-body-size)';
    figure.append(probe);
    const noteBodySize = Number.parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    if (Number.parseFloat(getComputedStyle(lead).fontSize) !== noteBodySize) {
      throw new Error('The annotation lead rides note-body rank — an annotation stays quieter than the prose it serves.');
    }
    if (Number.parseInt(getComputedStyle(lead).fontWeight, 10) < 600) {
      throw new Error('With one size across the annotation, weight must carry the two-level hierarchy.');
    }
    // 카드 장식(인용구식 세로줄)은 폐기됐다 — 간격이 구분자다.
    const railItem = rail.querySelector('[data-annotation]');
    if (getComputedStyle(railItem).borderLeftWidth !== '0px') {
      throw new Error('Rail notes carry no card chrome — spacing separates them, not a quote bar.');
    }
  },
};

export const NarrowFigure = {
  name: 'Narrow Figure',
  render: () => (
    <div style={{ width: 300 }}>
      <AnnotatedFigure
        caption="좁은 컨테이너는 레일을 아래로 내린다"
        annotations={[{ id: 'note', title: '랩 폴백', body: '레일이 설 자리가 없으면 옆이 아니라 아래로 흐른다' }]}
      >
        <svg viewBox="0 0 120 120" role="img" aria-label="좁은 데모 도판" style={{ width: 140, display: 'block' }}>
          <circle cx="60" cy="60" r="44" fill="none" stroke="var(--editorial-emphasis)" strokeWidth="16" />
        </svg>
      </AnnotatedFigure>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const figure = canvasElement.querySelector('[data-lds-annotated-figure]');
    const body = figure.querySelector('[data-annotated-figure-body]').getBoundingClientRect();
    const notes = figure.querySelector('[data-annotated-figure-notes]').getBoundingClientRect();
    if (notes.top < body.bottom - 1) {
      throw new Error('In a container too narrow for figure + rail, the rail must wrap underneath.');
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
    // 깨진 앵커는 캔버스에 오를 수 없다 — 레일로 강등되고, 숨겨지지 않고
    // 표시된다 (effect가 상태를 붙일 때까지 폴링).
    const figure = canvasElement.querySelector('[data-lds-annotated-figure]');
    const start = Date.now();
    while (!figure.querySelector('[data-annotation-anchor-status="missing"]') && Date.now() - start < 2000) {
      await new Promise((resolve) => { setTimeout(resolve, 25); });
    }
    const missing = figure.querySelector('[data-annotation-anchor-status="missing"]');
    if (!missing) throw new Error('A claimed anchor that matches nothing must be reported as missing.');
    const rail = figure.querySelector('[data-annotated-figure-notes]');
    if (!rail || !rail.contains(missing)) {
      throw new Error('A broken anchor cannot claim a canvas seat — it demotes to the rail.');
    }
    if (!missing.querySelector('[data-annotation-anchor-warning]')?.textContent.includes('앵커 미확인')) {
      throw new Error('The broken anchor must be visibly declared, never silently dropped.');
    }
  },
};
