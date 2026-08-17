import React from 'react';
import { WeekSpanRows } from '../src/index.js';

const meta = {
  title: 'Editorial/Week Span Rows',
  component: WeekSpanRows,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '주간 계획의 간트-lite입니다 (주간 업무현황 파일럿에서 승격). 계획 항목이 주차 축 위에 스팬 바로 눕습니다. 주차 칸의 헤어라인 눈금과 칸 중앙 헤더가 시간축을 만들고, 스팬 바는 칸별 조각이 아니라 grid-column 한 몸입니다 — 스팬·레일은 경계에서 끊기지 않는다는 연속성 계약(타임라인 레일과 공통)의 구현입니다. 기간 너머 계속은 바와 같은 토큰의 화살촉이 표 끝을 살짝 넘어서 말합니다.',
      },
    },
  },
};

export default meta;

const GROUPED_WEEKS = ['3주차', '4주차', '1주차'];
const WEEK_GROUPS = [{ label: '8월', span: 2 }, { label: '9월', span: 1 }];
const GROUPED_ROWS = [
  { name: '화재 검출', work: '데이터셋 라벨링 및 1차 학습', from: 0, to: 2, continues: true },
  { name: '쓰러짐 검출', work: '반사광 보완 재검증', from: 0, to: 1, continues: false },
];

const WEEKS = ['8월 2주차', '8월 3주차'];
const ROWS = [
  { name: '화재 검출', work: '화재 데이터셋 수집 및 학습', from: 0, to: 1, continues: true },
  { name: '쓰러짐 검출', work: '실환경 검증 및 테스트', from: 0, to: 0, continues: false },
];

export const Default = {
  name: 'Week Span Rows',
  render: () => <WeekSpanRows label="향후 업무 계획" weeks={WEEKS} rows={ROWS} />,
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('[data-lds-week-span-rows]');
    if (!table) throw new Error('WeekSpanRows must render its table root.');
    // 무단절 계약: 행당 스팬 바는 정확히 한 요소다. 칸별 조각을 이어붙인
    // 스팬은 경계에서 끊기고, 끊긴 스팬은 두 개의 계획으로 읽힌다.
    const bars = table.querySelectorAll('[data-span-bar]');
    if (bars.length !== ROWS.length) {
      throw new Error('Each row lays exactly ONE span bar — fragments break the no-break rule.');
    }
    for (const bar of bars) {
      const bodies = bar.querySelectorAll('span:not([data-span-continues])');
      if (bodies.length !== 1) {
        throw new Error('The span body is a single element crossing its weeks in one piece.');
      }
    }
    // 계속은 화살촉으로만 말한다 — continues 행에만, 바와 같은 토큰으로.
    const heads = table.querySelectorAll('[data-span-continues]');
    if (heads.length !== ROWS.filter((row) => row.continues).length) {
      throw new Error('Only continuing rows end in an arrowhead.');
    }
    // 시간 격자: 주차 헤더는 자기 칸 중앙, 주차 칸은 왼쪽 눈금을 갖는다.
    const headers = [...table.querySelectorAll('[role="columnheader"]:not([data-week-group])')];
    const weekHeaders = headers.slice(2);
    for (const header of weekHeaders) {
      if (getComputedStyle(header).textAlign !== 'center') {
        throw new Error('Week headers center over their columns like axis labels.');
      }
      if (getComputedStyle(header).borderLeftStyle !== 'solid') {
        throw new Error('Every week column carries its left tick — the grid is what makes it an axis.');
      }
    }
    // 기간 내 종료는 촉 없이 둥근 끝 — 정직한 종결 표기.
    const ended = bars[1].querySelector('span');
    if (getComputedStyle(ended).borderTopRightRadius === '0px') {
      throw new Error('A span ending inside the axis closes with a rounded cap, not an arrowhead.');
    }
  },
};

export const GroupedPeriods = {
  name: 'Grouped Periods',
  render: () => (
    <WeekSpanRows
      label="향후 업무 계획"
      weeks={GROUPED_WEEKS}
      groups={WEEK_GROUPS}
      rows={GROUPED_ROWS}
    />
  ),
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('[data-lds-week-span-rows]');
    const groups = [...table.querySelectorAll('[data-week-group]')];
    if (groups.length !== WEEK_GROUPS.length) {
      throw new Error(`Expected ${WEEK_GROUPS.length} period groups, got ${groups.length}.`);
    }

    // 상위 헤더는 자기 구간 위에 정확히 걸친다. 걸침이 틀리면 표가 언제
    // 일했는지에 대해 거짓말을 한다 — 이 도판에서 가장 비싼 오류다.
    const weekHeaders = [...table.querySelectorAll('[role="columnheader"]:not([data-week-group])')].slice(2);
    const august = groups[0].getBoundingClientRect();
    const spanned = [weekHeaders[0], weekHeaders[1]].map((node) => node.getBoundingClientRect());
    if (august.left > spanned[0].left + 1 || august.right < spanned[1].right - 1) {
      throw new Error('The 8월 group must cover exactly the two week columns it declares.');
    }
    const september = groups[1].getBoundingClientRect();
    if (september.left < spanned[1].right - 1) {
      throw new Error('The next group starts where the previous one ends.');
    }

    // 그룹 헤더는 주차 헤더보다 조용하다 — 상위이지 더 중요한 것이 아니다.
    const groupSize = Number.parseFloat(getComputedStyle(groups[0]).fontSize);
    const weekSize = Number.parseFloat(getComputedStyle(weekHeaders[0]).fontSize);
    if (groupSize >= weekSize) {
      throw new Error('A period group names the columns; it does not outrank them.');
    }
  },
};

export const GroupSpanMismatch = {
  name: 'Group Span Mismatch',
  render: () => (
    <WeekSpanRows
      label="구간 합이 기간과 다른 경우"
      weeks={GROUPED_WEEKS}
      groups={[{ label: '8월', span: 2 }]}
      rows={GROUPED_ROWS}
    />
  ),
  play: async ({ canvasElement }) => {
    // 짧게 그리고 마는 대신 신고한다. 조용히 짧은 상위 헤더는 마지막 열이
    // 어느 기간에 속하는지에 대한 침묵이고, 그 침묵을 독자는 못 본다.
    const notice = canvasElement.querySelector('[data-week-group-mismatch]');
    if (!notice) throw new Error('Groups that do not cover the axis must be reported on the canvas.');
    if (!notice.textContent.includes('2') || !notice.textContent.includes('3')) {
      throw new Error('The report names both numbers so the author can see which side is wrong.');
    }
  },
};
