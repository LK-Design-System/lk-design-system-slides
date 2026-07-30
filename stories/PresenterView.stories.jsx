import React from 'react';
import { ContentSlide, DeckViewer, EndSlide, PresenterView, Step, TitleSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Presenter View',
  component: PresenterView,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '발표자 화면입니다. 덱 상태 기계를 `DeckViewer`와 공유하므로 내비게이션이 동일하고, '
          + '청중 화면이 가질 수 없는 세 가지 — 다음 장 미리보기, 노트, 경과 시간 — 를 소유합니다. '
          + '어디에 띄울지(둘째 창·둘째 모니터·휴대폰)는 앱이 정하고, `channel`이 둘을 맞춰 줍니다.',
      },
    },
  },
};

export default meta;

const NOTE = '적재 큐부터 짚고, 수집 이야기는 질문 나오면 그때.';

const deck = () => [
  <TitleSlide key="t" eyebrow="플랫폼팀" title="파이프라인 개편 보고" subtitle="2026년 3분기 계획 검토" />,
  <ContentSlide key="c" eyebrow="현황" title="수집 지연 현황" notes={NOTE}>
    <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
      <Step at={1} as="li">p95 지연 41분</Step>
      <Step at={2} as="li">적재 큐 대기 28분</Step>
    </ul>
  </ContentSlide>,
  <EndSlide key="e" message="지연 민감 테이블부터, 3분기에 시작합니다." contact="플랫폼팀" />,
];

// Press, then wait for the deck to actually settle there. A fixed delay is
// wrong here: a key handler closes over the step count, which is only known
// after the incoming slide mounts and, on a channel, after the peer answers.
// Pressing again before that lands replays the previous move with a stale
// closure — which is a real presenter hazard, not just a test artefact.
const pressUntil = async (element, key, settled, what) => {
  element.focus();
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  for (let attempt = 0; attempt < 100; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => { setTimeout(resolve, 10); });
    if (settled()) return;
  }
  throw new Error(`Timed out waiting for ${what} after ${key}.`);
};

export const Default = {
  name: 'Presenter View',
  render: () => <PresenterView label="파이프라인 개편 보고 — 발표자" running={false}>{deck()}</PresenterView>,
  play: async ({ canvasElement }) => {
    const view = canvasElement.querySelector('[data-lds-presenter-view]');
    const elapsed = canvasElement.querySelector('[data-presenter-elapsed]');
    const preview = canvasElement.querySelector('[data-presenter-next-slide]');
    const notes = () => canvasElement.querySelector('[data-presenter-notes]').textContent;
    const progress = () => canvasElement.querySelector('[data-presenter-progress]').textContent;

    if (!/^\d{2}:\d{2}$/.test(elapsed.textContent)) {
      throw new Error(`The clock must read mm:ss; got "${elapsed.textContent}".`);
    }

    // The preview is a rehearsal aid, not a second canvas.
    if (preview.getAttribute('aria-hidden') !== 'true') {
      throw new Error('The next-slide preview must stay out of the accessibility tree.');
    }
    if (getComputedStyle(preview).pointerEvents !== 'none') {
      throw new Error('The next-slide preview must not be drivable.');
    }
    if (!preview.textContent.includes('수집 지연 현황')) {
      throw new Error('The preview must show the slide that is actually next.');
    }

    // Notes are the point here, not a mistake to be kept out of the DOM.
    await pressUntil(view, 'ArrowRight', () => progress() === '2 / 3 · 0 / 2', 'the second slide');
    if (!notes().includes(NOTE)) throw new Error('The presenter view must show the current slide notes.');

    // Navigation is the same machine as the audience view: steps first.
    await pressUntil(view, 'ArrowRight', () => progress() === '2 / 3 · 1 / 2', 'the first step');

    // A slide with no notes says so rather than showing the previous one's.
    await pressUntil(view, 'End', () => progress().startsWith('3 / 3'), 'the last slide');
    if (notes().includes(NOTE)) throw new Error('Notes must not leak from the slide that had them.');
    if (!canvasElement.querySelector('[data-presenter-next-empty]')) {
      throw new Error('At the last slide the preview must say so, not sit blank.');
    }
  },
};

function LateJoinDemo() {
  const [joined, setJoined] = React.useState(false);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      <button type="button" data-open-presenter onClick={() => setJoined(true)} style={{ justifySelf: 'start' }}>
        발표자 화면 열기
      </button>
      <DeckViewer channel="story-late-join" label="청중">{deck()}</DeckViewer>
      {joined && <PresenterView channel="story-late-join" label="발표자" running={false}>{deck()}</PresenterView>}
    </div>
  );
}

export const LateJoin = {
  name: '진행 중 참여',
  parameters: {
    docs: {
      description: {
        story:
          '발표가 시작된 뒤에 발표자 화면을 여는 경우입니다. 새로 참여한 뷰는 자기 초기 위치를 '
          + '알리지 않고 **물어봅니다** — 알렸다면 모두를 첫 장으로 되돌렸을 것입니다. 단계까지 '
          + '함께 따라옵니다.',
      },
    },
  },
  render: () => <LateJoinDemo />,
  play: async ({ canvasElement }) => {
    const audience = canvasElement.querySelector('[data-lds-deck-viewer]');
    const audienceAt = () => canvasElement.querySelector('[data-deck-progress]').textContent;
    const presenterAt = () => canvasElement.querySelector('[data-presenter-progress]')?.textContent;

    // Run the talk on for a while before anyone opens the second window.
    await pressUntil(audience, 'ArrowRight', () => audienceAt() === '2 / 3 · 0 / 2', 'the second slide');
    await pressUntil(audience, 'ArrowRight', () => audienceAt() === '2 / 3 · 1 / 2', 'the first step');

    if (presenterAt()) throw new Error('The presenter view has not been opened yet.');
    canvasElement.querySelector('[data-open-presenter]').click();

    for (let attempt = 0; attempt < 100; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => { setTimeout(resolve, 10); });
      if (presenterAt() === '2 / 3 · 1 / 2') break;
    }
    if (presenterAt() !== '2 / 3 · 1 / 2') {
      throw new Error(`A view joining mid-talk must adopt the current position; got "${presenterAt()}".`);
    }
    if (audienceAt() !== '2 / 3 · 1 / 2') {
      throw new Error(`Joining must not drag the room anywhere; audience moved to "${audienceAt()}".`);
    }
  },
};

export const SyncedWithTheAudience = {
  name: '청중 화면과 동기화',
  parameters: {
    docs: {
      description: {
        story:
          '두 뷰가 같은 `channel`로 위치를 주고받습니다. 여기서는 한 페이지에 나란히 두었지만, '
          + '실제로는 발표자 화면이 둘째 창에 있고 `BroadcastChannel`이 같은 오리진의 창들을 잇습니다. '
          + '방향은 양쪽 — 발표자는 앞에 있는 창에서 몰고 갑니다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      <PresenterView channel="story-sync" label="발표자" running={false}>{deck()}</PresenterView>
      <DeckViewer channel="story-sync" label="청중">{deck()}</DeckViewer>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const presenter = canvasElement.querySelector('[data-lds-presenter-view]');
    const audience = canvasElement.querySelector('[data-lds-deck-viewer]');
    const presenterAt = () => canvasElement.querySelector('[data-presenter-progress]').textContent;
    const audienceAt = () => canvasElement.querySelector('[data-deck-progress]').textContent;
    const bothAt = (position) => () => presenterAt() === position && audienceAt() === position;

    if (presenterAt() !== audienceAt()) throw new Error('Both views must open at the same position.');

    // The presenter drives the room.
    await pressUntil(presenter, 'ArrowRight', bothAt('2 / 3 · 0 / 2'), 'the audience to follow the slide');

    // Steps travel too, not just the slide index — otherwise the room sees a
    // reveal the presenter has not made yet.
    await pressUntil(presenter, 'ArrowRight', bothAt('2 / 3 · 1 / 2'), 'the audience to follow the step');

    // And back the other way: whichever window is in front drives.
    await pressUntil(audience, 'End', bothAt('3 / 3'), 'the presenter to follow the audience');
  },
};
