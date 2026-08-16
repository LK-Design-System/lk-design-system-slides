import React from 'react';
import { RoadmapSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Roadmap Slide',
  component: RoadmapSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '로드맵 슬라이드입니다. 시간렬 계약(입력 순서 무관 정렬·시점 미상 각주·리듬≠기간)은 Editorial NarrativeTimeline이 소유하고, 슬라이드는 배치·출처·강조 예산 정산만 소유합니다. 강조된 단계가 있으면 악센트 eyebrow는 내려갑니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Roadmap Slide',
  render: () => (
    <RoadmapSlide
      preset="briefing"
      eyebrow="실행 계획"
      title="파이프라인 이관 로드맵"
      governing="지연 민감 테이블을 먼저 옮기고, 전면 확대는 검증 후에 결정합니다."
      source="출처: 플랫폼팀 분기 계획, 2026-07"
      phases={[
        // 입력은 뒤섞여 있다 — 시간렬 계약이 정렬을 소유한다.
        { id: 'expand', date: '2026-11', label: '확대 여부 결정', body: '4주 운영 지표 검토 후 결정' },
        {
          id: 'pilot',
          date: '2026-08',
          label: '1차: 지연 민감 테이블 이관',
          body: '주문·텔레메트리 5개 테이블',
          emphasis: true,
        },
        { id: 'verify', date: '2026-10', label: '2차: 운영 검증', body: 'p95 지연·비용 이중 추적' },
        { id: 'sunset', label: '배치 경로 폐기', body: '확대 결정에 종속' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const slide = canvasElement.querySelector('[data-lds-roadmap-slide]');
    const timeline = canvasElement.querySelector('[data-lds-narrative-timeline]');
    if (!slide || !timeline) throw new Error('RoadmapSlide must place one Editorial NarrativeTimeline.');
    if (!canvasElement.querySelector('[data-slide-governing]')) {
      throw new Error("ContentSlide's header contract must flow through RoadmapSlide.");
    }
    // 시간렬 계약은 Editorial 것이 슬라이드 위에서도 산다 — 뒤섞인 입력이 정렬돼 나온다.
    const events = [...timeline.querySelectorAll('[data-timeline-event]')].map((el) =>
      el.textContent.trim()
    );
    if (events[0] !== '1차: 지연 민감 테이블 이관' || events[2] !== '확대 여부 결정') {
      throw new Error('Phases must render in chronological order regardless of input order.');
    }
    // 날짜 없는 단계는 레일에 오르지 않고 각주로 노출된다.
    const undated = timeline.querySelector('[data-timeline-undated]');
    if (!undated || !undated.textContent.includes('배치 경로 폐기')) {
      throw new Error('An undated phase must surface as the visible 시점 미상 footnote.');
    }
    // 강조 예산: 강조된 단계가 있으면 악센트 eyebrow는 내려간다.
    if (slide.getAttribute('data-emphasis-spent') !== 'phase') {
      throw new Error('An emphasized phase must be settled as the slide-level emphasis spend.');
    }
    if (canvasElement.querySelector('[data-slide-eyebrow]')) {
      throw new Error('When a phase spends emphasis, the accented eyebrow must be dropped.');
    }
    const source = canvasElement.querySelector('[data-slide-source]');
    const fineSize = parseFloat(getComputedStyle(slide).getPropertyValue('--slides-fine-size'));
    if (!source || parseFloat(getComputedStyle(source).fontSize) !== fineSize) {
      throw new Error('The source line reads at the fine floor — provenance, not content.');
    }
  },
};
