import React from 'react';
import {
  DeckViewer,
  TitleSlide,
  AgendaSlide,
  SectionSlide,
  ContentSlide,
  EndSlide,
} from '../../src/index.js';

/**
 * 덱 작성 가이드 — lds-deck 스킬의 내용 규율을 사람이 읽는 Docs 페이지로 옮긴 것.
 * 규율의 원문은 `.claude/skills/lds-deck/`이 소유하고(에이전트용), 이 페이지는
 * 같은 규약을 Storybook에서 가르친다. 두 문서가 갈라지면 스킬이 정본이다.
 */
const meta = {
  title: 'Decks/작성 가이드',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
LDS Slides로 덱을 만들 때의 내용 규율입니다. 스타일은 컴포넌트와 토큰이 이미
소유하므로, 덱 작성자가 결정하는 것은 **무엇을 어떤 순서로 주장하는가**뿐입니다.
같은 규율의 에이전트용 원문은 저장소의 \`.claude/skills/lds-deck/\`에 있습니다 —
Claude에게 "발표자료 만들어줘"라고 하면 이 규율대로 \`stories/decks/\`에 덱을 조립합니다.

## 골격

**표지(TitleSlide) → 목차(AgendaSlide) → 챕터들(SectionSlide + 콘텐츠) → 막지(EndSlide).**
15장 넘는 덱은 챕터 사이에 \`AgendaSlide current={n}\`으로 위치를 다시 알립니다.
막지 직전은 결론 슬라이드이고, 막지의 \`message\`는 Q&A 동안 화면에 남을 잔향
한 줄입니다 — "감사합니다"로 끝나는 덱은 마지막 10분을 빈 화면에 버리는 것과 같습니다.

## 제목과 거버닝

| 자리 | 형식 | 예 |
|------|------|-----|
| \`title\` | **명사형 종결** 라벨 ("~다" 금지) | 복구 시간 절반 단축 |
| \`governing\` | **완결 문장 한 개의 주장** | 평균 복구 시간이 작년 동기 대비 절반으로 줄었다. |

**고스트 덱 테스트**: 거버닝만 순서대로 이어 읽어 논증 전체가 성립해야 합니다.
성립하지 않으면 슬라이드를 만들기 전에 개요를 고칩니다. 거버닝을 못 쓰겠는
콘텐츠 슬라이드는 "주장이 없는 슬라이드"입니다 — 왜 있는지부터 의심하세요.

## 논증 구조

- **덱 하나에 논증 하나.** 시간 안에 설득 가능한 주장 하나를 고르고 나머지는 부록으로.
- 서사 축은 하나로 일관되게: 상황 → 문제 → 해결 (기본) / 결론 우선 (시간 압박이 큰 보고).
- 핵심 주장은 3장 안에 등장. 덱이 도는 결정적 문장 하나는 \`StatementSlide\`로
  독립시킬 수 있습니다 — 덱에 한두 번이 한계입니다.
- 슬라이드 하나에 일 하나. 두 가지를 하고 있으면 쪼갭니다.

## 전시물 규율

- **슬라이드당 전시물 하나.** 차트 둘 = 슬라이드 둘 (FigureSlide 계약).
- 핵심 발견은 도판 위 주석(\`annotations\`)으로 박습니다 — 청중이 찾게 하지 않습니다.
- 자립 슬라이드 테스트: 발표자 없이 봐도 요지가 전달되는가. 덱은 PDF로도 돕니다.
- 추세·비교는 그래프, 대안 선택은 CompareSlide, 목표 대비 현황은 AssessmentSlide.
- 빌린 데이터·도판마다 \`source\`를 채웁니다: \`"출처: <시스템/문서>, <YYYY-MM>"\`.

## 강조 예산

**슬라이드당 accent 하나.** figure/annotation/recommendation/phase 중 하나가 emphasis를
쓰면 악센트 eyebrow가 자동으로 내려갑니다 — 컴포넌트가 집행하지만, 작성 단계에서
"이 슬라이드의 한 방"을 먼저 정하세요. 정상 상태는 무채색이고, 덱 전체에서 강조
슬라이드는 소수여야 합니다. 모든 곳에 강조가 있으면 아무 데도 없는 것입니다.

## 텍스트와 줄바꿈

- 본문은 슬라이드당 ~40단어(한국어 ~120자) 상한. 넘치면 **폰트를 줄이지 말고 쪼갭니다**
  — 투사 하한은 토큰의 약속입니다.
- 불릿 3–5개가 정상, 전보체 허용: "비용 23% 절감 (p<0.01)".
- **수동 개행 금지.** 어절 줄바꿈(keep-all)과 제목 줄 균형(balance)은 SlideSurface가
  소유합니다. 줄이 어색하면 \`<br>\`이 아니라 문구를 다듬으세요.
- 발표자 노트는 각 슬라이드의 \`notes\` prop에 (덱 뷰어에서 \`N\`), 단계 공개는 \`Step\`으로.

## 최종 체크리스트

- 거버닝 체인만 읽어도 논증이 성립한다 (고스트 덱 테스트)
- 모든 title이 명사형 종결이고, 콘텐츠 슬라이드마다 거버닝이 있다
- 전시물은 슬라이드당 하나, 핵심 발견에 주석이 달려 있다
- 빌린 데이터마다 source, 슬라이드당 emphasis 최대 하나
- 본문 상한 초과·세이프 존 넘침 없음 (덱 play가 오버플로를 검사한다)
- 막지 message가 잔향(주장/행동)을 담고 있다
- \`npm run check:storybook\` 통과

살아 있는 전범은 사이드바 **Decks → 스트리밍 이관 제안** 덱입니다 — 16장 전체가
이 규율대로 조립되어 있고, play 단언이 규율을 회귀 테스트로 잠급니다.
`,
      },
    },
  },
};

export default meta;

export const Skeleton = {
  name: '골격',
  parameters: {
    docs: {
      description: {
        story:
          '한국 장표 골격의 최소형: 표지 → 목차 → 간지 → 막지. 콘텐츠가 없어도 덱은 이 네 자리로 '
          + '열고 닫습니다. 간지의 index와 목차의 번호는 같은 체계(1-based, 제로 패딩)를 씁니다.',
      },
    },
  },
  render: () => (
    <DeckViewer label="골격 데모">
      <TitleSlide eyebrow="플랫폼팀" title="덱 골격 데모" subtitle="표지 → 목차 → 간지 → 막지" />
      <AgendaSlide items={['첫 챕터']} />
      <SectionSlide index={1} title="첫 챕터" subtitle="간지는 숨 고르는 자리" />
      <EndSlide message="잔향 한 줄이 막지의 전부입니다." contact="플랫폼팀" />
    </DeckViewer>
  ),
  play: async ({ canvasElement }) => {
    const deck = canvasElement.querySelector('[data-lds-deck-viewer]');
    if (!deck) throw new Error('The skeleton demo must mount inside a DeckViewer.');
    const press = async (key) => {
      deck.focus();
      deck.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    };
    for (let i = 0; i < 3; i += 1) await press('ArrowRight');
    if (!canvasElement.querySelector('[data-lds-end-slide]')) {
      throw new Error('The skeleton walks 표지 → 목차 → 간지 → 막지 in four slides.');
    }
  },
};

export const HeaderContract = {
  name: '제목과 거버닝',
  parameters: {
    docs: {
      description: {
        story:
          '헤더 계약의 실물: 제목은 명사형 라벨("복구 시간 절반 단축"), 거버닝은 본문이 입증할 '
          + '완결 문장 하나. 문장은 거버닝의 것이고 라벨은 제목의 것입니다 — 고스트 덱 테스트는 '
          + '거버닝 체인으로 합니다.',
      },
    },
  },
  render: () => (
    <ContentSlide
      eyebrow="운영 지표"
      title="복구 시간 절반 단축"
      governing="평균 복구 시간이 작년 동기 대비 절반으로 줄었다."
      // Two bullets under a header leave most of the region dead at top
      // anchor. The example authors copy should not be the one modelling
      // the defect dead-bottom was written to catch.
      anchor="center"
    >
      <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-4)' }}>
        <li>자동 롤백 도입 — 수동 개입 구간 제거</li>
        <li>장애 유형별 런북 정비 — 진단 시간 단축</li>
      </ul>
    </ContentSlide>
  ),
  play: async ({ canvasElement }) => {
    const title = canvasElement.querySelector('[data-slide-title]')?.textContent ?? '';
    if (/(다|요)[.!?]?$/.test(title.trim())) {
      throw new Error(`The title is a noun-ended label, not a sentence: "${title}".`);
    }
    const governing = canvasElement.querySelector('[data-slide-governing]')?.textContent ?? '';
    if (!/다[.!?]$/.test(governing.trim())) {
      throw new Error(`The governing message is one complete sentence: "${governing}".`);
    }
  },
};
