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
