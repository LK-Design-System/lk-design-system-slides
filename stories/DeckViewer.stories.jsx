import React from 'react';
import { AssessmentSlide, ContentSlide, DeckViewer, EndSlide, TitleSlide } from '../src/index.js';

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

const NOTE = '적재 큐부터 짚고, 수집 이야기는 질문 나오면 그때.';

export const SpeakerNotes = {
  name: '발표자 노트',
  parameters: {
    docs: {
      description: {
        story:
          '노트는 슬라이드 요소의 `notes` prop에 실려 덱이 읽습니다. **캔버스에는 절대 들어가지 '
          + '않습니다** — 청중이 보는 표면에 발표자용 텍스트가 있으면 안 되기 때문입니다. '
          + '기본은 숨김이고 `N` 또는 버튼으로 엽니다.',
      },
    },
  },
  render: () => (
    <DeckViewer label="노트가 있는 덱">
      <ContentSlide eyebrow="현황" title="수집 지연 현황" notes={NOTE}>
        <p style={{ margin: 0 }}>p95 지연 41분 — 목표 초과 상태가 6주째 지속.</p>
      </ContentSlide>
      <EndSlide message="지연 민감 테이블부터, 3분기에 시작합니다." contact="플랫폼팀" />
    </DeckViewer>
  ),
  play: async ({ canvasElement }) => {
    const deck = canvasElement.querySelector('[data-lds-deck-viewer]');
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    const notes = () => canvasElement.querySelector('[data-deck-notes]');
    const press = async (key) => {
      deck.focus();
      deck.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    };

    // The contract that matters: nothing written for the presenter reaches
    // the canvas the room is looking at.
    if (surface.textContent.includes(NOTE)) {
      throw new Error('Speaker notes must never render inside the slide surface.');
    }
    if (notes()) throw new Error('Notes stay closed until the presenter asks for them.');

    await press('n');
    if (!notes() || !notes().textContent.includes(NOTE)) {
      throw new Error('N must open the speaker notes for the current slide.');
    }
    if (canvasElement.querySelector('[data-lds-slide-surface]').contains(notes())) {
      throw new Error('The notes region must live outside the slide surface, not within it.');
    }

    await press('n');
    if (notes()) throw new Error('N must close the notes again.');

    // A slide without notes offers no affordance to open them.
    await press('n');
    await press('ArrowRight');
    if (canvasElement.querySelector('[data-deck-notes-toggle]')) {
      throw new Error('A slide with no notes must not offer a notes toggle.');
    }
  },
};

/* 덱 매체 축(ADAPTIVE_CONTRACTS_PROPOSAL 변경 1·2): preset은 덱이 한 번
   선언하고 슬라이드가 오버라이드하며, read kind에서는 위임 슬라이드의
   auto-center가 top으로 해소된다(열람 페이지는 문서 흐름 — 마찰 6). */
export const DeckMediumAxes = {
  name: '계약 · 덱 매체 축 (preset·kind)',
  render: () => (
    <DeckViewer label="매체 축 데모" kind="read" preset="briefing">
      <AssessmentSlide
        eyebrow="지표"
        title="열람 표 페이지"
        metrics={[
          { id: 'a', name: '재현율', target: '95%', actual: '96%', status: 'met' },
          { id: 'b', name: '오탐', target: '2건', actual: '2건', status: 'watch' },
        ]}
        caption="데모"
        source="출처: 데모, 2026-08"
      />
      <ContentSlide title="키노트 오버라이드" governing="슬라이드의 preset이 덱 기본값을 이긴다." preset="keynote">
        <p style={{ margin: 0 }}>오버라이드 확인용.</p>
      </ContentSlide>
    </DeckViewer>
  ),
  play: async ({ canvasElement }) => {
    const surface = () => canvasElement.querySelector('[data-lds-slide-surface]');
    // 1장: 덱 preset이 슬라이드에 흘러든다.
    if (surface()?.getAttribute('data-slides-preset') !== 'briefing') {
      throw new Error("The deck's preset must flow to a slide that names none.");
    }
    // read kind: 위임 auto는 top — center 규칙이 열람 문서 흐름을 이기면 안 된다.
    if (canvasElement.querySelector('[data-slide-anchor="center"]')) {
      throw new Error('On a read deck the auto anchor resolves to top — pages read as documents.');
    }
    // 2장: 슬라이드의 명시 preset이 덱 기본값을 이긴다.
    canvasElement.querySelector('[data-deck-next]').click();
    await new Promise((resolve) => { setTimeout(resolve, 60); });
    if (surface()?.getAttribute('data-slides-preset') !== 'keynote') {
      throw new Error("A slide's own preset must override the deck default.");
    }
  },
};
