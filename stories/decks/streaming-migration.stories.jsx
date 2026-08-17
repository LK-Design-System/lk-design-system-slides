import React from 'react';
import {
  DeckViewer,
  TitleSlide,
  AgendaSlide,
  SectionSlide,
  ContentSlide,
  SplitSlide,
  StatementSlide,
  Step,
  FigureSlide,
  CompareSlide,
  RoadmapSlide,
  AssessmentSlide,
  StatSlide,
  EndSlide,
} from '../../src/index.js';
import { Lockup } from '@lk-design-system/lds-theme';

/**
 * lds-deck 스킬의 모범 덱. 스킬 워크플로(개요 → 고스트 덱 테스트 → 조립 → QA)를
 * 그대로 밟아 만들었고, play 단언이 스킬의 내용 규약을 회귀 테스트로 잠근다:
 * 거버닝 체인만 읽어도 논증이 성립하고(고스트 덱), 제목은 명사형으로 끝나며,
 * 어떤 슬라이드도 세이프 존을 넘치지 않는다.
 *
 * 경영 보고(회람) 덱이므로 프리셋은 briefing — 종류는 토큰 축이라 슬라이드마다
 * `preset`으로 전달할 뿐, 레이아웃은 keynote와 동일하다.
 */
const meta = {
  title: 'Decks/스트리밍 이관 제안',
  parameters: {
    docs: {
      description: {
        component:
          'lds-deck 스킬로 만든 모범 덱입니다. 표지 → 목차 → 세 챕터(현황 진단 / 대안 평가 / 실행 계획) → 막지의 '
          + '한국 장표 골격을 따르고, 거버닝 체인이 논증을 나릅니다: 문제 → 증거 → 선택 → 원칙 → 일정 → 판정 → 요청.',
      },
    },
  },
};

export default meta;

const AGENDA = ['현황 진단', '대안 평가', '실행 계획'];

const LatencyChart = () => (
  <svg
    viewBox="-6 0 332 120"
    role="img"
    aria-label="선행 파일럿 주간 p95 지연 추이 데모 차트 — 곡선이 목표 20분 점선 아래로 내려온다"
    style={{ width: '100%', display: 'block' }}
  >
    {/* 목표선 — 거버닝이 "절반으로"를 주장하니 기준이 그림에 있어야 한다
        (TrendChart referenceLines의 시각 언어 그대로: cautionary 점선).
        라벨은 캡션이 진다 — 이 SVG는 viewBox 스케일이라 안에 글자를 넣으면
        확대되어 text-scale 규칙 위반이고, 기하만 스케일을 타는 것이 계약이다.
        y=87 ≈ 20분 (41분 y30 → 18분 y92 선형). */}
    <line
      x1="0"
      y1="87"
      x2="320"
      y2="87"
      stroke="var(--color-semantic-status-cautionary)"
      strokeWidth="1"
      strokeDasharray="3 3"
    />
    <polyline
      points="0,30 40,34 80,32 120,44 160,48 200,72 240,78 280,88 320,92"
      fill="none"
      stroke="var(--editorial-emphasis)"
      strokeWidth="2.5"
    />
    <circle data-annotation-anchor="shadow-cutover" cx="200" cy="72" r="4" fill="var(--editorial-emphasis)" />
    <line x1="0" y1="110" x2="320" y2="110" stroke="var(--color-semantic-line-solid-normal)" />
  </svg>
);

const listStyle = {
  margin: 0,
  paddingLeft: '1.2em',
  display: 'grid',
  gap: 'var(--space-4)',
};

export const Deck = {
  name: '스트리밍 이관 제안',
  render: () => (
    <DeckViewer
      label="스트리밍 이관 제안"
      // The standing mark, stated once for the whole deck (한국 보고 장표의 매
      // 페이지 로고). variant="mark": the compact glyph, 21px wide against the
      // wordmark 156px — chrome rides in the band, it does not carry the page.
      // tone="current" so it inherits the chrome ink and follows a re-pointed
      // surface instead of holding a colour of its own.
      mark={<Lockup variant="mark" tone="current" height={20} />}
    >
      {/* 표지와 간지만 브랜드 네이비, 본문은 흰 표면 — appearance가 레이아웃
          축인 이유(D1) 그대로다. 45장 전부 흰 카드였을 때 챕터 전환이 읽어야만
          보였다; 색면은 넘기는 눈에 챕터가 바뀌었음을 즉시 알린다. */}
      <TitleSlide
        preset="briefing"
        appearance="brand"
        lockup={<Lockup variant="inline" tone="white" height={30} />}
        eyebrow="플랫폼팀 · 2026 3분기"
        title="데이터 파이프라인 이관 제안"
        subtitle="배치에서 스트리밍으로 — 지연에 민감한 것부터"
        notes="인사 후 바로 본론 예고: 오늘 요청드리는 것은 부분 이관 파일럿 승인 하나입니다. [~1분]"
      />
      <AgendaSlide
        preset="briefing"
        items={AGENDA}
        notes="세 챕터 구성만 짚고 넘어간다. 진단 → 평가 → 계획."
      />

      <SectionSlide
        preset="briefing"
        appearance="brand"
        index={1}
        title="현황 진단"
        subtitle="지연은 어디서 생기는가"
        notes="첫 챕터는 문제 정의. 숫자보다 구조를 먼저 보여준다."
      />
      <ContentSlide
        preset="briefing"
        eyebrow="병목 분석"
        title="지연 원인 진단"
        governing="지연의 대부분은 수집이 아니라 반영 단계의 배치 대기에서 발생합니다."
        anchor="center"
        notes="세 항목을 키 신호에 맞춰 하나씩 연다. 변환은 문제가 아니라는 점을 강조. [~2분]"
      >
        <ul style={listStyle}>
          <Step at={1} as="li">수집 지연 p95 41분 — 원천 시스템 유입은 준실시간</Step>
          <Step at={2} as="li">적재 큐 대기 28분 — 야간 배치 창까지의 대기가 지배적</Step>
          <Step at={3} as="li">변환 단계 3분 — 로직 비용은 사실상 무시 가능</Step>
        </ul>
      </ContentSlide>
      <AssessmentSlide
        preset="briefing"
        eyebrow="분기 지표"
        title="분기 목표 달성 현황"
        governing="성능 지표는 궤도에 있으나 운영 비용이 목표를 이탈했습니다."
        metrics={[
          { id: 'p95', group: '성능', name: '수집–반영 p95 지연', target: '20분', actual: '18분', status: 'met' },
          { id: 'uptime', group: '성능', name: '파이프라인 가동률', target: '99.9%', actual: '99.7%', status: 'watch' },
          { id: 'cost', group: '비용', name: '월 운영 비용', target: '₩42M', actual: '₩51M', status: 'missed' },
        ]}
        caption="3분기 6주차 기준 (데모 데이터)"
        source="출처: 플랫폼팀 운영 대시보드, 2026-07"
        notes="비용 이탈이 이 제안의 출발점. 배치 재실행 비용이 주범임을 구두로 보충."
      />
      <FigureSlide
        preset="briefing"
        eyebrow="선행 파일럿"
        title="셰도우 전환 구간 지연 추이"
        governing="셰도우 전환 구간에서 p95 지연이 절반으로 내려왔습니다."
        caption="주간 p95 지연, 6월–7월 (데모 데이터) · 점선: 목표 20분"
        source="출처: 파이프라인 텔레메트리, 2026-07 집계"
        annotations={[
          {
            id: 'cutover',
            anchor: 'shadow-cutover',
            title: '셰도우 전환',
            body: '6주차, 주문 테이블 병행 계측',
            emphasis: true,
          },
          { id: 'method', title: '동일 계측 기준', body: '집계 방식 변경 없음' },
        ]}
        notes="이미 검증된 증거가 있다는 것이 이 장의 역할. 전환점 주석만 가리키고 넘어간다."
      >
        <LatencyChart />
      </FigureSlide>

      <AgendaSlide
        preset="briefing"
        items={AGENDA}
        current={2}
        notes="위치 재확인. 문제와 증거를 봤으니 이제 선택지."
      />
      <SectionSlide
        preset="briefing"
        appearance="brand"
        index={2}
        title="대안 평가"
        subtitle="세 갈래 선택지"
        notes="비교표 한 장으로 끝나는 챕터. 길게 끌지 않는다."
      />
      <CompareSlide
        preset="briefing"
        eyebrow="대안 비교"
        title="이관 방식 비교"
        governing="부분 이관이 비용·운영 부담·확장성의 균형점입니다."
        criteria={['도입 비용', '운영 부담', '확장성']}
        options={[
          { id: 'batch', name: '배치 유지', verdicts: ['strong', 'strong', 'weak'] },
          { id: 'streaming', name: '전면 스트리밍', verdicts: ['weak', 'fair', 'strong'] },
          { id: 'hybrid', name: '부분 이관', verdicts: ['fair', 'fair', 'strong'] },
        ]}
        recommendation="hybrid"
        caption="평가 기준: 3분기 개편 검토 (데모 데이터)"
        source="출처: 플랫폼팀 기술 검토서, 2026-07"
        notes="배치 유지가 두 칸에서 강한 이유(당장 싸다)를 인정한 뒤, 확장성 한 칸이 왜 결정적인지로 넘어간다. [~3분]"
      />
      <StatementSlide
        preset="briefing"
        eyebrow="핵심 제안"
        statement="전면 전환이 아니라, 지연에 민감한 것부터 옮깁니다."
        notes="덱이 도는 문장. 여기서 한 박자 쉰다."
      />

      <AgendaSlide
        preset="briefing"
        items={AGENDA}
        current={3}
        notes="마지막 챕터 진입."
      />
      <SectionSlide
        preset="briefing"
        appearance="brand"
        index={3}
        title="실행 계획"
        subtitle="3단계 이관과 판정 기준"
        notes="일정 → 기대 효과 → 요청 순서."
      />
      <RoadmapSlide
        preset="briefing"
        eyebrow="일정"
        title="실행 로드맵"
        governing="8월 1차 이관을 시작으로 분기 안에 확대 여부를 결정합니다."
        phases={[
          { id: 'pilot', date: '2026-08', label: '1차: 지연 민감 테이블 이관', body: '주문·텔레메트리 5개 테이블', emphasis: true },
          { id: 'verify', date: '2026-10', label: '2차: 운영 검증', body: 'p95 지연·비용 이중 추적' },
          { id: 'decide', date: '2026-11', label: '확대 여부 결정', body: '4주 운영 지표 검토 후 결정' },
          { id: 'sunset', label: '배치 경로 폐기', body: '확대 결정에 종속' },
        ]}
        source="출처: 플랫폼팀 실행 계획서, 2026-07"
        notes="폐기 단계는 날짜가 없음을 먼저 말한다 — 확대 결정에 종속이라 미정이 정직한 표기."
      />
      <StatSlide
        preset="briefing"
        eyebrow="기대 효과"
        title="파일럿 기대 효과"
        governing="이관 구간에서 지연은 절반으로, 비용 증가는 12% 이내로 관리합니다."
        figures={[
          { value: 47, unit: '%', label: 'p95 지연 감소', claim: '셰도우 전환 구간 실측 기준.', emphasis: true },
          { value: 5, unit: '종', label: '이관 대상 테이블', claim: '주문·텔레메트리 우선.' },
          { value: 12, unit: '%', label: '비용 증가 상한', claim: '초과 시 이관 중단 기준.' },
        ]}
        source="출처: 선행 파일럿 실측 + 비용 모델, 2026-07"
        notes="47%는 추정이 아니라 실측임을 반드시 짚는다. 상한 12%는 약속이 아니라 중단 기준."
      />
      <SplitSlide
        preset="briefing"
        eyebrow="결론"
        title="결론 및 요청 사항"
        governing="지연 민감 테이블 5종의 부분 이관 파일럿 승인을 요청드립니다."
        anchor="center"
        ratio="1:1"
        left={
          <div>
            <p style={{ margin: '0 0 var(--space-4)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-semantic-label-normal)' }}>
              확인된 사실
            </p>
            <ul style={listStyle}>
              <li>병목은 반영 단계의 배치 대기</li>
              <li>셰도우 전환 실측: 지연 절반</li>
              <li>비용 이탈의 주범은 배치 재실행</li>
            </ul>
          </div>
        }
        right={
          <div>
            <p style={{ margin: '0 0 var(--space-4)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-semantic-label-normal)' }}>
              요청 사항
            </p>
            <ul style={listStyle}>
              <li>8월 파일럿 착수 승인</li>
              <li>전담 2인 · 12주 배정</li>
              <li>비용 상한 12% 합의</li>
            </ul>
          </div>
        }
        notes="Q&A 직전 마지막 콘텐츠 슬라이드. 요청 세 줄만 다시 읽는다. [~2분]"
      />
      <EndSlide
        preset="briefing"
        appearance="brand"
        lockup={<Lockup variant="inline" tone="white" height={24} />}
        message="지연에 민감한 것부터, 8월에 시작합니다."
        contact="플랫폼팀 · jinhyuk2me@gmail.com"
        notes="Q&A 동안 이 화면을 유지한다."
      />
    </DeckViewer>
  ),
  play: async ({ canvasElement }) => {
    const deck = canvasElement.querySelector('[data-lds-deck-viewer]');
    if (!deck) throw new Error('The deck must mount inside a DeckViewer.');
    const counter = () => canvasElement.querySelector('[data-deck-progress]')?.textContent ?? '';
    const press = async (key) => {
      deck.focus();
      deck.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    };

    if (counter() !== '1 / 16') {
      throw new Error(`The deck opens on its title slide: expected "1 / 16", got "${counter()}".`);
    }

    // 상류 한국어 조판 계약: 줄은 어절 사이에서만 꺾인다(keep-all). 캔버스에서
    // 상속되므로 표면 한 곳만 검사하면 덱의 모든 텍스트가 잠긴다.
    const firstSurface = canvasElement.querySelector('[data-lds-slide-surface]');
    if (getComputedStyle(firstSurface).wordBreak !== 'keep-all') {
      throw new Error('Korean copy must never break mid-word: the slide canvas owns word-break: keep-all.');
    }

    // 덱 전체를 키로 완주하며 스킬의 세 규약을 슬라이드마다 검사한다.
    const governings = [];
    const titles = [];
    for (let presses = 0; presses < 80; presses += 1) {
      const surface = canvasElement.querySelector('[data-lds-slide-surface]');
      if (!surface) throw new Error('Every deck position must render one slide surface.');

      // 세이프 존 규약: 어떤 슬라이드도 캔버스를 넘치지 않는다. 넘치면 내용을
      // 쪼개는 것이 정답이지 폰트 축소가 아니다 — 그래서 이 검사는 회귀 게이트다.
      if (surface.scrollHeight > surface.clientHeight + 1) {
        const title = surface.querySelector('[data-slide-title]')?.textContent ?? '(제목 없음)';
        throw new Error(`Slide "${title}" overflows the canvas by ${surface.scrollHeight - surface.clientHeight}px — split the content instead of shrinking it.`);
      }

      const title = surface.querySelector('[data-slide-title]')?.textContent;
      if (title && !titles.includes(title)) titles.push(title);
      const governing = surface.querySelector('[data-slide-governing]')?.textContent;
      if (governing && !governings.includes(governing)) governings.push(governing);
      const statementEl = surface.querySelector('[data-slide-statement]');
      const statement = statementEl?.textContent;
      if (statement && !governings.includes(statement)) governings.push(statement);
      // 구 단위 줄바꿈 계약: 의존명사("것부터")는 앞말에 묶여 줄 머리에 서지 못한다.
      if (statementEl && statement.includes('것부터')) {
        const glued = [...statementEl.querySelectorAll('[data-slide-phrase]')]
          .some((span) => span.textContent.includes('것부터') && getComputedStyle(span).whiteSpace === 'nowrap');
        if (!glued) {
          throw new Error('Dependent nouns must be glued to the word they lean on (phrase-level keep-all).');
        }
      }

      if (canvasElement.querySelector('[data-lds-end-slide]')) break;
      await press('ArrowRight');
    }

    if (!canvasElement.querySelector('[data-lds-end-slide]') || counter() !== '16 / 16') {
      throw new Error(`Walking the deck with one key must reach the end slide: counter reads "${counter()}".`);
    }

    // 명사형 종결 규약: 제목은 라벨이다. 문장은 거버닝의 것.
    const sentenceTitles = titles.filter((title) => /(다|요)[.!?]?$/.test(title.trim()));
    if (sentenceTitles.length > 0) {
      throw new Error(`Titles end with nouns, not sentences: ${sentenceTitles.join(', ')}`);
    }

    // 고스트 덱 테스트: 거버닝 체인(문제 → 증거 → 선택 → 원칙 → 일정 → 판정 → 요청)이
    // 모두 완결 문장으로 존재해야 논증이 슬라이드 없이도 성립한다.
    if (governings.length < 8) {
      throw new Error(`The governing chain must carry the argument: expected at least 8 claims, found ${governings.length}.`);
    }
    const fragments = governings.filter((claim) => !/다[.!?]$/.test(claim.trim()));
    if (fragments.length > 0) {
      throw new Error(`Governing messages are complete sentences: ${fragments.join(' / ')}`);
    }

    // 발표자 노트는 캔버스 밖의 계약 — 막지에서 N으로 열리고 표면에는 없다.
    await press('N');
    if (!canvasElement.querySelector('[data-deck-notes]')) {
      throw new Error('Every slide carries presenter notes, readable with N.');
    }
  },
};
