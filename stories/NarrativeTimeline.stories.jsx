import React from 'react';
import { NarrativeTimeline } from '../src/index.js';

const meta = {
  title: 'Editorial/Narrative Timeline',
  component: NarrativeTimeline,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '주장을 담는 시간렬입니다. 렌더링은 Core Timeline이 하고, 이 층은 시간순 강제 정렬·날짜 없는 사건의 각주 강등·강조 1개 계약을 소유합니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Narrative Timeline',
  render: () => (
    <NarrativeTimeline
      style={{ maxWidth: 520 }}
      // 입력은 뒤섞여 있고, 강조는 두 사건이 요청하며, 한 사건은 날짜가 없다.
      events={[
        { id: 'redeploy', date: '2026-05-30', label: '재배포 시작' },
        { id: 'pilot', date: '2025-11-20', label: '파일럿 운행 시작' },
        { id: 'gate', date: '2026-05-12', label: '검증 게이트 도입', body: '시뮬레이션 통과를 배포 조건으로 전환', emphasis: true },
        { id: 'halt', date: '2026-02-14', label: '1차 배포 중단', emphasis: true },
        { id: 'legacy', label: '구형 라우팅 첫 도입' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-lds-narrative-timeline]');
    if (!root) throw new Error('NarrativeTimeline must render.');

    // 시간순 강제 정렬 — 입력 순서와 무관하게 DOM이 시간순이다.
    const times = Array.from(root.querySelectorAll('time')).map((node) => node.getAttribute('datetime'));
    const sorted = [...times].sort((a, b) => a.localeCompare(b));
    if (times.length !== 4 || times.join() !== sorted.join()) {
      throw new Error('Events must render in chronological order regardless of input order.');
    }

    // 날짜 없는 사건은 시간렬에 오를 수 없다 — 각주로 강등된다.
    const undated = root.querySelector('[data-timeline-undated]');
    if (!undated?.textContent.includes('구형 라우팅 첫 도입')) {
      throw new Error('An undated event must be demoted to the visible footnote, never placed on the rail.');
    }
    const railEvents = Array.from(root.querySelectorAll('[data-timeline-event]')).map((node) => node.textContent);
    if (railEvents.some((text) => text.includes('구형 라우팅'))) {
      throw new Error('The rail must not carry an event whose date is unknown.');
    }

    // 강조는 하나 — 입력 배열의 첫 요청(검증 게이트)이 이긴다.
    const emphasized = root.querySelectorAll('[data-timeline-event][data-event-emphasis="true"]');
    if (emphasized.length !== 1 || !emphasized[0].textContent.includes('검증 게이트')) {
      throw new Error('Two events requested emphasis; the first request (검증 게이트 도입) must win.');
    }

    // 접근성 이름이 강조 사건을 말한다.
    const list = root.querySelector('ol');
    if (!list?.getAttribute('aria-label')?.includes('검증 게이트 도입')) {
      throw new Error('The accessible name must carry the emphasized event.');
    }
  },
};

export const CrowdedRow = {
  name: 'Crowded Row',
  render: () => (
    // 좁은 컨테이너(720px)에 여덟 사건 — 균등 분할이면 컬럼 ~66px로 전 라벨이
    // 세로로 접히는 분량. 바닥 계약이 이를 가로 넘침으로 바꿔 신고하게 한다.
    <div data-crowded-frame style={{ width: 720, overflow: 'hidden', border: '1px dashed var(--color-semantic-line-normal-normal)' }}>
      <NarrativeTimeline
        direction="row"
        events={[
          { id: 'p1', date: '2026-08', label: '1차: 지연 민감 테이블 이관' },
          { id: 'p2', date: '2026-10', label: '2차: 운영 검증' },
          { id: 'p3', date: '2026-11', label: '확대 여부 결정' },
          { id: 'p4', date: '2027-01', label: '3차: 파생 테이블 이관' },
          { id: 'p5', date: '2027-02', label: '4차: 배치 경로 축소' },
          { id: 'p6', date: '2027-03', label: '5차: 이중화 해제' },
          { id: 'p7', date: '2027-04', label: '전 경로 전환 완료' },
          { id: 'p8', date: '2027-05', label: '회고' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // 조용한 열화의 차단 계약. 상류의 가로 레일은 minmax(0,1fr)로 무한 분할
    // 하고, 좁아진 글은 아래로 감겨서 오버플로 게이트의 자에 안 잡힌다
    // (1280 캔버스 실측: 6개 164px에서 제목이 접히기 시작, 8개 117px에서
    // 전부 세로 낭독). 개수 상한은 양방향으로 거짓말이라(긴 라벨 4개도 좁고
    // 짧은 6개도 괜찮다) 계약은 폭이다: 컬럼은 바닥 아래로 줄어들지 않고,
    // 넘치는 분량은 가로 넘침이 되어 기존 게이트의 측정 축에 오른다.
    const root = canvasElement.querySelector('[data-lds-narrative-timeline]');
    const frame = canvasElement.querySelector('[data-crowded-frame]');
    const columns = root.querySelectorAll('ol > li');
    if (columns.length !== 8) throw new Error(`Expected 8 rail events, got ${columns.length}.`);

    const floorProbe = document.createElement('div');
    floorProbe.style.width = 'var(--editorial-timeline-col-floor, 180px)';
    frame.append(floorProbe);
    const floor = floorProbe.getBoundingClientRect().width;
    floorProbe.remove();

    for (const column of columns) {
      if (column.getBoundingClientRect().width < floor - 1) {
        throw new Error(`A rail column shrank to ${Math.round(column.getBoundingClientRect().width)}px — the floor is ${floor}px; crowding must overflow, not fold the labels.`);
      }
    }
    if (frame.scrollWidth <= frame.clientWidth) {
      throw new Error('Eight events in a 720px frame must overflow horizontally — if this fits, the floor is not holding and the labels are folding instead.');
    }
  },
};
