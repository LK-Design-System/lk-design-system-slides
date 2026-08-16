import React from 'react';
import { StatusBadge } from '@lk-design-system/lds-core';
import { KeyFigure, PictogramRow } from '../src/index.js';

// One dataset, two treatments. Fleet size: 96 AMRs last year, 128 this year (+33%).
const LAST_YEAR = 96;
const THIS_YEAR = 128;

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

// The violation icon: a robot glyph whose width AND height scale with the
// value, so a 1.33x quantity reads as a 1.78x area — the classic magnitude sin.
function RobotIcon({ scale, color }) {
  const size = 72 * scale;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
      <rect x="5" y="8" width="14" height="11" rx="2" fill={color} />
      <rect x="8" y="3" width="8" height="5" rx="1.5" fill={color} />
      <circle cx="10" cy="12" r="1.4" fill="var(--color-semantic-static-white)" />
      <circle cx="14" cy="12" r="1.4" fill="var(--color-semantic-static-white)" />
      <rect x="7" y="19" width="3" height="2.5" fill={color} />
      <rect x="14" y="19" width="3" height="2.5" fill={color} />
    </svg>
  );
}

const meta = {
  title: 'Methodology/Worked Example: Magnitude',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '같은 수량 비교를 픽토그램 왜곡 판과 절차 준수 판으로 나란히 보여주는 교육 표면입니다. 면적 왜곡·값 미병기·강조 남발이 어떻게 고쳐지는지 play 단언이 검증합니다.',
      },
    },
  },
};

export default meta;

export const BeforeAfter = {
  name: 'Before / After',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--space-6)', maxWidth: 1180 }}>
      {/* 절차를 어긴 판 — 값 없는 픽토그램, 면적 왜곡, 양쪽 다 강조. */}
      <section data-example="violation" style={panelStyle}>
        <PanelHeader tone="negative" badge="절차 위반" title="AMR 운영 현황" />
        <div data-violation-figure style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-10)', padding: 'var(--space-4) 0' }}>
          <div style={{ display: 'grid', gap: 'var(--space-2)', justifyItems: 'center' }}>
            <RobotIcon scale={1} color="var(--color-semantic-status-cautionary)" />
            <span style={{ fontSize: 'var(--label1-size)', color: 'var(--color-semantic-label-neutral)' }}>작년</span>
          </div>
          <div style={{ display: 'grid', gap: 'var(--space-2)', justifyItems: 'center' }}>
            <RobotIcon scale={THIS_YEAR / LAST_YEAR} color="var(--color-semantic-status-negative)" />
            <span style={{ fontSize: 'var(--label1-size)', fontWeight: 'var(--fw-bold)', color: 'var(--color-semantic-status-negative)' }}>올해 급증!</span>
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
          <li>숫자 부재 — 그래픽이 유일한 채널</li>
          <li>가로·세로 동시 확대 — 33% 증가가 두 배 가까운 면적으로 과장</li>
          <li>두 해 모두 경고색 — 주장 없이 감탄만</li>
          <li>출처·기준 시점 없음</li>
        </ul>
      </section>

      {/* 절차를 지킨 판 — 주장형 제목, 값 병기, 스케일 범례, 강조 하나. */}
      <section data-example="compliant" style={panelStyle}>
        <PanelHeader tone="positive" badge="절차 준수" title="AMR 운영 대수 1년 새 33% 증가" />
        <KeyFigure
          value={String(THIS_YEAR)}
          unit="대"
          label="2026년 운영 대수"
          claim="증설분 전량 신규 물류동 배치"
          source="출처: 자산 관리 대장, 2026-07 기준"
          emphasis
        />
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <PictogramRow value={LAST_YEAR} per={10} unitLabel="대" label="2025년" tone="muted" />
          <PictogramRow value={THIS_YEAR} per={10} unitLabel="대" label="2026년" />
        </div>
      </section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const violation = canvasElement.querySelector('[data-example="violation"]');
    const compliant = canvasElement.querySelector('[data-example="compliant"]');
    if (!violation || !compliant) {
      throw new Error('The worked example must render both the violation and compliant panels.');
    }

    // 대비 증명 — 위반 판의 도판에는 숫자가 없어야 "값 미병기"가 성립한다.
    const violationFigure = violation.querySelector('[data-violation-figure]');
    if (/\d/.test(violationFigure.textContent)) {
      throw new Error('The violation figure must actually omit the values to demonstrate the sin.');
    }

    // 절차 2 — 주장형 제목, 명사형 종결.
    const claim = compliant.querySelector('[data-panel-title]');
    if (!claim?.textContent.includes('33%')) {
      throw new Error('The compliant title must state the claim, not repeat the data name.');
    }
    if (/다[.!]?$/.test(claim.textContent.trim())) {
      throw new Error('Korean headlines must end with a noun, not a declarative ending.');
    }

    // 검증 체크리스트 — 정확한 값의 텍스트 병기 (양쪽 연도 모두).
    const values = Array.from(compliant.querySelectorAll('[data-pictogram-value]')).map((node) => node.textContent);
    if (!values.some((text) => text.includes('96')) || !values.some((text) => text.includes('128'))) {
      throw new Error('Both quantities must be visible as exact text beside the pictograms.');
    }

    // 검증 체크리스트 — 스케일 범례 선언 (per=10인 두 행 모두).
    if (compliant.querySelectorAll('[data-pictogram-scale]').length !== 2) {
      throw new Error('Every scaled pictogram row must declare its unit scale.');
    }

    // 절차 4 — 강조는 하나: 비교 행 중 한 행만 emphasis 톤을 가진다.
    const emphasisRows = compliant.querySelectorAll('[data-lds-pictogram-row][data-tone="emphasis"]');
    const mutedRows = compliant.querySelectorAll('[data-lds-pictogram-row][data-tone="muted"]');
    if (emphasisRows.length !== 1 || mutedRows.length !== 1) {
      throw new Error('In a comparison, exactly one pictogram row may carry the emphasis tone.');
    }

    // 검증 체크리스트 — 출처·기준 시점.
    if (!compliant.querySelector('[data-key-figure-source]')?.textContent.includes('출처')) {
      throw new Error('The compliant panel must cite its source and reference period.');
    }

    // 그래픽 카피의 명사형 종결 — 주장 줄도 서술형으로 끝나지 않는다.
    const claimLine = compliant.querySelector('[data-key-figure-claim]')?.childNodes[0]?.textContent.trim();
    if (!claimLine || /다[.!]?$/.test(claimLine)) {
      throw new Error('Graphic copy must end with a noun, not a declarative sentence.');
    }

    // 픽토그램은 수량을 왜곡하지 않는다 — 단위 개수가 값/스케일과 일치한다 (96→9+부분1, 128→12+부분1).
    const rows = compliant.querySelectorAll('[data-lds-pictogram-row]');
    const countUnits = (row, state) => row.querySelectorAll(`[data-pictogram-unit="${state}"]`).length;
    if (countUnits(rows[0], 'filled') !== 9 || countUnits(rows[0], 'partial') !== 1) {
      throw new Error('96 at 10 per unit must render 9 full units and 1 partial unit.');
    }
    if (countUnits(rows[1], 'filled') !== 12 || countUnits(rows[1], 'partial') !== 1) {
      throw new Error('128 at 10 per unit must render 12 full units and 1 partial unit.');
    }
  },
};
