import React from 'react';
import { StatusAssessment } from '../src/index.js';

const meta = {
  title: 'Editorial/Status Assessment',
  component: StatusAssessment,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '목표 대비 실적의 판정 프레임입니다. 판정 어휘는 닫혀 있고(달성·주의·미달), 색은 이탈만 표시합니다 — 달성 배지는 그린이 아니라 무채색입니다. 어휘 밖 판정은 중립으로 뭉개지 않고 "판정 미상"으로 노출합니다.',
      },
    },
  },
};

export default meta;

const METRICS = [
  { id: 'p95', group: '성능', name: '수집–반영 p95 지연', target: '20분', actual: '18분', status: 'met' },
  { id: 'uptime', group: '성능', name: '파이프라인 가동률', target: '99.9%', actual: '99.7%', status: 'watch' },
  { id: 'cost', group: '비용', name: '월 운영 비용', target: '₩42M', actual: '₩51M', status: 'missed' },
  { id: 'tables', group: '비용', name: '이관 테이블 수', target: '5개', actual: '5개', status: 'met' },
];

export const Default = {
  name: 'Status Assessment',
  render: () => (
    <StatusAssessment metrics={METRICS} caption="3분기 6주차 기준 (데모 데이터)" />
  ),
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector('[data-lds-status-assessment]');
    if (!frame) throw new Error('StatusAssessment must render its frame.');
    // 판정은 항상 텍스트로 병기된다.
    const statuses = frame.querySelectorAll('[data-assessment-status]');
    if (statuses.length !== 4) throw new Error('Every metric must carry a judged status cell.');
    for (const cell of statuses) {
      if (!/달성|주의|미달/.test(cell.textContent)) {
        throw new Error('Statuses must be spoken in text — the tint is an auxiliary channel.');
      }
    }
    // 정상은 무채색 — 달성 배지는 그린(positive)이 아니라 무채색 배지를 입는다.
    if (frame.querySelector('.lk-status-badge--positive')) {
      throw new Error('A met metric wears the achromatic badge, never green — color marks deviation only.');
    }
    const met = frame.querySelector('[data-assessment-status="met"] [class*="lk-status-badge"]');
    if (!met || !met.className.includes('lk-status-badge--normal')) {
      throw new Error('The met badge must resolve to the neutral (achromatic) tone.');
    }
    // 이탈만 색을 입는다.
    if (
      !frame.querySelector('[data-assessment-status="watch"] .lk-status-badge--cautionary') ||
      !frame.querySelector('[data-assessment-status="missed"] .lk-status-badge--negative')
    ) {
      throw new Error('Deviations must carry their status tint (watch → cautionary, missed → negative).');
    }
    // 그룹 헤더는 연속 구간당 한 번, 표 의미론은 유지된다. 표 자체는 Core의
    // Table이 소유하므로(rc.69.27의 groupKey 위임) 마커도 업스트림 것이다 —
    // 이 층이 단언하는 것은 판정 어휘와 위임이 실제로 서 있다는 사실이다.
    if (frame.querySelectorAll('[data-table-group]').length !== 2) {
      throw new Error('Each contiguous group must render exactly one group header.');
    }
    if (frame.querySelectorAll('th[scope="row"]').length !== 4) {
      throw new Error('Metric names must remain row headers for assistive tech.');
    }
    // 밴드는 전 데이터 행 — 위임 후에도 넓은 표의 행 결속은 유지된다.
    if (frame.querySelectorAll('tbody tr[data-banded]').length !== 4) {
      throw new Error('Every data row keeps its band after delegating the table upstream.');
    }
  },
};

export const UnknownStatus = {
  name: 'Unknown Status',
  render: () => (
    <StatusAssessment
      metrics={[{ id: 'x', name: '신규 지표', target: '10', actual: '9', status: 'pending-review' }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const warning = canvasElement.querySelector('[data-assessment-status-unknown]');
    if (!warning || !warning.textContent.includes('pending-review')) {
      throw new Error('A status outside the vocabulary must be visibly reported, not coerced to neutral.');
    }
    if (canvasElement.querySelector('[class*="lk-status-badge"]')) {
      throw new Error('An unjudged row must not wear any badge.');
    }
  },
};
