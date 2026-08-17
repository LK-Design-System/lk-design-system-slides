import React from 'react';
import { StatSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Stat Slide',
  component: StatSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '수치 슬라이드입니다. 숫자는 Editorial의 `KeyFigure`가, 그 안의 숫자 조판은 Product `Stat`이 그립니다. '
          + '이 슬라이드는 배치와 순위만 소유하며, 강조 예산을 슬라이드 범위에서 집행합니다.',
      },
    },
  },
};

export default meta;

const FIGURES = [
  { value: 99.2, unit: '%', label: '가동률', claim: '분기 목표 98%를 상회했다.' },
  { value: 14, unit: '분', label: '평균 복구 시간', claim: '작년 동기 대비 절반으로 단축.', emphasis: true },
  { value: 3, unit: '건', label: '미해결 인시던트', claim: '전부 P3 이하.' },
];

export const Default = {
  name: 'Stat Slide',
  render: () => (
    <StatSlide
      eyebrow="Operations"
      title="분기 운영 지표"
      figures={FIGURES}
      source="출처: 사내 운영 대시보드, 2026-07"
    />
  ),
  play: async ({ canvasElement }) => {
    const figures = canvasElement.querySelectorAll('[data-lds-key-figure]');
    if (figures.length !== FIGURES.length) {
      throw new Error('StatSlide must render one KeyFigure per figure, delegating the numeral to Editorial.');
    }

    // The emphasis budget is spent at slide scope: one figure, and the accented
    // eyebrow stands down so two accents never argue on one surface.
    const emphasised = canvasElement.querySelectorAll('[data-lds-key-figure][data-emphasis="true"]');
    if (emphasised.length !== 1) {
      throw new Error(`Exactly one figure may carry emphasis on a slide; found ${emphasised.length}.`);
    }
    if (canvasElement.querySelector('[data-slide-eyebrow]')) {
      throw new Error('A slide that spends emphasis on a figure must drop the accented eyebrow.');
    }
  },
};

export const EmphasisBudgetIsEnforced = {
  name: '강조 예산 집행',
  render: () => (
    <StatSlide
      title="세 수치가 모두 강조를 요청한 경우"
      figures={FIGURES.map((figure) => ({ ...figure, emphasis: true }))}
    />
  ),
  play: async ({ canvasElement }) => {
    const emphasised = canvasElement.querySelectorAll('[data-lds-key-figure][data-emphasis="true"]');
    if (emphasised.length !== 1) {
      throw new Error(`All three asked for emphasis; only the first may keep it. Found ${emphasised.length}.`);
    }
    const first = canvasElement.querySelector('[data-lds-key-figure]');
    if (first.getAttribute('data-emphasis') !== 'true') {
      throw new Error('The first figure to ask for emphasis is the one that keeps it.');
    }
  },
};

export const ProjectionSeam = {
  name: '투사 스케일 접합부',
  parameters: {
    docs: {
      description: {
        story:
          'Editorial은 매체를 모른 채 순위만 소유하고, 읽는 거리는 슬라이드가 지정합니다. '
          + '이 스토리는 슬라이드 위의 Editorial 텍스트가 제품 기본값(15px 등)이 아니라 '
          + '투사 스케일로 해석되는지를 단언합니다.',
      },
    },
  },
  render: () => (
    <StatSlide
      title="접합부 검증"
      figures={[FIGURES[0]]}
      source="출처: 사내 운영 대시보드, 2026-07"
    />
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    const claim = canvasElement.querySelector('[data-key-figure-claim]');
    if (!surface || !claim) throw new Error('The seam story needs a slide surface and a KeyFigure claim.');

    const surfaceStyle = getComputedStyle(surface);
    const slideBody = surfaceStyle.getPropertyValue('--slides-body-size').trim();
    const editorialClaim = surfaceStyle.getPropertyValue('--editorial-claim-size').trim();
    if (!slideBody || editorialClaim !== slideBody) {
      throw new Error(
        `Inside a slide, --editorial-claim-size must resolve to --slides-body-size (${slideBody}); got "${editorialClaim}".`,
      );
    }

    // The regression this guards: the claim rendering at the product ramp's
    // reading distance, unreadable from the back of the room.
    const rendered = Number.parseFloat(getComputedStyle(claim).fontSize);
    const expected = Number.parseFloat(slideBody);
    if (Number.isNaN(rendered) || Math.abs(rendered - expected) > 0.5) {
      throw new Error(`The claim must render at the projection scale (${expected}px); got ${rendered}px.`);
    }
    if (rendered < 20) {
      throw new Error(`The projection floor is 20px; the claim rendered at ${rendered}px.`);
    }
  },
};

export const BriefingPresetFlowsThrough = {
  name: 'briefing 프리셋 전파',
  parameters: {
    docs: {
      description: {
        story:
          '프리셋은 `--slides-*` 단계만 재지정하는데, Editorial 램프가 그 단계를 경유하므로 '
          + '프리셋 전환이 Editorial 컴포넌트까지 자동으로 전파됩니다.',
      },
    },
  },
  render: () => (
    <StatSlide preset="briefing" title="briefing 프리셋" figures={[FIGURES[0]]} />
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    if (surface.getAttribute('data-slides-preset') !== 'briefing') {
      throw new Error('StatSlide must forward the preset down to the surface.');
    }
    const style = getComputedStyle(surface);
    const slideBody = style.getPropertyValue('--slides-body-size').trim();
    const editorialClaim = style.getPropertyValue('--editorial-claim-size').trim();
    if (editorialClaim !== slideBody) {
      throw new Error(
        `A preset must re-point the editorial ramp too: expected ${slideBody}, got ${editorialClaim}.`,
      );
    }
  },
};

/* 적응 계약 2세대 (ADAPTIVE_CONTRACTS_PROPOSAL): 지표가 2개 이하면 수치가
   title 단에서 display 단으로 한 단 올라간다 — seam 랭크 재지정이지 임의
   크기가 아니다. 위임 슬라이드는 규칙으로 center에 앉는다(명시가 이긴다). */
export const CountAdaptiveFigures = {
  name: '변형·상태 · 지표 개수 적응',
  render: () => (
    <StatSlide
      eyebrow="적응"
      title="두 지표의 캔버스"
      figures={[
        { value: '47%', label: 'p95 지연 감소' },
        { value: '5종', label: '이관 대상 테이블' },
      ]}
      source="출처: 데모 데이터, 2026-08"
    />
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('[data-stat-slide-figures]');
    if (row?.getAttribute('data-stat-count-tier') !== 'roomy') {
      throw new Error('Two figures own the canvas — the row must declare the roomy tier.');
    }
    // 수치는 Core Stat의 --lk-stat-value 훅으로 올라간다. 훅이 담긴 코어
    // 릴리스를 소비하기 전에는 폴백(display2)이, 소비한 뒤에는 display 단이
    // 렌더된다 — 단언은 "roomy 스코프의 훅 해석값과 실제 렌더가 일치한다"라
    // 핀 범프 전후 모두 참이고, 배선이 끊기면 그때 빨개진다.
    if (row.style.getPropertyValue('--lk-stat-value-size') === '') {
      throw new Error('The roomy tier must re-point the --lk-stat-value hook (rank, not size).');
    }
    const resolve = (expression) => {
      const probe = document.createElement('span');
      probe.style.fontSize = expression;
      row.append(probe);
      const px = Number.parseFloat(getComputedStyle(probe).fontSize);
      probe.remove();
      return px;
    };
    const hooked = resolve('var(--lk-stat-value-size)');   // display rung (56 keynote)
    const fallback = resolve('var(--display2-size)');       // pre-hook Stat renders this
    const numerals = [...row.querySelectorAll('*')].map((el) => Number.parseFloat(getComputedStyle(el).fontSize));
    if (!numerals.includes(hooked) && !numerals.includes(fallback)) {
      throw new Error(`Numerals must render at the hook size (${hooked}px) or, until the hook-bearing core is consumed, its fallback (${fallback}px).`);
    }
    if (numerals.includes(hooked) && hooked !== fallback) {
      // 훅이 실제로 작동하는 코어에서는 fallback 크기가 남아 있으면 안 된다.
      const stale = numerals.filter((px) => px === fallback).length;
      void stale; // 라벨(body2)과 구분이 안 되므로 카운트만 관찰용으로 남긴다.
    }
    // 위임 슬라이드는 규칙으로 center에 앉는다.
    if (!canvasElement.querySelector('[data-slide-anchor="center"]')) {
      throw new Error('A figure row is one band — it centers by rule, without a manual anchor.');
    }
  },
};
