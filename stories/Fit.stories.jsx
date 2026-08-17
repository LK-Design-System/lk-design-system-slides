import React from 'react';
import { ContentSlide, Fit } from '../src/index.js';

const meta = {
  title: 'Slides/Fit',
  component: Fit,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '분량이 프레임을 넘칠 때 자리를 빌려주는 래퍼입니다. 줄이기만 하고 키우지 않습니다. '
          + '고정 캔버스는 넘쳐도 늘어나지 않고 **잘라내기** 때문에 — 그리고 잘린 내용은 아무도 '
          + '사라진 걸 못 보기 때문에 — 넘침에는 답이 둘 필요합니다: `Fit`이 흡수할 수 있는 만큼 '
          + '흡수하고, 못 하는 만큼은 `data-fit-overflow`로 **신고**해 `check:slide-overflow`가 '
          + '빌드를 실패시킵니다.\n\n'
          + '바닥은 상수가 아니라 램프에서 유도합니다: 본문은 `--slides-fine-*`(투사 램프가 인정하는 '
          + '가장 작은 단계)까지만 줄어듭니다. 그래서 프리셋이 바뀌면 바닥도 따라옵니다.',
      },
    },
  },
};

export default meta;

const line = (order) => `항목 ${order + 1} — 실제 덱에서 흔히 생기는 분량 초과를 재현하는 문장입니다.`;
const bullets = (howMany) => Array.from({ length: howMany }, (unused, order) => line(order));

const List = ({ items }) => (
  <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
    {items.map((text) => <li key={text}>{text}</li>)}
  </ul>
);

export const WithinTheFrame = {
  name: '프레임 안',
  render: () => (
    <ContentSlide eyebrow="현황" title="분량이 들어가는 경우">
      <Fit><List items={bullets(3)} /></Fit>
    </ContentSlide>
  ),
  play: async ({ canvasElement }) => {
    const fit = canvasElement.querySelector('[data-lds-fit]');
    if (Number(fit.getAttribute('data-fit-scale')) !== 1) {
      throw new Error(`Content that fits must not be scaled; got ${fit.getAttribute('data-fit-scale')}×.`);
    }
    if (fit.getAttribute('data-fit-overflow')) throw new Error('Content that fits must not report overflow.');
  },
};

export const BorrowsRoom = {
  name: '자리를 빌린다',
  render: () => (
    // 분량은 바닥에 캘리브레이션되어 있다: "조금 넘쳐서 Fit이 흡수할 수 있는"
    // 개수는 바닥이 정한다. 바닥이 0.66×(fine=body1)일 때는 13개였고,
    // 0.75×(fine=headline1, SCALE_DENSITY_PROPOSAL 2단계)로 오르며 10개가 됐다.
    <ContentSlide eyebrow="현황" title="조금 넘치는 경우">
      <Fit><List items={bullets(10)} /></Fit>
    </ContentSlide>
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    const fit = canvasElement.querySelector('[data-lds-fit]');
    const scale = Number(fit.getAttribute('data-fit-scale'));
    if (!(scale < 1)) throw new Error(`Overflowing content must be scaled down; got ${scale}×.`);

    // Shrinking only ever borrows room — it must never magnify.
    if (scale > 1) throw new Error('Fit scales down, never up.');

    // The point of the whole exercise: nothing is clipped any more.
    if (surface.scrollHeight > surface.clientHeight + 1) {
      throw new Error(
        `Fit must bring the slide back inside its canvas; ${surface.scrollHeight}px still in ${surface.clientHeight}px.`,
      );
    }
  },
};

export const FloorIsDerivedFromTheRamp = {
  name: '바닥은 램프에서 나온다',
  parameters: {
    docs: {
      description: {
        story:
          '`briefing` 프리셋은 본문도 `fine`도 한 단계씩 내려가므로 바닥 비율(fine ÷ body)이 '
          + 'keynote와 다릅니다. 바닥이 상수였다면 프리셋을 바꿔도 그대로였을 값입니다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <ContentSlide data-probe="keynote" eyebrow="Keynote" title="기본 프리셋">
        <Fit><List items={bullets(10)} /></Fit>
      </ContentSlide>
      <ContentSlide data-probe="briefing" preset="briefing" eyebrow="Briefing" title="밀도 상향">
        <Fit><List items={bullets(10)} /></Fit>
      </ContentSlide>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const read = (probe) => {
      const surface = canvasElement.querySelector(`[data-probe="${probe}"]`);
      const style = getComputedStyle(surface);
      return {
        floor: Number.parseFloat(style.getPropertyValue('--slides-fine-size'))
          / Number.parseFloat(style.getPropertyValue('--slides-body-size')),
        scale: Number(surface.querySelector('[data-lds-fit]').getAttribute('data-fit-scale')),
      };
    };
    const keynote = read('keynote');
    const briefing = read('briefing');

    if (!(keynote.floor > 0) || !(briefing.floor > 0)) {
      throw new Error('The floor must resolve from the ramp on both presets.');
    }
    if (keynote.floor === briefing.floor) {
      throw new Error('A derived floor must differ between presets; a constant would not.');
    }
    for (const [name, probe] of [['keynote', keynote], ['briefing', briefing]]) {
      if (probe.scale < probe.floor - 0.001) {
        throw new Error(`${name}: Fit scaled to ${probe.scale}×, past its ${probe.floor.toFixed(3)}× floor.`);
      }
    }
  },
};

export const ReportsWhatItCannotAbsorb = {
  name: '못 흡수하면 신고한다',
  tags: ['!test'],
  parameters: {
    docs: {
      description: {
        story:
          '바닥에서도 넘치는 분량입니다. `Fit`은 여기서 조용히 더 줄이는 대신 `data-fit-overflow`를 '
          + '남기고 콘솔에 경고합니다 — 그 신호를 `check:slide-overflow`가 읽어 빌드를 실패시킵니다. '
          + '이 스토리는 그 실패를 재현하는 것이 목적이라 게이트에서 제외(`!test`)합니다.',
      },
    },
  },
  render: () => (
    <ContentSlide eyebrow="현황" title="바닥에서도 넘치는 경우">
      <Fit><List items={bullets(40)} /></Fit>
    </ContentSlide>
  ),
};
