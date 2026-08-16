import React from 'react';
import { StatusBadge } from '@lk-design-system/lds-core';
import { NarrativeTimeline } from '../src/index.js';

// One project history, two treatments. Irregular intervals: months apart, then weeks.
const EVENTS = [
  { id: 'pilot', date: '2025-11-20', label: '파일럿 운행 시작' },
  { id: 'halt', date: '2026-02-14', label: '1차 배포 중단', body: '교차로 정체 반복으로 회수' },
  { id: 'gate', date: '2026-05-12', label: '검증 게이트 도입', body: '시뮬레이션 통과를 배포 조건으로 전환', emphasis: true },
  { id: 'redeploy', date: '2026-05-30', label: '재배포 시작' },
  { id: 'done', date: '2026-07-10', label: '전 라인 배포 완료' },
];

const LOUD = [
  'var(--color-semantic-status-negative)',
  'var(--color-semantic-status-cautionary)',
  'var(--color-semantic-status-positive)',
  'var(--color-semantic-status-negative)',
  'var(--color-semantic-status-cautionary)',
];

const panelStyle = {
  border: '1px solid var(--color-semantic-line-normal-normal)',
  borderRadius: 'var(--radius-md, 12px)',
  background: 'var(--color-semantic-background-elevated-normal)',
  padding: 'var(--space-5) var(--space-6)',
  display: 'grid',
  gap: 'var(--space-4)',
  alignContent: 'start',
};

function PanelHeader({ tone, badge, title }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)', justifyItems: 'start' }}>
      <StatusBadge tone={tone}>{badge}</StatusBadge>
      <h3
        data-panel-title
        style={{
          margin: 0,
          fontSize: 'var(--headline1-size)',
          lineHeight: 'var(--headline1-line)',
          fontWeight: 'var(--fw-semibold)',
          color: 'var(--color-semantic-label-strong)',
        }}
      >
        {title}
      </h3>
    </div>
  );
}

const meta = {
  title: 'Methodology/Worked Example: Timeline',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '같은 프로젝트 이력을 균일 간격 장식 판과 절차 준수 판으로 나란히 보여주는 교육 표면입니다. 날짜 부재·간격 왜곡·강조 남발이 어떻게 고쳐지는지 play 단언이 검증합니다.',
      },
    },
  },
};

export default meta;

export const BeforeAfter = {
  name: 'Before / After',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--space-6)', maxWidth: 1180 }}>
      {/* 절차를 어긴 판 — 날짜 없음, 균일 간격, 모든 사건이 소리침. */}
      <section data-example="violation" style={panelStyle}>
        <PanelHeader tone="negative" badge="절차 위반" title="프로젝트 타임라인" />
        <div data-violation-figure style={{ display: 'grid', gap: 'var(--space-2)', padding: 'var(--space-4) 0' }}>
          <div style={{ position: 'relative', height: 2, background: 'var(--color-semantic-line-solid-normal)', margin: '0 var(--space-4)' }}>
            {EVENTS.map((event, index) => (
              <span
                key={event.id}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: `${(index / (EVENTS.length - 1)) * 100}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: LOUD[index],
                  border: '2px solid var(--color-semantic-background-elevated-normal)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 var(--space-1)' }}>
            {['파일럿', '중단', '게이트', '재배포', '완료'].map((label, index) => (
              <span key={label} style={{ fontSize: 'var(--label2-size)', fontWeight: 'var(--fw-bold)', color: LOUD[index] }}>
                {label}
              </span>
            ))}
          </div>
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: '1.2em',
            fontSize: 'var(--label2-size)',
            lineHeight: 'var(--label2-line)',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          <li>날짜 부재 — 발생 시점 식별 불가</li>
          <li>균일 간격 — 석 달의 공백과 2주의 질주가 같은 길이</li>
          <li>다섯 사건 전부 경고색 — 전환점 식별 불가</li>
          <li>데이터 이름만 반복하는 제목, 출처 없음</li>
        </ul>
      </section>

      {/* 절차를 지킨 판 — 주장형 명사 제목, 날짜 명시, 강조 하나, 출처. */}
      <section data-example="compliant" style={panelStyle}>
        <PanelHeader tone="positive" badge="절차 준수" title="검증 게이트 도입 후 8주 만에 전 라인 배포 완료" />
        <NarrativeTimeline events={EVENTS} />
        <p
          data-compliant-source
          style={{
            margin: 0,
            fontSize: 'var(--caption1-size)',
            lineHeight: 'var(--caption1-line)',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          출처: 배포 이력 대장, 2026-07-10 기준 · 간격은 기간을 측정하지 않음
        </p>
      </section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const violation = canvasElement.querySelector('[data-example="violation"]');
    const compliant = canvasElement.querySelector('[data-example="compliant"]');
    if (!violation || !compliant) {
      throw new Error('The worked example must render both the violation and compliant panels.');
    }

    // 대비 증명 — 위반 판의 도판에는 날짜가 없어야 예시가 성립한다.
    const violationFigure = violation.querySelector('[data-violation-figure]');
    if (/\d/.test(violationFigure.textContent)) {
      throw new Error('The violation figure must actually omit the dates to demonstrate the sin.');
    }

    // 절차 2 — 주장형 제목, 명사형 종결.
    const claim = compliant.querySelector('[data-panel-title]');
    if (!claim?.textContent.includes('8주')) {
      throw new Error('The compliant title must state the claim, not repeat the data name.');
    }
    if (/다[.!]?$/.test(claim.textContent.trim())) {
      throw new Error('Korean headlines must end with a noun, not a declarative ending.');
    }

    // 검증 체크리스트 — 모든 사건이 기계 판독 가능한 날짜를 가진다.
    const root = compliant.querySelector('[data-lds-narrative-timeline]');
    const times = Array.from(root.querySelectorAll('time')).map((node) => node.getAttribute('datetime'));
    if (times.length !== EVENTS.length || times.some((value) => !/^\d{4}-\d{2}-\d{2}$/.test(value))) {
      throw new Error('Every event must carry an explicit machine-readable date.');
    }

    // 시간순 정렬이 유지된다.
    const sorted = [...times].sort((a, b) => a.localeCompare(b));
    if (times.join() !== sorted.join()) {
      throw new Error('Events must render in chronological order.');
    }

    // 절차 4 — 강조는 하나, 주장의 전환점(검증 게이트)이다.
    const emphasized = root.querySelectorAll('[data-timeline-event][data-event-emphasis="true"]');
    if (emphasized.length !== 1 || !emphasized[0].textContent.includes('검증 게이트')) {
      throw new Error('Exactly one event may carry emphasis, and it must be the turning point of the claim.');
    }

    // 검증 체크리스트 — 출처, 그리고 간격이 기간을 측정하지 않는다는 선언.
    const source = compliant.querySelector('[data-compliant-source]');
    if (!source?.textContent.includes('출처') || !source.textContent.includes('간격은 기간을 측정하지 않음')) {
      throw new Error('The compliant panel must cite its source and declare that spacing is not duration.');
    }
  },
};
