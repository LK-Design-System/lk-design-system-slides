import React from 'react';
import { ContentSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Content Slide',
  component: ContentSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '본문 슬라이드의 기본 레이아웃입니다. 헤더 계약과 콘텐츠 영역의 타입 기본값을 소유하고, 내용 구성은 덱이 결정합니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Content Slide',
  render: () => (
    <ContentSlide eyebrow="Principles" title="여섯 가지 설계 원칙">
      <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
        <li>Truth before action — 권한·연결·신선도를 먼저 보여준다.</li>
        <li>Shell composes; products decide — 계약은 시스템이, 의미는 제품이.</li>
        <li>Dense, not cramped — 가독성보다 장식을 먼저 잘라낸다.</li>
      </ul>
    </ContentSlide>
  ),
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector('[data-slide-header]');
    const content = canvasElement.querySelector('[data-slide-content]');
    if (!header || !content) throw new Error('ContentSlide must render its header and content regions.');
    if (!(header.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      throw new Error('The header must precede the content region in reading order.');
    }
    if (!content.textContent.includes('Truth before action')) {
      throw new Error('The content region must render deck-owned children untouched.');
    }
  },
};

export const Governing = {
  name: 'Governing Message',
  render: () => (
    <ContentSlide
      preset="briefing"
      eyebrow="2분기 실적"
      title="구독 전환율 개선"
      governing="온보딩 3단계 축소가 전환율을 2.1%p 끌어올려, 개선 여력은 결제 단계에 남아 있습니다."
    >
      <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
        <li>온보딩 이탈률 34% → 21% — 단계 축소 이후 6주 평균.</li>
        <li>결제 단계 이탈률 18%로 정체 — 다음 분기 개선 대상.</li>
      </ul>
    </ContentSlide>
  ),
  play: async ({ canvasElement }) => {
    const title = canvasElement.querySelector('[data-slide-title]');
    const governing = canvasElement.querySelector('[data-slide-governing]');
    const content = canvasElement.querySelector('[data-slide-content]');
    if (!governing) throw new Error('governing must render the claim region.');
    if (!(title.compareDocumentPosition(governing) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      throw new Error('The governing message must follow the title (제목/거버닝/본문 order).');
    }
    if (!(governing.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      throw new Error('The governing message must precede the content region it is substantiated by.');
    }
    const gs = getComputedStyle(governing);
    // The claim never reads BELOW the body it governs; on briefing it reads a
    // step above (한국 보고 관행 16pt>14pt — SLIDE_SYSTEMS_COMPARISON §6). The
    // old assertion pinned equality, which was the keynote alias mistaken for
    // the contract.
    if (parseFloat(gs.fontSize) <= parseFloat(getComputedStyle(content).fontSize)) {
      throw new Error('On briefing the governing message reads one step above the body — it is a claim, not a caption.');
    }
    if (parseInt(gs.fontWeight, 10) <= parseInt(getComputedStyle(content).fontWeight, 10)) {
      throw new Error('The governing message must carry more weight than the body that substantiates it.');
    }
    if (!/(다|요)\.$/.test(governing.textContent.trim())) {
      throw new Error('The governing message is a complete sentence — the noun ending belongs to the title.');
    }
  },
};
