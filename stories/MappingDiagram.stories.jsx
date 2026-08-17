import React from 'react';
import { MappingDiagram } from '../src/index.js';

const meta = {
  title: 'Editorial/Mapping Diagram',
  component: MappingDiagram,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '두 순서 있는 목록과 그 사이의 대응 — 램프가 매체 단계로, 옛 필드가 대체 필드로, 역할이 담당자로. 매체와 논증의 분리 덱의 손그림 도판이 실물 파일럿이었고 WeekSpanRows와 같은 절차로 승격됐습니다. SVG가 아니라 HTML인 것이 계약의 일부입니다: 고정 viewBox를 늘리면 배치가 아니라 배율이 채워져 라벨이 슬라이드의 주장보다 커집니다(실측 ×1.97).',
      },
    },
  },
};

export default meta;

const ROWS = [
  { from: 'value', to: 'slides-title' },
  { from: 'claim', to: 'slides-body', emphasis: true },
  { from: 'note', to: 'slides-caption' },
  { from: 'note-body', to: 'slides-fine' },
  { from: 'caption', to: 'slides-fine' },
];

export const Default = {
  name: 'Mapping Diagram',
  render: () => (
    <div style={{ maxWidth: 820 }}>
      <MappingDiagram rows={ROWS} fromLabel="Editorial — 순위" toLabel="매체 — 거리" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const diagram = canvasElement.querySelector('[data-lds-mapping-diagram]');
    if (!diagram) throw new Error('MappingDiagram must render.');

    // HTML, not SVG: the pilot's SVG version filled width by magnifying, and
    // an svg here would be that mistake coming back.
    if (diagram.querySelector('svg')) {
      throw new Error('This diagram lays out in HTML — an SVG would fill width by scaling its type.');
    }

    const from = diagram.querySelectorAll('[data-mapping-from]');
    const to = diagram.querySelectorAll('[data-mapping-to]');
    if (from.length !== ROWS.length || to.length !== ROWS.length) {
      throw new Error('Every row has both sides.');
    }

    // Rows line up: a mapping whose sides drift is a diagram that lies.
    for (let index = 0; index < from.length; index += 1) {
      const left = from[index].getBoundingClientRect();
      const right = to[index].getBoundingClientRect();
      if (Math.abs(left.top - right.top) > 1) {
        throw new Error(`Row ${index + 1} is not level: ${left.top} vs ${right.top}.`);
      }
    }

    // The channel takes the slack, so the labels keep their content width.
    const channel = diagram.querySelector('[data-mapping-channel]');
    if (channel.getBoundingClientRect().width < 64) {
      throw new Error('The correspondence channel keeps a floor width; it is what the reader follows.');
    }

    // One lit row, and it is the one that asked first.
    const lit = diagram.querySelectorAll('[data-mapping-emphasis="true"]');
    if (lit.length !== 1) throw new Error(`Exactly one row is lit, found ${lit.length}.`);
  },
};

export const EmphasisBudget = {
  name: 'Emphasis Budget',
  render: () => (
    <div style={{ maxWidth: 820 }}>
      <MappingDiagram
        fromLabel="옛 필드"
        toLabel="대체 필드"
        rows={[
          { from: 'siteId', to: 'facilityId', emphasis: true },
          { from: 'zoneCode', to: 'areaId', emphasis: true },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rows = [...canvasElement.querySelectorAll('[data-mapping-channel]')];
    const lit = rows.filter((row) => row.getAttribute('data-mapping-emphasis') === 'true');
    if (lit.length !== 1 || lit[0] !== rows[0]) {
      throw new Error('Two rows asked for emphasis; the first must win, in code rather than in prose.');
    }
  },
};
