import React from 'react';
import { ContentSlide, SlideSurface } from '../src/index.js';

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
