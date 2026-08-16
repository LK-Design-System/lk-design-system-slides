import React from 'react';
import { StatusBadge } from '@lk-design-system/lds-core';
import { RankShift } from '../src/index.js';

// One dataset, two treatments. Pick-rate ranking of five lines, 2025 vs 2026.
const ITEMS = [
  { id: 'a', label: 'A라인', start: 1, end: 2 },
  { id: 'b', label: 'B라인', start: 2, end: 3 },
  { id: 'c', label: 'C라인', start: 4, end: 1 },
  { id: 'd', label: 'D라인', start: 3, end: 4 },
  { id: 'e', label: 'E라인', start: 5, end: 5 },
];

const RAINBOW = [
  'var(--color-semantic-status-negative)',
  'var(--color-semantic-status-cautionary)',
  'var(--color-semantic-status-positive)',
  'var(--color-semantic-primary-normal)',
  'var(--color-semantic-accent-blue-text, #336CA1)',
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
  title: 'Methodology/Worked Example: Ranking',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '같은 순위 데이터를 무지개 스파게티 판과 절차 준수 판으로 나란히 보여주는 교육 표면입니다. 색 전용 범례·주장 부재가 어떻게 고쳐지는지 play 단언이 검증합니다.',
      },
    },
  },
};

export default meta;

export const BeforeAfter = {
  name: 'Before / After',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--space-6)', maxWidth: 1180 }}>
      {/* 절차를 어긴 판 — 순위 숫자 없음, 색 전용 범례, 다섯 색이 전부 소리침. */}
      <section data-example="violation" style={panelStyle}>
        <PanelHeader tone="negative" badge="절차 위반" title="라인별 순위 변화" />
        <div data-violation-figure style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <svg viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true" style={{ width: '100%', height: 140, display: 'block' }}>
            {ITEMS.map((item, index) => (
              <line
                key={item.id}
                x1="0"
                y1={(item.start - 0.5) * 28}
                x2="100"
                y2={(item.end - 0.5) * 28}
                stroke={RAINBOW[index]}
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {ITEMS.map((item, index) => (
              <span key={item.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--label2-size)', color: 'var(--color-semantic-label-neutral)' }}>
                <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 2, background: RAINBOW[index] }} />
                {item.label}
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
          <li>순위 숫자 부재 — 선 끝의 순위 식별 불가</li>
          <li>색 전용 범례 — 선과 이름을 잇는 유일한 채널이 색</li>
          <li>다섯 색 전부 강조 — 주장 식별 불가</li>
          <li>데이터 이름만 반복하는 제목, 출처 없음</li>
        </ul>
      </section>

      {/* 절차를 지킨 판 — 주장형 제목, 직접 라벨링, 강조 하나, 출처. */}
      <section data-example="compliant" style={panelStyle}>
        <PanelHeader tone="positive" badge="절차 준수" title="C라인 1위 달성, 4위에서 세 계단 상승" />
        <RankShift
          startLabel="2025"
          endLabel="2026"
          items={ITEMS.map((item) => (item.id === 'c' ? { ...item, emphasis: true } : item))}
        />
        <p
          data-compliant-source
          style={{
            margin: 0,
            fontSize: 'var(--caption1-size)',
            lineHeight: 'var(--caption1-line)',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          출처: 라인별 pick rate 연간 순위, 2026-07 기준 · 동일 집계 기준
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

    // 대비 증명 — 위반 판의 도판에는 순위 숫자가 없어야 "직접 라벨링 부재"가 성립한다.
    const violationFigure = violation.querySelector('[data-violation-figure]');
    if (/\d/.test(violationFigure.textContent)) {
      throw new Error('The violation figure must actually omit the ranks to demonstrate the sin.');
    }

    // 절차 2 — 주장형 제목, 명사형 종결.
    const claim = compliant.querySelector('[data-panel-title]');
    if (!claim?.textContent.includes('1위 달성')) {
      throw new Error('The compliant title must state the claim, not repeat the data name.');
    }
    if (/다[.!]?$/.test(claim.textContent.trim())) {
      throw new Error('Korean headlines must end with a noun, not a declarative ending.');
    }

    // 검증 체크리스트 — 직접 라벨링: 모든 항목이 양쪽에 순위 텍스트를 가진다.
    const rankShift = compliant.querySelector('[data-lds-rank-shift]');
    if (
      rankShift.querySelectorAll('[data-rank-label-start]').length !== ITEMS.length ||
      rankShift.querySelectorAll('[data-rank-label-end]').length !== ITEMS.length
    ) {
      throw new Error('Every item must be labeled directly with its rank on both sides.');
    }

    // 절차 4 — 강조는 하나, 주장의 주인공(C라인)이다.
    const emphasizedLabels = rankShift.querySelectorAll('[data-rank-label-end][data-rank-emphasis="true"]');
    if (emphasizedLabels.length !== 1 || !emphasizedLabels[0].textContent.includes('C라인')) {
      throw new Error('Exactly one item may carry emphasis, and it must be the subject of the claim.');
    }
    if (rankShift.querySelectorAll('[data-rank-line][data-rank-emphasis="true"]').length !== 1) {
      throw new Error('Exactly one slope line may carry the emphasis stroke.');
    }

    // 검증 체크리스트 — 출처·기준 시점.
    if (!compliant.querySelector('[data-compliant-source]')?.textContent.includes('출처')) {
      throw new Error('The compliant panel must cite its source and reference period.');
    }
  },
};
