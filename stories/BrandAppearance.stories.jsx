import React from 'react';
import { Lockup } from '@lk-design-system/lds-theme';
import {
  TitleSlide, SectionSlide, StatementSlide, EndSlide,
} from '../src/index.js';

const meta = {
  title: 'Slides/Brand Appearance',
  parameters: {
    docs: {
      description: {
        component:
          '`appearance="brand"` — 표지와 간지를 브랜드 네이비로. **레이아웃 축이지 테마 축이 아닙니다**: 덱은 표지만 브랜딩하고 본문은 흰 표면으로 두므로 Theme 교체로는 표현할 수 없고, 프리셋은 색이 아니라 활자를 재지정합니다. 표면과 잉크(`--slides-ink-*`)를 표면 자신의 스코프에서 함께 재지정하므로, 잉크를 읽는 레이아웃은 자기가 옮겨졌다는 것을 모릅니다. '
          + '규율상 **희소 레이아웃 전용**입니다 — 네이비 위의 표나 차트는 브랜드 순간이 아니라 가독성 문제입니다. 표지의 로고는 슬롯(`lockup`)이고, 마크 자체는 Theme의 것입니다.',
      },
    },
  },
};

export default meta;

export const BrandCover = {
  name: 'Brand Cover',
  render: () => (
    <TitleSlide
      appearance="brand"
      lockup={<Lockup variant="inline" tone="white" height={30} />}
      eyebrow="대외 발표"
      title="자율 물류 플랫폼 도입 제안"
      // The mark above already says whose deck this is, so the subtitle
      // carries only what it does not — the date. A cover that sets the
      // organisation in type UNDER its own logo is the habit this slot
      // exists to end.
      subtitle="2026 3분기"
      foot="LK ROBOTICS"
    />
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    if (surface.getAttribute('data-slides-appearance') !== 'brand') {
      throw new Error('The brand appearance must be declared on the surface, where the re-point is scoped.');
    }

    // The ink follows the surface. This is the whole point of the indirection:
    // no layout branches on a variant, so what must be asserted is that the
    // re-point actually reaches the type.
    const title = surface.querySelector('[data-slide-title]');
    const titleColour = getComputedStyle(title).color;
    const surfaceColour = getComputedStyle(surface).backgroundColor;
    const luminance = (colour) => {
      const [r, g, b] = colour.match(/[\d.]+/g).slice(0, 3).map(Number);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    };
    if (luminance(surfaceColour) > 0.3) {
      throw new Error(`The brand surface must be the dark brand ground, measured ${surfaceColour}.`);
    }
    if (luminance(titleColour) < 0.7) {
      throw new Error(`Type on the brand surface must be inverse ink, measured ${titleColour}.`);
    }

    // The logo has a place to land, and it is a slot the deck fills.
    const lockup = surface.querySelector('[data-slide-lockup] svg');
    if (!lockup) throw new Error('The cover must be able to carry a brand mark.');
    if (lockup.getBoundingClientRect().top > title.getBoundingClientRect().top) {
      throw new Error('The mark sits above the title, not after it.');
    }
  },
};

export const BrandSection = {
  name: 'Brand Interstitial',
  render: () => (
    <SectionSlide
      appearance="brand"
      index={2}
      title="도입 효과"
      subtitle="측정된 것과 추정한 것"
      foot="LK ROBOTICS"
    />
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    const index = surface.querySelector('[data-slide-index]') ?? surface.querySelector('p');
    // On navy the accent cannot be the light-surface primary blue; it becomes
    // the surface's own ink and weight carries the emphasis.
    const colour = getComputedStyle(index).color;
    const [r, g, b] = colour.match(/[\d.]+/g).slice(0, 3).map(Number);
    if (b > r + 40) {
      throw new Error(`The brand accent must not stay the light-surface blue, measured ${colour}.`);
    }
  },
};

export const SparseFamily = {
  name: 'Sparse Family on Brand',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <StatementSlide
        appearance="brand"
        eyebrow="약속"
        statement="현장에서 재고를 세는 일은 사라집니다."
        foot="LK ROBOTICS"
      />
      <EndSlide
        appearance="brand"
        lockup={<Lockup variant="inline" tone="white" height={24} />}
        message="다음 단계는 파일럿 한 동입니다."
        contact="platform@example.com"
        foot="LK ROBOTICS"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const surfaces = [...canvasElement.querySelectorAll('[data-lds-slide-surface]')];
    if (surfaces.length !== 2) throw new Error('Both sparse layouts must render.');
    for (const surface of surfaces) {
      const text = surface.querySelector('[data-slide-statement], [data-slide-message]')
        ?? surface.querySelector('h2, p');
      const colour = getComputedStyle(text).color;
      const [r, g, b] = colour.match(/[\d.]+/g).slice(0, 3).map(Number);
      if ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.7) {
        throw new Error(`Sparse text on brand must be inverse ink, measured ${colour}.`);
      }
    }

    // The closing slide names the sender with the MARK, not with the
    // organisation typed into the contact line. Both halves are asserted: a
    // lockup that renders, and a contact line that has stopped duplicating it.
    const end = canvasElement.querySelector('[data-lds-end-slide]');
    const lockup = end.querySelector('[data-slide-lockup] svg');
    if (!lockup) throw new Error('The closing slide must be able to carry the brand mark.');
    const message = end.querySelector('[data-slide-message]');
    const contact = end.querySelector('[data-slide-contact]');
    if (lockup.getBoundingClientRect().top < message.getBoundingClientRect().bottom) {
      throw new Error('The mark sits between the residue line and the contact line.');
    }
    if (/LK\s*ROBOTICS/i.test(contact.textContent)) {
      throw new Error('The mark already says whose deck this is — the contact line carries only the address.');
    }
  },
};
