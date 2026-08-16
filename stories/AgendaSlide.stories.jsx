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
    // Contract added 2026-08-16 (full-deck review): the agenda is a sparse
    // slide, and chapter names read at the scale chapters are titled. Body
    // scale left three lines stranded in a corner of the canvas.
    const surface = canvasElement.querySelector('[data-lds-agenda-slide]');
    const titleSize = getComputedStyle(surface).getPropertyValue('--slides-title-size').trim();
    if (getComputedStyle(items[0]).fontSize !== titleSize) {
      throw new Error(`Agenda items must read at title scale (${titleSize}); got ${getComputedStyle(items[0]).fontSize}.`);
    }
    for (const item of ITEMS) {
      if (/다\.$/.test(item)) {
        throw new Error('Agenda items are chapter titles — noun-ended, never sentences.');
      }
    }
  },
};
