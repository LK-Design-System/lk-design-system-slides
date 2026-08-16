import React from 'react';
import { SectionSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Section Slide',
  component: SectionSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '챕터 구분 슬라이드입니다. 덱 골격(표지 → 목차 → 본문 → 막지)에서 본문 챕터 사이의 숨 고르기를 소유합니다 — 색인·명사형 제목·안내 한 줄까지가 계약이고, 내용은 싣지 않습니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Section Slide',
  render: () => (
    <SectionSlide
      index={2}
      title="실행 로드맵"
      subtitle="3분기 착수 과제와 담당 조직을 확정합니다."
    />
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-section-slide]');
    const index = canvasElement.querySelector('[data-slide-index]');
    const title = canvasElement.querySelector('[data-slide-title]');
    if (!surface || !index || !title) {
      throw new Error('SectionSlide must render its surface, index, and title regions.');
    }
    if (index.textContent !== '02') {
      throw new Error('A numeric index must render zero-padded — the deck counts, the slide formats.');
    }
    if (!(index.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      throw new Error('The index must precede the chapter title in reading order.');
    }
    // Contract revised 2026-08-16 (COMPOSITION_PROPOSAL.md B): the earlier
    // rule pinned the divider to display scale ("read, not studied"). A
    // breathing slide carrying four glyphs can afford to be loud — every
    // surveyed peer sets its section tier ABOVE the content tier — so the
    // title now rides the tier its length warrants and must render exactly
    // what it declared. This story's short chapter name warrants hero.
    const scale = title.getAttribute('data-slide-scale');
    if (scale !== 'hero') {
      throw new Error(`A short chapter name rides the hero tier; declared "${scale}".`);
    }
    const probe = document.createElement('span');
    probe.style.fontSize = `var(--slides-${scale}-size)`;
    surface.append(probe);
    const expected = parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    if (parseFloat(getComputedStyle(title).fontSize) !== expected) {
      throw new Error(`The chapter title must render at its declared ${scale} scale.`);
    }
    if (/다\.$/.test(title.textContent.trim())) {
      throw new Error('The chapter title ends with a noun — sentences belong to governing messages.');
    }
  },
};
