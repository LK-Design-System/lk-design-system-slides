import React from 'react';
import { AgendaSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Agenda Slide',
  component: AgendaSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '목차 슬라이드입니다. 챕터 제목의 순서 목록을 SectionSlide와 같은 zero-pad 색인으로 번호 매기고, `current`(1-기준)로 챕터 사이의 진행 표시 슬라이드로 재사용할 수 있습니다. 강조는 current 한 곳에만 지출됩니다.',
      },
    },
  },
};

export default meta;

const ITEMS = ['현황 진단', '실행 로드맵', '투자 계획'];

export const Default = {
  name: 'Agenda Slide',
  render: () => <AgendaSlide items={ITEMS} current={2} />,
  play: async ({ canvasElement }) => {
    const items = canvasElement.querySelectorAll('[data-slide-agenda-item]');
    if (items.length !== 3) throw new Error('AgendaSlide must render every chapter the deck lists.');
    const indices = canvasElement.querySelectorAll('[data-slide-agenda-index]');
    if (indices[1].textContent !== '02') {
      throw new Error("Agenda numbering must match SectionSlide's zero-padded format — one deck, one count.");
    }
    const marked = canvasElement.querySelectorAll('[data-slide-agenda-item][data-current]');
    if (marked.length !== 1 || !marked[0].textContent.includes('실행 로드맵')) {
      throw new Error('Exactly one agenda item may be current (1-based, matching SectionSlide index).');
    }
    const [past, cur] = [items[0], items[1]].map((el) => getComputedStyle(el));
    if (parseInt(cur.fontWeight, 10) <= parseInt(past.fontWeight, 10)) {
      throw new Error('Emphasis is spent on the current chapter only — the rest stay quiet.');
    }
    // Non-current names ride MEDIUM (2026-08-18 weight render): 400 reads as
    // blown-up body at this scale, and 700 would spend the weight that marks
    // `current`. The ladder is ordinal 400 < name 500 < current 700.
    if (parseInt(past.fontWeight, 10) !== 500) {
      throw new Error(`Chapter names ride medium — regular goes washy, bold spends the current-marker. Got ${past.fontWeight}.`);
    }
    if (parseInt(getComputedStyle(marked[0]).fontWeight, 10) !== 700) {
      throw new Error('The current chapter rides the bold class weight of its tier, not off-ramp semibold.');
    }
    // Contract added 2026-08-16 (full-deck review): the agenda is a sparse
    // slide, and chapter names read at the scale chapters are titled. Body
    // scale left three lines stranded in a corner of the canvas.
    const surface = canvasElement.querySelector('[data-lds-agenda-slide]');
    // Items ride the orient tier — the size their promotion actually reviewed,
    // pinned so the next title-tier move cannot drag the list along again.
    const probe = document.createElement('span');
    probe.style.fontSize = 'var(--slides-orient-size)';
    surface.append(probe);
    const orientSize = getComputedStyle(probe).fontSize;
    probe.remove();
    if (getComputedStyle(items[0]).fontSize !== orientSize) {
      throw new Error(`Agenda items ride the orient tier (${orientSize}); got ${getComputedStyle(items[0]).fontSize}.`);
    }

    // The ordinal is subordinated by TONE, not size: same rung, regular
    // weight, quieter colour — the book-TOC idiom. Both other shapes failed in
    // renders (full-size bold outweighed the name; a small bold ordinal
    // floated — a stacked ratio transplanted into an inline row). Asserted so
    // neither failure can return quietly.
    const ordinal = items[0].querySelector('[data-slide-agenda-index]');
    if (getComputedStyle(ordinal).fontSize !== getComputedStyle(items[0]).fontSize) {
      throw new Error('The ordinal shares its item\'s line and size — subordination is tonal.');
    }
    if (parseInt(getComputedStyle(ordinal).fontWeight, 10) > 400) {
      throw new Error('The ordinal stays regular — a bold ordinal outweighs the chapter it numbers.');
    }
    for (const item of ITEMS) {
      if (/다\.$/.test(item)) {
        throw new Error('Agenda items are chapter titles — noun-ended, never sentences.');
      }
    }
  },
};
