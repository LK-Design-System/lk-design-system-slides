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
    const headers = [...table.querySelectorAll('[role="columnheader"]')];
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
