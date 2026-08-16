import React from 'react';
import { OptionAssessment } from '../src/index.js';

const meta = {
  title: 'Editorial/Option Assessment',
  component: OptionAssessment,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '옵션 × 기준 평가의 서사 프레임입니다. 판정 어휘는 닫혀 있고(우수·보통·미흡), 글리프는 보조 채널이라 판정은 항상 텍스트로 병기되며, 강조는 권고안 한 열에만 지출됩니다. 존재하지 않는 옵션을 권고하면 숨기지 않고 표시합니다.',
      },
    },
  },
};

export default meta;

const CRITERIA = ['도입 비용', '운영 부담', '확장성'];
const OPTIONS = [
  { id: 'batch', name: '배치 유지', verdicts: ['strong', 'strong', 'weak'] },
  { id: 'streaming', name: '전면 스트리밍', verdicts: ['weak', 'fair', 'strong'] },
  { id: 'hybrid', name: '부분 이관', verdicts: ['fair', 'fair', 'strong'] },
];

export const Default = {
  name: 'Option Assessment',
  render: () => (
    <OptionAssessment
      criteria={CRITERIA}
      options={OPTIONS}
      recommendation="hybrid"
      caption="평가 기준: 2026년 3분기 파이프라인 개편 검토 (데모 데이터)"
    />
  ),
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector('[data-lds-option-assessment]');
    if (!frame) throw new Error('OptionAssessment must render its frame.');
    // 판정은 항상 텍스트로 병기 — 글리프만으로 말하지 않는다.
    const verdicts = frame.querySelectorAll('[data-assessment-verdict]');
    if (verdicts.length !== 9) throw new Error('Every option × criterion cell must render a verdict.');
    for (const cell of verdicts) {
      if (!/우수|보통|미흡/.test(cell.textContent)) {
        throw new Error('Verdicts must be spoken in text — the glyph is an auxiliary channel.');
      }
    }
    // 강조는 권고안 한 열에만.
    const recommended = frame.querySelectorAll('[data-assessment-recommended]');
    if (recommended.length !== 1 || !recommended[0].textContent.includes('부분 이관')) {
      throw new Error('Emphasis is spent on exactly one option — the recommendation.');
    }
    if (!frame.querySelector('[data-assessment-recommendation-tag]')) {
      throw new Error('The recommended column must say so in text, not by color alone.');
    }
    // 표는 표답게 — 행/열 머리글은 th로 남는다.
    if (frame.querySelectorAll('th[scope="row"]').length !== 3) {
      throw new Error('Criteria must remain row headers for assistive tech.');
    }
  },
};

export const BrokenRecommendation = {
  name: 'Broken Recommendation',
  render: () => (
    <OptionAssessment criteria={CRITERIA} options={OPTIONS} recommendation="full-rewrite" />
  ),
  play: async ({ canvasElement }) => {
    const warning = canvasElement.querySelector('[data-assessment-recommendation-warning]');
    if (!warning || !warning.textContent.includes('full-rewrite')) {
      throw new Error('A recommendation matching no option must be visibly reported, not dropped.');
    }
    if (canvasElement.querySelector('[data-assessment-recommended]')) {
      throw new Error('A broken recommendation must not emphasize any column.');
    }
  },
};
