import React from 'react';
import { ContentSlide, StatementSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Statement Slide',
  component: StatementSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '주장 하나가 캔버스 전체를 쓰는 레이아웃입니다. ContentSlide가 주장을 본문으로 뒷받침한다면 '
          + '이 판은 주장 그 자체이고, `attribution`을 주면 인용이 됩니다. 문장형 종결을 씁니다 — '
          + '명사형은 제목의 것이고, 이 판에 있는 건 제목이 아니라 문장입니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Statement Slide',
  render: () => (
    <StatementSlide
      eyebrow="Q3 결론"
      statement="지연은 수집이 아니라 적재에서 생깁니다."
    />
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    const statements = canvasElement.querySelectorAll('[data-slide-statement]');
    if (statements.length !== 1) {
      throw new Error(`A statement slide carries exactly one claim; found ${statements.length}.`);
    }
    const style = getComputedStyle(surface);
    const rendered = getComputedStyle(statements[0]).fontSize;
    if (rendered !== style.getPropertyValue('--slides-display-size').trim()) {
      throw new Error(`The statement must be set at display scale; got ${rendered}.`);
    }
  },
};

export const EyebrowYieldsTheAccent = {
  name: '악센트는 문장이 가진다',
  parameters: {
    docs: {
      description: {
        story:
          '다른 레이아웃에서는 eyebrow가 악센트를 답니다. 이 판에서는 문장이 유일한 강조라 '
          + 'eyebrow가 라벨 톤으로 물러납니다 — "강조는 한 번에 하나"가 슬라이드 안에서 지켜지는 방식입니다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <ContentSlide eyebrow="Q3 결론" title="적재 병목">
        <p style={{ margin: 0 }}>본문 레이아웃에서는 eyebrow가 악센트를 답니다.</p>
      </ContentSlide>
      <StatementSlide eyebrow="Q3 결론" statement="지연은 수집이 아니라 적재에서 생깁니다." />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [contentSurface, statementSurface] = canvasElement.querySelectorAll('[data-lds-slide-surface]');
    // Resolve the accent token through a probe: a custom property's declared
    // text ('var(--lk-…)', a hex, an oklch) never string-matches a computed
    // `color`, so the comparison has to happen after the cascade resolves it.
    const probe = document.createElement('span');
    probe.style.color = 'var(--color-semantic-primary-normal)';
    statementSurface.append(probe);
    const accent = getComputedStyle(probe).color;
    probe.remove();
    const eyebrowColor = (surface) =>
      getComputedStyle(surface.querySelector('[data-slide-eyebrow]')).color;

    // The control: on a body layout the eyebrow is the accent. Without this
    // the test below could pass because the token simply resolved oddly.
    if (eyebrowColor(contentSurface) !== accent) {
      throw new Error('ContentSlide is the control here — its eyebrow must carry the accent.');
    }
    if (eyebrowColor(statementSurface) === accent) {
      throw new Error('On a statement slide the claim owns the accent; the eyebrow must step down.');
    }
  },
};

export const Quotation = {
  name: '인용',
  render: () => (
    <StatementSlide
      statement="측정할 수 없으면 개선할 수 없다는 말은, 측정한 것만 개선된다는 뜻이기도 하다."
      attribution="플랫폼팀 회고, 2026-06"
    />
  ),
  play: async ({ canvasElement }) => {
    const statement = canvasElement.querySelector('[data-slide-statement]');
    const attribution = canvasElement.querySelector('[data-slide-attribution]');
    if (!attribution) throw new Error('A quotation must render its attribution.');
    const size = (node) => Number.parseFloat(getComputedStyle(node).fontSize);
    if (!(size(attribution) < size(statement))) {
      throw new Error('The source must stay quieter than the quotation it attributes.');
    }
  },
};
