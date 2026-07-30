import React from 'react';
import { ContentSlide, DeckViewer, EndSlide, TitleSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Deck Viewer',
  component: DeckViewer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '덱 컨테이너입니다. 슬라이드 순서·키보드 내비게이션(← → Home End)·진행 표시를 소유하고, 슬라이드 내부는 소유하지 않습니다. 한 번에 한 장만 마운트되고, 끝에서는 순환하지 않고 멈춥니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Deck Viewer',
  render: () => (
    <DeckViewer label="파이프라인 개편 보고 덱">
      <TitleSlide eyebrow="플랫폼팀" title="파이프라인 개편 보고" subtitle="2026년 3분기 계획 검토" />
      <ContentSlide eyebrow="현황" title="수집 지연 현황">
        <p style={{ margin: 0 }}>p95 지연 41분 — 목표 초과 상태가 6주째 지속.</p>
      </ContentSlide>
      <EndSlide message="지연 민감 테이블부터, 3분기에 시작합니다." contact="플랫폼팀" />
    </DeckViewer>
  ),
  play: async ({ canvasElement }) => {
    const deck = canvasElement.querySelector('[data-lds-deck-viewer]');
    const progress = canvasElement.querySelector('[data-deck-progress]');
    if (!deck || !progress) throw new Error('DeckViewer must render its deck and progress regions.');
    const surfaces = () => canvasElement.querySelectorAll('[data-lds-slide-surface]').length;
    const currentTitle = () =>
      canvasElement.querySelector('[data-slide-title], [data-slide-message]')?.textContent ?? '';
    const press = async (key) => {
      deck.focus();
      deck.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    };

    // 한 번에 한 장 — 덱은 시퀀스지 스크롤이 아니다.
    if (surfaces() !== 1) throw new Error('Exactly one slide may be mounted at a time.');
    if (progress.textContent !== '1 / 3') throw new Error('The progress counter must report 1 / 3.');

    await press('ArrowRight');
    if (progress.textContent !== '2 / 3' || !currentTitle().includes('수집 지연 현황')) {
      throw new Error('ArrowRight must advance to the next slide in deck order.');
    }

    await press('End');
    if (progress.textContent !== '3 / 3') throw new Error('End must jump to the last slide.');

    // 끝은 순환하지 않고 멈춘다 — 발표자는 마지막 장을 느껴야 한다.
    await press('ArrowRight');
    if (progress.textContent !== '3 / 3') throw new Error('The deck must clamp at the end, not wrap.');
    const next = canvasElement.querySelector('[data-deck-next]');
    if (!next.disabled) throw new Error('The visible next button must disable at the last slide.');

    await press('Home');
    if (progress.textContent !== '1 / 3') throw new Error('Home must return to the first slide.');
    if (!canvasElement.querySelector('[data-deck-prev]').disabled) {
      throw new Error('The visible prev button must disable at the first slide.');
    }

    // 내비게이션은 두 벌 — 키보드와 보이는 버튼.
    next.click();
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    if (progress.textContent !== '2 / 3') throw new Error('The visible buttons must navigate too.');
  },
};
