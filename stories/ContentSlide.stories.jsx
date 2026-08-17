import React from 'react';
import { ContentSlide } from '../src/index.js';
import { DeckMediumContext } from '../src/components/slides/deckMedium.js';

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
    // The claim carries the ramp CLASS weight of its tier (title tiers define
    // 400/500/700 — the baseline lists no 600 there). It sat on semibold, an
    // off-ramp weight, until the 2026-08-17 weight audit.
    if (parseInt(getComputedStyle(governing).fontWeight, 10) !== 700) {
      throw new Error('The governing claim rides the bold class weight of its tier.');
    }
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

export const MissingClaimReported = {
  name: '거버닝 미기재 신고',
  parameters: {
    docs: {
      description: {
        story:
          'present 덱의 콘텐츠 슬라이드가 거버닝 없이 렌더되면 캔버스에 신고가 뜹니다 '
          + '(Triptych "레이블 없음"과 같은 관용구). read 덱은 명사형 제목 + 전시물이 완결 '
          + '문법이라 조용하고, 덱 밖(카탈로그)에서도 판단할 매체가 없어 조용합니다.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <DeckMediumContext.Provider value={{ kind: 'present' }}>
        <ContentSlide data-probe="present" eyebrow="현황" title="주장 없는 장">
          <p style={{ margin: 0 }}>근거만 있고 주장이 없는 본문.</p>
        </ContentSlide>
      </DeckMediumContext.Provider>
      <DeckMediumContext.Provider value={{ kind: 'read' }}>
        <ContentSlide data-probe="read" eyebrow="현황" title="열람 페이지">
          <p style={{ margin: 0 }}>열람 문법: 명사형 제목 + 전시물로 완결.</p>
        </ContentSlide>
      </DeckMediumContext.Provider>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const present = canvasElement.querySelector('[data-probe="present"]');
    const marker = present.querySelector('[data-slide-governing-missing]');
    if (!marker) throw new Error('A present-deck content slide without a claim must report the gap on the canvas.');
    if (!marker.textContent.includes('거버닝 미기재')) {
      throw new Error('The report must name what is missing, not decorate the gap.');
    }
    const read = canvasElement.querySelector('[data-probe="read"]');
    if (read.querySelector('[data-slide-governing-missing]')) {
      throw new Error('A read deck omits the claim by grammar, not by mistake — no report.');
    }
  },
};
