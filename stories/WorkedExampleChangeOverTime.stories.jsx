import React from 'react';
import { StatusBadge } from '@lk-design-system/lds-core';
import { LineChart } from '@lk-design-system/lds-product';
import { AnnotatedFigure } from '../src/index.js';

// One dataset, two treatments. Weekly AMR throughput; routing swap lands week 6.
const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const THROUGHPUT = [812, 798, 805, 840, 833, 905, 918, 1024, 1041];
const POINTS = WEEKS.map((week, index) => ({ x: week, y: THROUGHPUT[index] }));

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
  title: 'Methodology/Worked Example: Change over Time',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '같은 데이터를 방법론 절차를 어긴 판과 지킨 판으로 나란히 보여주는 교육 표면입니다. 지킨 판의 규칙 준수는 play 단언이 검증합니다.',
      },
    },
  },
};

export default meta;

export const BeforeAfter = {
  name: 'Before / After',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--space-6)', maxWidth: 1180 }}>
      {/* 절차를 어긴 판 — 질문·주장 없음, 잘린 축, 강조 남발, 출처 없음. */}
      <section data-example="violation" style={panelStyle}>
        <PanelHeader tone="negative" badge="절차 위반" title="주간 처리량 추이" />
        <LineChart
          aria-label="주간 처리량 추이 (절차 위반 예시)"
          width={460}
          height={220}
          includeZero={false}
          yDomain={[780, 1060]}
          xTicks={WEEKS}
          series={[{ name: 'AMR-A', color: 'var(--color-semantic-status-negative)', points: POINTS }]}
          referenceLines={[
            { y: 900, label: '목표!', color: 'var(--color-semantic-status-cautionary)' },
            { y: 1000, label: '신기록!', color: 'var(--color-semantic-status-positive)' },
          ]}
        />
        <ul
          style={{
            margin: 0,
            paddingLeft: '1.2em',
            fontSize: 'var(--label2-size)',
            lineHeight: 'var(--label2-line)',
            color: 'var(--color-semantic-label-alternative)',
          }}
        >
          <li>데이터 이름만 반복하는 제목 — 질문·주장 없음 (절차 1·2 생략)</li>
          <li>780에서 시작하는 축 — 잘린 축의 상승 과장</li>
          <li>세 가지 색의 동시 강조 — 주장 식별 불가</li>
          <li>출처·기준 시점 없음</li>
        </ul>
      </section>

      {/* 절차를 지킨 판 — 주장형 제목, 영 기준선, 강조 하나, 출처. */}
      <section data-example="compliant" style={panelStyle}>
        <PanelHeader tone="positive" badge="절차 준수" title="라우팅 교체 후 주간 처리량 18% 증가" />
        <AnnotatedFigure
          caption="출처: 운영 텔레메트리 주간 집계, 2026-05~07 · 동일 계측 기준"
          annotations={[
            { id: 'swap', title: '6주차 라우팅 교체', body: '경로 재계획 로직 전환 시점', emphasis: true },
            { id: 'baseline', title: '교체 전 평균 818건', body: '1~5주차, 변동 ±3% 이내' },
          ]}
        >
          <LineChart
            aria-label="라우팅 교체 전후 주간 처리량"
            width={340}
            height={220}
            xTicks={WEEKS}
            yLabel="건"
            series={[{ name: '주간 처리량', points: POINTS }]}
            referenceLines={[{ x: 6, label: '교체', color: 'var(--editorial-emphasis)' }]}
            summary="주간 처리량은 6주차 라우팅 교체 후 상승해 9주차 1,041건으로 교체 전 평균 대비 18% 높습니다."
          />
        </AnnotatedFigure>
      </section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const violation = canvasElement.querySelector('[data-example="violation"]');
    const compliant = canvasElement.querySelector('[data-example="compliant"]');
    if (!violation || !compliant) {
      throw new Error('The worked example must render both the violation and compliant panels.');
    }

    // 절차 2 — 주장형 제목: 제목이 데이터 이름이 아니라 주장을 말하고, 명사형으로 끝난다.
    const claim = compliant.querySelector('[data-panel-title]');
    if (!claim?.textContent.includes('18%')) {
      throw new Error('The compliant title must state the claim, not repeat the data name.');
    }
    if (/다[.!]?$/.test(claim.textContent.trim())) {
      throw new Error('Korean headlines must end with a noun, not a declarative ending.');
    }

    // 절차 4 — 강조는 하나.
    const emphasized = compliant.querySelectorAll('[data-annotation-emphasis="true"]');
    if (emphasized.length !== 1) {
      throw new Error('The compliant panel must carry exactly one emphasized annotation.');
    }

    // 검증 체크리스트 — 이 차트는 배율 주장("18% 증가")을 하므로 0 기준선으로 배율을
    // 정직하게 보여준다. 추세만 말하는 선 차트라면 0 강제가 아니다 — EDITORIAL_METHODOLOGY
    // 절차 5(상류 lk-design-system docs/EDITORIAL_METHODOLOGY.md).
    const tickTexts = Array.from(compliant.querySelectorAll('svg text')).map((node) => node.textContent.trim());
    if (!tickTexts.includes('0')) {
      throw new Error('The compliant chart must keep a zero baseline on its value axis.');
    }

    // 검증 체크리스트 — 출처·기준 시점.
    const caption = compliant.querySelector('figcaption');
    if (!caption?.textContent.includes('출처')) {
      throw new Error('The compliant panel must cite its source and reference period.');
    }

    // 대비 증명 — 위반 판의 잘린 축에는 0 눈금이 없어야 예시가 성립한다.
    const violationTicks = Array.from(violation.querySelectorAll('svg text')).map((node) => node.textContent.trim());
    if (violationTicks.includes('0')) {
      throw new Error('The violation panel must actually demonstrate the truncated axis.');
    }
  },
};
