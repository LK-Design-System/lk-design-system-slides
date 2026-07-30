import React from 'react';
import { AssessmentSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Assessment Slide',
  component: AssessmentSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '상태 평가 슬라이드입니다. 판정 계약(닫힌 어휘·텍스트 병기·달성은 무채색)은 Editorial StatusAssessment가 소유하고, 슬라이드는 배치와 출처만 소유합니다. 상태 색은 이탈 채널이라 악센트 eyebrow와 경쟁하지 않으므로 eyebrow는 유지됩니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Assessment Slide',
  render: () => (
    <AssessmentSlide
      preset="briefing"
      eyebrow="분기 점검"
      title="이관 6주차 지표 점검"
      governing="성능 목표는 지켰지만 비용이 목표를 넘어, 개선은 비용 축에 집중합니다."
      metrics={[
        { id: 'p95', group: '성능', name: '수집–반영 p95 지연', target: '20분', actual: '18분', status: 'met' },
        { id: 'uptime', group: '성능', name: '파이프라인 가동률', target: '99.9%', actual: '99.7%', status: 'watch' },
        { id: 'cost', group: '비용', name: '월 운영 비용', target: '₩42M', actual: '₩51M', status: 'missed' },
      ]}
      caption="3분기 6주차 기준 (데모 데이터)"
      source="출처: 플랫폼팀 운영 대시보드, 2026-07"
    />
  ),
  play: async ({ canvasElement }) => {
    const slide = canvasElement.querySelector('[data-lds-assessment-slide]');
    const frame = canvasElement.querySelector('[data-lds-status-assessment]');
    if (!slide || !frame) throw new Error('AssessmentSlide must place one Editorial StatusAssessment.');
    if (!canvasElement.querySelector('[data-slide-governing]')) {
      throw new Error("ContentSlide's header contract must flow through AssessmentSlide.");
    }
    // 판정 계약은 Editorial 것이 슬라이드 위에서도 산다 — 달성은 무채색.
    if (frame.querySelector('.lk-status-badge--positive')) {
      throw new Error("Editorial's achromatic-met contract must survive being placed on a slide.");
    }
    // 상태 색은 이탈 채널 — 악센트 eyebrow는 유지된다.
    if (!canvasElement.querySelector('[data-slide-eyebrow]')) {
      throw new Error('Status tints are the deviation channel — the accented eyebrow must stay.');
    }
    if (slide.hasAttribute('data-emphasis-spent')) {
      throw new Error('AssessmentSlide spends no emphasis — deviations are not accents.');
    }
    const source = canvasElement.querySelector('[data-assessment-slide-source]');
    const fineSize = parseFloat(getComputedStyle(slide).getPropertyValue('--slides-fine-size'));
    if (!source || parseFloat(getComputedStyle(source).fontSize) !== fineSize) {
      throw new Error('The source line reads at the fine floor — provenance, not content.');
    }
  },
};
