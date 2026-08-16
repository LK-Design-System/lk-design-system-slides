import React from 'react';
import { StatusBadge } from '@lk-design-system/lds-core';
import { BeforeAfter } from '../src/index.js';

// One dataset, two treatments. Daily throughput of five stations vs a 100-unit target.
const STATIONS = [
  { id: 'a', label: 'A스테이션', value: 112 },
  { id: 'b', label: 'B스테이션', value: 96 },
  { id: 'c', label: 'C스테이션', value: 130 },
  { id: 'd', label: 'D스테이션', value: 88 },
  { id: 'e', label: 'E스테이션', value: 100 },
];
const TARGET = 100;

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
  title: 'Methodology/Worked Example: Deviation',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '같은 목표 대비 실적을 기준 없는 색깔 막대 판과 절차 준수 판으로 나란히 보여주는 교육 표면입니다. 기준 부재·색 전용 판정이 어떻게 고쳐지는지 play 단언이 검증합니다.',
      },
    },
  },
};

export default meta;

export const BeforeAfterStory = {
  name: 'Before / After',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--space-6)', maxWidth: 1180 }}>
      {/* 절차를 어긴 판 — 기준선 없음, 잘린 축, 달성/미달을 색으로만 판정, 값 없음. */}
      <section data-example="violation" style={panelStyle}>
        <PanelHeader tone="negative" badge="절차 위반" title="스테이션별 처리량" />
        <div data-violation-figure style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-6)', height: 120, padding: '0 var(--space-4)' }}>
            {STATIONS.map((station) => (
              <div key={station.id} style={{ display: 'grid', gap: 'var(--space-1)', justifyItems: 'center', flex: 1 }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: 40,
                    // 80에서 잘린 축: 8~50px — 130건이 88건의 다섯 배처럼 보인다.
                    height: (station.value - 80) * 2,
                    borderRadius: '3px 3px 0 0',
                    background:
                      station.value >= TARGET
                        ? 'var(--color-semantic-status-positive)'
                        : 'var(--color-semantic-status-negative)',
                  }}
                />
                <span style={{ fontSize: 'var(--label2-size)', color: 'var(--color-semantic-label-neutral)' }}>{station.label.replace('스테이션', '')}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--label2-size)', color: 'var(--color-semantic-label-neutral)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-semantic-status-positive)' }} />
              달성
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-semantic-status-negative)' }} />
              미달
            </span>
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
          <li>기준선 부재 — 목표치 식별 불가</li>
          <li>색 전용 달성/미달 판정 — 흑백에서 판정 소멸</li>
          <li>80에서 잘린 축 — 130건이 88건의 다섯 배로 과장</li>
          <li>값·편차·출처 없음</li>
        </ul>
      </section>

      {/* 절차를 지킨 판 — 주장형 제목, 명시된 기준, 부호 텍스트, 강조 하나, 출처. */}
      <section data-example="compliant" style={panelStyle}>
        <PanelHeader tone="positive" badge="절차 준수" title="D스테이션만 목표 대비 12건 미달" />
        <BeforeAfter
          reference={{ value: TARGET, label: '목표 100건' }}
          unitLabel="건"
          items={STATIONS.map((station) => (station.id === 'd' ? { ...station, emphasis: true } : station))}
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
          출처: 스테이션 일 처리량, 2026-07-29 집계 · 목표는 분기 운영 계획 기준
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

    // 대비 증명 — 위반 판의 도판에는 기준도 값도 없어야 예시가 성립한다.
    const violationFigure = violation.querySelector('[data-violation-figure]');
    if (violationFigure.textContent.includes('목표') || /\d/.test(violationFigure.textContent)) {
      throw new Error('The violation figure must actually omit the target and the values.');
    }

    // 절차 2 — 주장형 제목, 명사형 종결.
    const claim = compliant.querySelector('[data-panel-title]');
    if (!claim?.textContent.includes('12건 미달')) {
      throw new Error('The compliant title must state the claim, not repeat the data name.');
    }
    if (/다[.!]?$/.test(claim.textContent.trim())) {
      throw new Error('Korean headlines must end with a noun, not a declarative ending.');
    }

    // 검증 체크리스트 — 기준이 눈에 보이게 표기된다.
    const root = compliant.querySelector('[data-lds-before-after]');
    if (!root.querySelector('[data-reference-label]')?.textContent.includes('목표 100건')) {
      throw new Error('The compliant panel must state its reference baseline.');
    }

    // 검증 체크리스트 — 모든 편차가 부호 텍스트로 병기된다.
    const values = Array.from(root.querySelectorAll('[data-deviation-value]')).map((node) => node.textContent);
    if (values.length !== STATIONS.length || !values.includes('−12건') || !values.includes('+30건')) {
      throw new Error('Every deviation must be visible as signed text.');
    }

    // 절차 4 — 강조는 하나, 주장의 주인공(D스테이션)이다.
    const emphasized = root.querySelectorAll('[data-deviation-item][data-deviation-emphasis="true"]');
    if (emphasized.length !== 1 || !emphasized[0].textContent.includes('D스테이션')) {
      throw new Error('Exactly one item may carry emphasis, and it must be the subject of the claim.');
    }

    // 방향은 색이 아니라 막대 위치가 말한다.
    const count = (direction) => root.querySelectorAll(`[data-deviation-bar][data-deviation-direction="${direction}"]`).length;
    if (count('above') !== 2 || count('below') !== 2 || count('at') !== 1) {
      throw new Error('Bar directions must match the sign of each deviation.');
    }

    // 검증 체크리스트 — 출처·기준 시점.
    if (!compliant.querySelector('[data-compliant-source]')?.textContent.includes('출처')) {
      throw new Error('The compliant panel must cite its source and reference period.');
    }
  },
};
