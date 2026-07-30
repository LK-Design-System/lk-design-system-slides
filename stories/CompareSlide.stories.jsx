import React from 'react';
import { CompareSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Compare Slide',
  component: CompareSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '옵션 비교 슬라이드입니다. 판정 계약(닫힌 어휘·텍스트 병기·권고 한 열)은 Editorial OptionAssessment가 소유하고, 슬라이드는 배치·출처·강조 예산 정산만 소유합니다. 권고가 있으면 악센트 eyebrow는 내려갑니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Compare Slide',
  render: () => (
    <CompareSlide
      preset="briefing"
      eyebrow="아키텍처 검토"
      title="파이프라인 개편 옵션 평가"
      governing="세 옵션 중 부분 이관이 비용과 확장성의 균형점입니다."
      criteria={['도입 비용', '운영 부담', '확장성']}
      options={[
        { id: 'batch', name: '배치 유지', verdicts: ['strong', 'strong', 'weak'] },
        { id: 'streaming', name: '전면 스트리밍', verdicts: ['weak', 'fair', 'strong'] },
        { id: 'hybrid', name: '부분 이관', verdicts: ['fair', 'fair', 'strong'] },
      ]}
      recommendation="hybrid"
      caption="평가 기준: 3분기 개편 검토 (데모 데이터)"
      source="출처: 플랫폼팀 기술 검토서, 2026-07"
    />
  ),
  play: async ({ canvasElement }) => {
    const slide = canvasElement.querySelector('[data-lds-compare-slide]');
    const frame = canvasElement.querySelector('[data-lds-option-assessment]');
    if (!slide || !frame) throw new Error('CompareSlide must place one Editorial OptionAssessment.');
    if (!canvasElement.querySelector('[data-slide-governing]')) {
      throw new Error("ContentSlide's header contract must flow through CompareSlide.");
    }
    // 판정 계약은 Editorial 것이 슬라이드 위에서도 그대로 산다.
    const recommended = frame.querySelectorAll('[data-assessment-recommended]');
    if (recommended.length !== 1) {
      throw new Error("Editorial's one-recommendation contract must survive being placed on a slide.");
    }
    // 강조 예산: 권고가 있으면 악센트 eyebrow는 내려간다.
    if (slide.getAttribute('data-emphasis-spent') !== 'recommendation') {
      throw new Error('A recommendation must be settled as the slide-level emphasis spend.');
    }
    if (canvasElement.querySelector('[data-slide-eyebrow]')) {
      throw new Error('When a recommendation spends emphasis, the accented eyebrow must be dropped.');
    }
    const source = canvasElement.querySelector('[data-compare-slide-source]');
    const fineSize = parseFloat(getComputedStyle(slide).getPropertyValue('--slides-fine-size'));
    if (!source || parseFloat(getComputedStyle(source).fontSize) !== fineSize) {
      throw new Error('The source line reads at the fine floor — provenance, not content.');
    }
  },
};
