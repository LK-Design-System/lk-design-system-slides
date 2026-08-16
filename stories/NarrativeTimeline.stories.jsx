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
