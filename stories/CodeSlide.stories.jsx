import React from 'react';
import { CodeSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Code Slide',
  component: CodeSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '투사 거리에서 읽는 코드입니다. 헤더 계약은 ContentSlide에서 오고, 이 레이아웃은 '
          + '에디터가 아니라 강당에서 읽을 때 달라지는 것만 소유합니다 — 측정폭(코드는 줄바꿈하지 '
          + '않는다), 모노 램프(같은 크기라도 모노가 더 커 보이므로 한 단계 아래), 강조(`highlight`가 '
          + '요점을 든 줄을 세우고 나머지는 물러난다).\n\n'
          + '구문 강조는 하지 않습니다. 토크나이저는 의존성이자 언어 매트릭스이고, 둘 다 슬라이드 '
          + '레이아웃의 것이 아닙니다 — 시스템이 색깔 있는 코드를 원한다면 Core의 콘텐츠 프리미티브 '
          + '옆이 자리입니다.',
      },
    },
  },
};

export default meta;

const SAMPLE = `export function SlideSurface({ children, preset }) {
  const scale = useFitToContainer();
  return (
    <div data-lds-slide-frame>
      <section data-lds-slide-surface
               style={{ transform: \`scale(\${scale})\` }}>
        {children}
      </section>
    </div>
  );
}`;

export const Default = {
  name: 'Code Slide',
  render: () => (
    <CodeSlide
      eyebrow="구현"
      title="캔버스 맞춤"
      governing="고정 논리 캔버스를 컨테이너에 맞춰 끼우는 것이 전부입니다."
      code={SAMPLE}
      caption="src/components/slides/SlideSurface.jsx"
      highlight={[2, 6]}
    />
  ),
  play: async ({ canvasElement }) => {
    const listing = canvasElement.querySelector('[data-code-listing]');
    if (!listing) throw new Error('CodeSlide must render its listing.');

    // Code does not wrap: a wrapped line lies about the code's shape.
    if (getComputedStyle(listing).whiteSpace !== 'pre') {
      throw new Error('A listing must not wrap — cut the line instead.');
    }
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    const style = getComputedStyle(surface);

    // Mono, not the prose family the canvas inherits.
    if (getComputedStyle(listing).fontFamily === style.fontFamily) {
      throw new Error('The listing must be set in the mono family, not the canvas prose family.');
    }

    // One step under body: a listing supports the claim, it is not the claim.
    const listingSize = Number.parseFloat(getComputedStyle(listing).fontSize);
    const bodySize = Number.parseFloat(style.getPropertyValue('--slides-body-size'));
    if (!(listingSize < bodySize)) {
      throw new Error(`The listing must sit under body scale; ${listingSize}px vs ${bodySize}px.`);
    }

    // Emphasis: only the named lines are lit, and they are the strong ones.
    const lit = [...canvasElement.querySelectorAll('[data-code-emphasis="true"]')];
    if (lit.length !== 2) throw new Error(`highlight names two lines; ${lit.length} are lit.`);
    if (lit.map((line) => line.getAttribute('data-code-line')).join(',') !== '2,6') {
      throw new Error('The lit lines must be the ones named in `highlight`.');
    }
    const weight = (node) => Number.parseInt(getComputedStyle(node).fontWeight, 10);
    const dim = canvasElement.querySelector('[data-code-line="1"]');
    if (!(weight(lit[0]) > weight(dim))) {
      throw new Error('A highlighted line must read heavier than the lines that recede.');
    }

    if (canvasElement.querySelector('[data-code-caption]').textContent !== 'src/components/slides/SlideSurface.jsx') {
      throw new Error('The caption carries the file name — what an audience needs to place the snippet.');
    }
  },
};

export const WithoutEmphasis = {
  name: '강조 없이',
  render: () => (
    <CodeSlide eyebrow="구현" title="강조를 쓰지 않은 판" code={SAMPLE} caption="SlideSurface.jsx" />
  ),
  play: async ({ canvasElement }) => {
    if (canvasElement.querySelector('[data-code-emphasis="true"]')) {
      throw new Error('With no highlight, no line may claim emphasis.');
    }
    const expected = SAMPLE.split('\n').length;
    const lines = canvasElement.querySelectorAll('[data-code-line]');
    if (lines.length !== expected) {
      throw new Error(`The listing must render every line; ${expected} in the source, ${lines.length} rendered.`);
    }
  },
};
