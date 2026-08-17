import React from 'react';
import { Lockup } from '@lk-design-system/lds-theme';
import { DeckViewer, TitleSlide, ContentSlide } from '../src/index.js';

const meta = {
  title: 'Deck/Chrome',
  parameters: {
    docs: {
      description: {
        component:
          '문서 등급과 상시 마크는 **덱 속성**입니다 (COMPLETENESS_AUDIT D2). 슬라이드마다 지정하면 언젠가 한 장이 빠지고, **등급이 한 장에서 빠지면 그 표시 전체가 실패**합니다. 그래서 덱이 한 번 말하고 모든 표면이 따릅니다(슬라이드 prop은 예외 탈출구). 등급은 캔버스 위쪽 오른쪽 — 읽기 전에 확인하는 자리 — 에 주의 톤으로 서고, 상태 배지처럼 보이지 않게 합니다. 마크는 크롬 각주 왼쪽, foot 라벨 앞. 둘 다 흐름 밖이라 넘침 게이트가 재는 것은 여전히 콘텐츠뿐입니다.',
      },
    },
  },
};

export default meta;

export const ClassifiedDeck = {
  name: 'Classification and Mark',
  render: () => (
    <DeckViewer
      label="문서 등급 데모"
      classification="대외비"
      mark={<Lockup variant="mark" tone="ink" height={20} decorative />}
    >
      <TitleSlide eyebrow="플랫폼팀" title="이관 계획 검토" subtitle="2026 3분기" foot="플랫폼팀" />
      <ContentSlide title="검토 범위" governing="지연에 민감한 5종만 먼저 옮깁니다." foot="플랫폼팀">
        <p style={{ margin: 0 }}>본문.</p>
      </ContentSlide>
    </DeckViewer>
  ),
  play: async ({ canvasElement }) => {
    const deck = canvasElement.querySelector('[data-lds-deck-viewer]');
    const surface = () => deck.querySelector('[data-lds-slide-surface]');
    const press = (key) => {
      deck.focus();
      deck.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    };

    const grade = surface().querySelector('[data-slide-classification]');
    if (!grade || grade.textContent.trim() !== '대외비') {
      throw new Error('The deck states its grade once; the surface must print it.');
    }

    // Top of the canvas, not bottom: a reader checks the grade before reading.
    const surfaceBox = surface().getBoundingClientRect();
    const gradeBox = grade.getBoundingClientRect();
    if (gradeBox.top - surfaceBox.top > surfaceBox.height / 3) {
      throw new Error('The grade marking belongs in the upper band, where it is read first.');
    }

    // Chrome, not content: it must not grow what the overflow gate measures.
    if (getComputedStyle(grade).position !== 'absolute') {
      throw new Error('The marking is out of flow, like every other piece of chrome.');
    }

    if (!surface().querySelector('[data-slide-mark] svg')) {
      throw new Error('The standing mark rides the chrome, next to the foot label.');
    }

    // EVERY page. This is the whole reason it is a deck property — a grade
    // missing from one page is the marking failing, not a small omission.
    press('ArrowRight');
    await new Promise((resolve) => { setTimeout(resolve, 80); });
    if (!surface().querySelector('[data-slide-classification]')) {
      throw new Error('The grade marking prints on every page, not just the cover.');
    }
    if (!surface().querySelector('[data-slide-mark]')) {
      throw new Error('The standing mark stands on every page.');
    }
  },
};
