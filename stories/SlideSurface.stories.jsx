import React from 'react';
import { ContentSlide, DeckViewer, SlideSurface } from '../src/index.js';

const meta = {
  title: 'Slides/Slide Surface',
  component: SlideSurface,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '슬라이드의 단일 정본 캔버스입니다. 16:9 비율과 투사 세이프 존을 소유하며, 내용의 의미는 레이아웃과 덱이 소유합니다.',
      },
    },
  },
};

export default meta;

export const Canvas = {
  name: 'Canvas',
  render: () => (
    <SlideSurface>
      <p style={{ margin: 0 }}>세이프 존 안의 콘텐츠 영역</p>
    </SlideSurface>
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    if (!surface) throw new Error('SlideSurface must render its canvas landmark.');
    const { aspectRatio, paddingLeft } = getComputedStyle(surface);
    if (!aspectRatio.includes('/')) {
      throw new Error('SlideSurface must own a fixed canvas aspect ratio.');
    }
    if (parseFloat(paddingLeft) <= 0) {
      throw new Error('SlideSurface must keep content inside the projection-safe area.');
    }
  },
};

export const Presets = {
  name: 'Presets',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <ContentSlide eyebrow="Keynote — 강당 기본값" title="분기 로드맵 공유">
        <p style={{ margin: 0 }}>프리셋 미지정 덱의 기본값. 본문이 투사 하한(24px) 위에 머뭅니다.</p>
      </ContentSlide>
      <ContentSlide preset="briefing" eyebrow="Briefing — 밀도 상향" title="분기 로드맵 공유">
        <p style={{ margin: 0 }}>가까이서 보는 보고용 밀도. 레이아웃은 그대로, 토큰만 한 단계 아래로.</p>
      </ContentSlide>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const surfaces = canvasElement.querySelectorAll('[data-lds-slide-surface]');
    if (surfaces.length !== 2) throw new Error('Presets story must render both deck kinds.');
    const [keynote, briefing] = surfaces;
    if (briefing.getAttribute('data-slides-preset') !== 'briefing') {
      throw new Error('preset="briefing" must reach the surface as data-slides-preset.');
    }
    const bodySize = (surface) =>
      parseFloat(getComputedStyle(surface.querySelector('[data-slide-content]')).fontSize);
    if (bodySize(keynote) < 24) {
      throw new Error('The default (keynote) preset must keep body type at or above the 24px projection floor.');
    }
    if (bodySize(briefing) >= bodySize(keynote)) {
      throw new Error('The briefing preset must be denser than keynote — same layout, smaller ramp step.');
    }
  },
};

export const ScaleInvariance = {
  name: '캔버스 스케일 불변',
  parameters: {
    docs: {
      description: {
        story:
          '같은 슬라이드를 폭이 다른 두 컨테이너에 넣습니다. 캔버스는 논리 크기가 고정이라 '
          + '줄바꿈과 구성이 완전히 같고, 컨테이너 폭에 따라 전체가 함께 축소될 뿐입니다. '
          + '유동 박스였다면 좁은 쪽에서 타입이 상대적으로 커지며 구성이 달라집니다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      {[960, 540].map((width) => (
        <div key={width} data-probe-width={width} style={{ width }}>
          <ContentSlide eyebrow="Operations" title="같은 캔버스, 다른 표시 크기">
            <p style={{ margin: 0 }}>
              논리 캔버스가 고정이라 이 문단의 줄바꿈은 두 판에서 동일합니다.
            </p>
          </ContentSlide>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const probes = [...canvasElement.querySelectorAll('[data-probe-width]')].map((probe) => {
      const surface = probe.querySelector('[data-lds-slide-surface]');
      const frame = probe.querySelector('[data-lds-slide-frame]');
      const title = probe.querySelector('[data-slide-title]');
      return {
        width: Number(probe.getAttribute('data-probe-width')),
        surface: surface.getBoundingClientRect(),
        frame: frame.getBoundingClientRect(),
        title: title.getBoundingClientRect(),
        designFontSize: Number.parseFloat(getComputedStyle(title).fontSize),
        canvasWidth: Number.parseFloat(
          getComputedStyle(surface).getPropertyValue('width'),
        ),
      };
    });
    if (probes.length !== 2) throw new Error('The invariance story needs two differently sized probes.');
    const [wide, narrow] = probes;

    // Guard against a vacuous pass: the two probes must actually render at
    // different sizes, or the ratios below match for the wrong reason.
    if (!(wide.surface.width > narrow.surface.width + 100)) {
      throw new Error(
        `The probes must render at different sizes; got ${wide.surface.width} and ${narrow.surface.width}.`,
      );
    }

    // A transform does not shrink a layout box, so a canvas left in flow makes
    // the deck reserve its full logical height and stack dead space under
    // every slide. The frame must measure exactly what the canvas draws.
    for (const probe of probes) {
      const slack = Math.abs(probe.frame.height - probe.surface.height);
      if (slack > 1) {
        throw new Error(
          `The frame must reserve exactly the scaled canvas at ${probe.width}px; `
          + `frame ${probe.frame.height.toFixed(1)} vs canvas ${probe.surface.height.toFixed(1)}.`,
        );
      }
    }

    // The logical canvas is the same in both, so type is authored at one size
    // and every visual difference is the fit transform.
    if (wide.designFontSize !== narrow.designFontSize || wide.canvasWidth !== narrow.canvasWidth) {
      throw new Error('The logical canvas and its type must be identical regardless of display size.');
    }

    // The invariant: a title occupies the same fraction of the canvas at any
    // display size. A fluid box with fixed type fails this — that was the bug
    // this contract exists to prevent.
    const ratio = (probe) => probe.title.height / probe.surface.height;
    const drift = Math.abs(ratio(wide) - ratio(narrow));
    if (drift > 0.01) {
      throw new Error(
        `Title must hold its share of the canvas at any size; ratios ${ratio(wide).toFixed(4)} vs ${ratio(narrow).toFixed(4)}.`,
      );
    }
  },
};

export const Footer = {
  name: '푸터와 페이지 번호',
  parameters: {
    docs: {
      description: {
        story:
          '페이지 번호는 **캔버스 위**에 있습니다. 덱 크롬에만 있으면 슬라이드를 내보내거나 '
          + '캡처한 순간 신원이 사라지기 때문입니다. 위치는 덱이 컨텍스트로 내려주므로, 덱 밖에서 '
          + '홀로 렌더된 슬라이드는 번호를 지어내지 않고 표시하지 않습니다. 푸터는 흐름 밖에 있어 '
          + '어떤 레이아웃도 밀지 않고 초과 측정에도 잡히지 않습니다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div data-probe="deck">
        <DeckViewer label="푸터 데모">
          <ContentSlide foot="플랫폼팀 · 2026 Q3" eyebrow="현황" title="덱 안에서는 번호가 붙는다">
            <p style={{ margin: 0 }}>페이지 번호는 덱이 알고, 캔버스가 그린다.</p>
          </ContentSlide>
          <ContentSlide foot="플랫폼팀 · 2026 Q3" eyebrow="현황" title="두 번째 장">
            <p style={{ margin: 0 }}>번호는 진행에 따라 움직인다.</p>
          </ContentSlide>
        </DeckViewer>
      </div>
      <div data-probe="standalone">
        <ContentSlide foot="플랫폼팀 · 2026 Q3" eyebrow="현황" title="덱 밖에서는 번호가 없다">
          <p style={{ margin: 0 }}>홀로 선 슬라이드에는 보고할 위치가 없다.</p>
        </ContentSlide>
      </div>
      <div data-probe="opted-out">
        <ContentSlide footer={false} eyebrow="현황" title="푸터를 끈 장">
          <p style={{ margin: 0 }}>표지나 전면 도판은 푸터를 내린다.</p>
        </ContentSlide>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const at = (probe, selector) => canvasElement.querySelector(`[data-probe="${probe}"] ${selector}`);

    // In a deck the page number is on the canvas, zero-padded.
    const page = at('deck', '[data-slide-page]');
    if (!page) throw new Error('A slide inside a deck must carry its page number on the canvas.');
    if (page.textContent.replace(/\s/g, '') !== '01/02') {
      throw new Error(`The page number must be zero-padded "01 / 02"; got "${page.textContent.trim()}".`);
    }
    const surface = at('deck', '[data-lds-slide-surface]');
    if (!surface.contains(page)) throw new Error('The page number must live inside the canvas, not the deck chrome.');
    if (at('deck', '[data-slide-foot-label]').textContent !== '플랫폼팀 · 2026 Q3') {
      throw new Error('The footer label is the deck’s to set and the canvas’s to draw.');
    }

    // Out of flow: adding chrome must not make a slide look over-full.
    if (surface.scrollHeight > surface.clientHeight + 1) {
      throw new Error('The footer must not contribute to the canvas scroll height.');
    }

    // A lone slide has no position, so it invents none.
    if (at('standalone', '[data-slide-page]')) {
      throw new Error('Outside a deck a slide must not print a page number it cannot know.');
    }
    if (!at('standalone', '[data-slide-foot-label]')) {
      throw new Error('A footer label still shows without a deck — only the number needs a position.');
    }

    if (at('opted-out', '[data-slide-foot]')) throw new Error('footer={false} must drop the whole strip.');

    // The number follows the deck.
    const deck = canvasElement.querySelector('[data-lds-deck-viewer]');
    deck.focus();
    deck.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    for (let attempt = 0; attempt < 100; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => { setTimeout(resolve, 10); });
      if (at('deck', '[data-slide-page]')?.textContent.replace(/\s/g, '') === '02/02') return;
    }
    throw new Error(`The page number must follow the deck; stayed at "${at('deck', '[data-slide-page]')?.textContent}".`);
  },
};

export const FullBleed = {
  name: 'Full Bleed',
  render: () => (
    <SlideSurface safeArea={false}>
      <div style={{ flex: 1, background: 'var(--color-semantic-fill-normal)' }} />
    </SlideSurface>
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    if (parseFloat(getComputedStyle(surface).paddingLeft) !== 0) {
      throw new Error('safeArea={false} must remove the safe-area padding for full-bleed media.');
    }
  },
};
