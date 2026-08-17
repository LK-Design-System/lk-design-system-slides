import React from 'react';
import {
  DeckViewer, TitleSlide, ContentSlide, StatementSlide, EndSlide,
} from '../src/index.js';

const meta = {
  title: 'Deck/Runtime',
  parameters: {
    docs: {
      description: {
        component:
          '발표 런타임의 세 어포던스(COMPLETENESS_AUDIT F1): **전체화면**(`F`), '
          + '**위치 URL**(`#7`은 7장, `#7.2`는 그 두 번째 단계 — 페이지 번호와 같은 1-기반이라 '
          + '"13페이지 봐주세요"가 링크가 된다), **개요**(`O`/`Esc`, 전체 그리드에서 골라 이동). '
          + '개요 타일은 실제 슬라이드다 — 썸네일 캐시가 아니므로 덱과 어긋날 수 없다.',
      },
    },
  },
};

export default meta;

const DECK = [
  <TitleSlide key="1" eyebrow="런타임" title="발표 런타임 데모" subtitle="전체화면 · 위치 URL · 개요" foot="LDS Slides" />,
  <ContentSlide key="2" title="두 번째 장" governing="개요에서 이 장을 골라 올 수 있습니다." foot="LDS Slides">
    <p style={{ margin: 0 }}>본문.</p>
  </ContentSlide>,
  <StatementSlide key="3" statement="위치는 URL이 기억합니다." foot="LDS Slides" />,
  <EndSlide key="4" message="개요는 실제 슬라이드로 그립니다." contact="LDS Slides" foot="LDS Slides" />,
];

export const Runtime = {
  name: 'Fullscreen · Deep link · Overview',
  render: () => <DeckViewer label="런타임 데모">{DECK}</DeckViewer>,
  play: async ({ canvasElement }) => {
    const deck = canvasElement.querySelector('[data-lds-deck-viewer]');
    if (!deck) throw new Error('The deck must render.');
    const press = (key) => {
      deck.focus();
      deck.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    };
    const settle = () => new Promise((resolve) => { setTimeout(resolve, 60); });

    // Every affordance exists twice — a key for the presenter, a visible
    // control for everyone else. The deck's own rule, applied to the new ones.
    for (const selector of ['[data-deck-overview-toggle]', '[data-deck-fullscreen-toggle]']) {
      if (!deck.querySelector(selector)) throw new Error(`${selector} must exist: a key-only affordance is invisible.`);
    }

    // DEEP LINK: the hash carries the position, one-based so it matches the
    // page number the slide prints.
    press('ArrowRight');
    await settle();
    if (window.location.hash !== '#2') {
      throw new Error(`Slide 2 must be addressable as #2, got "${window.location.hash}".`);
    }

    // …and reading it back moves the deck. This is the direction that makes a
    // link work, so it is the one worth asserting.
    window.location.hash = '#4';
    await new Promise((resolve) => { setTimeout(resolve, 150); });
    const progress = deck.querySelector('[data-deck-progress]').textContent;
    if (!progress.startsWith('4 /')) {
      throw new Error(`An external hash change must move the deck; progress reads "${progress}".`);
    }

    // OVERVIEW: one tile per slide, the current one marked, and choosing a tile
    // navigates. Tiles are live slides — assert that, or a future thumbnail
    // cache could quietly replace them.
    press('o');
    await settle();
    const overview = canvasElement.querySelector('[data-lds-deck-overview]');
    if (!overview) throw new Error('O must open the overview.');
    const tiles = overview.querySelectorAll('[data-deck-overview-tile]');
    if (tiles.length !== DECK.length) {
      throw new Error(`The overview shows ${tiles.length} tiles for ${DECK.length} slides.`);
    }
    if (overview.querySelectorAll('[data-deck-overview-current="true"]').length !== 1) {
      throw new Error('Exactly one tile is the current one — the overview answers "where am I".');
    }
    if (overview.querySelectorAll('[data-lds-slide-surface]').length !== DECK.length) {
      throw new Error('Overview tiles are real slides, not pictures of them.');
    }
    tiles[0].click();
    await settle();
    if (canvasElement.querySelector('[data-lds-deck-overview]')) {
      throw new Error('Choosing a tile closes the overview — it navigates, it does not present.');
    }
    if (!deck.querySelector('[data-deck-progress]').textContent.startsWith('1 /')) {
      throw new Error('Choosing the first tile must arrive at slide 1.');
    }

    // FULLSCREEN reports the browser's state, not a local boolean: leaving with
    // Escape never reaches this component as a keydown it can act on.
    const toggle = deck.querySelector('[data-deck-fullscreen-toggle]');
    if (toggle.getAttribute('aria-pressed') !== 'false') {
      throw new Error('The fullscreen control must publish its state through aria-pressed.');
    }
  },
};
