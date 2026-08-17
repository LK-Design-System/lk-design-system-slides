import React from 'react';
import {
  DeckViewer,
  TitleSlide,
  AgendaSlide,
  SectionSlide,
  ContentSlide,
  CodeSlide,
  StatSlide,
  StatementSlide,
  Step,
  FigureSlide,
  AssessmentSlide,
  RoadmapSlide,
  EndSlide,
} from '../../src/index.js';

/**
 * 매체와 논증의 분리 — LDS Slides · Editorial 아키텍처 검토.
 *
 * 거버닝 체인(고스트 덱 테스트):
 *  1. LDS는 도메인마다 독립 저장소를 두고 고정된 Core를 소비하며 확장해 왔다.
 *  2. Editorial 컴포넌트가 업스트림 타입 램프를 직접 참조하고 있었다.
 *  3. 그래서 슬라이드에 얹힌 수치가 강당이 아니라 팔 길이 거리로 조판됐다.
 *  4. (전환) 층을 가르는 축은 도메인이 아니라 순위와 거리의 소유다.
 *  5. Editorial은 순위 다섯 단계만 갖고, 거리는 매체가 자기 스코프에서 지정한다.
 *  6. 매체 단계를 경유해 매핑했으므로 프리셋 전환이 Editorial까지 전파된다.
 *  7. 캔버스가 고정 논리 크기라 모든 px가 표시 크기와 무관한 설계 px다.
 *  8. 계약은 문서가 아니라 게이트가 지킨다.
 *  9. 정적이 못 잡는 결함은 실행 관문이 렌더된 캔버스에서 잡는다.
 * 10. 다음 확장은 어휘가 아니라 실제 덱에서 나온 수요를 따른다.
 */

const meta = {
  title: 'Decks/매체와 논증의 분리',
  parameters: {
    docs: {
      description: {
        component:
          'LDS Slides와 Editorial의 경계를 어떻게 다시 그었는지에 대한 내부 기술 공유 덱입니다. '
          + '`keynote` 프리셋, 15장, 약 10분 분량.',
      },
    },
  },
};

export default meta;

const AGENDA = ['확장과 결함', '경계 재설정', '집행'];

const BEFORE = `// Editorial — KeyFigure (이전)
<figcaption
  style={{
    fontSize: 'var(--body2-size)',
    lineHeight: 'var(--body2-line)',
  }}
>
  {claim}
</figcaption>`;

// 도판은 화면 해상도에서 다시 그린다 — 캡처를 붙이지 않는다.
// 폭은 매체 폭 정책을 따른다: 도판이 콘텐츠 폭을 가득 쓰고 스케일은
// viewBox가 맡는다 — 고정 420px였던 첫 판은 주석 레일과의 사이를 텅 비웠다
// (시각 리뷰 지적). 확대되며 선·글자가 비례로 굵어지는 것이 투영의 관용구다.
const SeamDiagram = () => (
  <svg viewBox="0 0 420 190" style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Editorial 순위 다섯 단계를 매체가 거리로 재지정하는 구조">
    <text x="0" y="14" fill="var(--color-semantic-label-alternative)" style={{ fontSize: 'var(--slides-fine-size)' }}>
      Editorial — 순위
    </text>
    <text x="270" y="14" fill="var(--color-semantic-label-alternative)" style={{ fontSize: 'var(--slides-fine-size)' }}>
      매체 — 거리
    </text>
    {['value', 'claim', 'note', 'note-body', 'caption'].map((step, order) => {
      const y = 40 + order * 28;
      const lit = step === 'claim';
      return (
        <g key={step}>
          <rect
            x="0"
            y={y - 15}
            width="150"
            height="22"
            rx="4"
            fill={lit ? 'var(--editorial-emphasis-surface)' : 'var(--color-semantic-fill-normal)'}
          />
          <text x="10" y={y} fill="var(--color-semantic-label-neutral)" style={{ fontSize: 'var(--slides-fine-size)' }}>
            {step}
          </text>
          <line
            x1="155"
            y1={y - 4}
            x2="265"
            y2={y - 4}
            stroke={lit ? 'var(--editorial-emphasis)' : 'var(--color-semantic-line-normal-normal)'}
            strokeWidth={lit ? 2 : 1}
          />
          {lit && <circle data-annotation-anchor="claim-step" cx="210" cy={y - 4} r="4" fill="var(--editorial-emphasis)" />}
          <rect x="270" y={y - 15} width="150" height="22" rx="4" fill="var(--color-semantic-fill-normal)" />
          <text x="280" y={y} fill="var(--color-semantic-label-neutral)" style={{ fontSize: 'var(--slides-fine-size)' }}>
            {['slides-title', 'slides-body', 'slides-caption', 'slides-fine', 'slides-fine'][order]}
          </text>
        </g>
      );
    })}
  </svg>
);

export const Deck = {
  name: '매체와 논증의 분리',
  render: () => (
    <DeckViewer label="매체와 논증의 분리">
      <TitleSlide
        eyebrow="LDS 플랫폼"
        title="매체와 논증의 분리"
        subtitle="LDS Slides · Editorial 아키텍처 검토 · 2026 3분기"
        foot="LDS 플랫폼 · 2026 Q3"
        notes="이 덱은 왜 두 저장소가 생겼는지가 아니라, 둘 사이의 선을 어디에 다시 그었는지에 대한 이야기다. 결론부터 말하지 않고 결함을 먼저 보여준다. [~1분]"
      />

      <AgendaSlide
        items={AGENDA}
        foot="LDS 플랫폼 · 2026 Q3"
        notes="세 챕터. 결함 → 경계 → 집행. 질문은 각 챕터 끝에서 받는다."
      />

      <SectionSlide index={1} title="확장과 결함" subtitle="자매 저장소가 늘어난 방식과, 그때 함께 자란 문제" foot="LDS 플랫폼 · 2026 Q3" />

      <ContentSlide
        eyebrow="확장 방식"
        title="자매 저장소 패턴"
        governing="LDS는 도메인마다 독립 저장소를 두고 고정된 Core를 소비하는 방식으로 확장해 왔다."
        foot="LDS 플랫폼 · 2026 Q3"
        notes="Robotics가 이 패턴의 첫 사례였다. 3D, Slides, Editorial이 같은 틀을 따랐다. 핵심은 Core를 고정 버전으로 소비한다는 점 — 그래서 상류 변경이 하류를 조용히 흔들지 않는다. [~1분 30초]"
      >
        <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
          <Step at={1} as="li">저장소마다 자체 Storybook과 배포</Step>
          <Step at={2} as="li">Core·Product는 고정 버전으로 소비</Step>
          <Step at={3} as="li">토큰 접두사로 소유 경계를 선언</Step>
        </ul>
      </ContentSlide>

      <CodeSlide
        eyebrow="결함"
        title="매체를 가정한 컴포넌트"
        governing="Editorial 컴포넌트가 업스트림 타입 램프를 직접 참조하고 있었다."
        code={BEFORE}
        caption="lk-design-system-editorial · KeyFigure.jsx"
        highlight={[4, 5]}
        foot="LDS 플랫폼 · 2026 Q3"
        notes="이 두 줄이 문제의 전부다. 제품 램프를 직접 읽으면 '팔 길이에서 읽는 크기'가 컴포넌트 안에 박힌다. 슬라이드에 얹는 순간 그 가정이 틀린 가정이 된다. [~2분]"
      />

      <StatSlide
        eyebrow="측정"
        title="투사 거리 상실"
        governing="그래서 슬라이드에 얹힌 수치가 강당이 아니라 팔 길이 거리로 조판됐다."
        figures={[
          { value: 15, unit: 'px', label: '주장 문장 (이전)', claim: '제품 램프 그대로 조판.' },
          { value: 24, unit: 'px', label: '주장 문장 (이후)', claim: '투사 하한을 지킨 크기.', emphasis: true },
        ]}
        source="출처: lk-design-system-slides 브라우저 실측, 2026-07"
        foot="LDS 플랫폼 · 2026 Q3"
        notes="9px 차이가 아니라 60% 차이다. 뒷줄에서 읽히느냐 아니냐를 가른다. 이 수치는 실제 브라우저에서 computed style로 잰 값이다."
      />

      <StatementSlide
        eyebrow="전환점"
        statement="층을 가르는 축은 도메인이 아니라, 순위를 누가 갖고 거리를 누가 갖느냐다."
        foot="LDS 플랫폼 · 2026 Q3"
        notes="여기가 덱이 도는 지점이다. 처음에는 '인포그래픽과 슬라이드가 비슷하니 합칠까'였는데, 실제 축은 그게 아니었다. 잠깐 멈추고 넘어간다. [~1분]"
      />

      <SectionSlide index={2} title="경계 재설정" subtitle="순위는 위로, 거리는 매체로" foot="LDS 플랫폼 · 2026 Q3" />

      <FigureSlide
        eyebrow="접합부"
        title="다섯 단계와 재지정"
        governing="Editorial은 순위 다섯 단계만 갖고, 거리는 매체가 자기 스코프에서 지정한다."
        annotations={[
          {
            id: 'claim',
            anchor: 'claim-step',
            title: '주장 단계',
            body: '매체가 --slides-body로 재지정하면 컴포넌트는 아무것도 모른 채 따라간다.',
            emphasis: true,
          },
          { id: 'floor', title: '바닥 두 단계', body: 'note-body와 caption은 같은 곳에 떨어진다 — 하한 아래로는 무게와 색이 순위를 나른다.' },
        ]}
        caption="슬라이드 표면에 스코프된 재지정 블록"
        source="출처: tokens/slides.css, 2026-07"
        foot="LDS 플랫폼 · 2026 Q3"
        notes="왼쪽이 Editorial이 소유하는 순위, 오른쪽이 매체가 대는 거리다. 화살표가 재지정이다. 중요한 건 매체 단계를 경유한다는 것 — 그래서 briefing 프리셋으로 바꾸면 Editorial 층까지 공짜로 따라온다. [~2분]"
      >
        <SeamDiagram />
      </FigureSlide>

      <ContentSlide
        eyebrow="캔버스"
        title="설계 픽셀"
        governing="캔버스가 고정 논리 크기라 모든 px가 표시 크기와 무관한 설계 px다."
        foot="LDS 플랫폼 · 2026 Q3"
        notes="유동 박스였을 때는 박스만 줄고 타입은 고정이라, 토큰이 약속한 투사 하한이 정확히 한 폭에서만 참이었다. 지금은 캔버스를 통째로 스케일한다. 작성자가 본 구성이 강당에서 나오는 구성이다. [~1분 30초]"
      >
        <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
          <Step at={1} as="li">1280px 논리 캔버스를 컨테이너에 맞춰 끼운다</Step>
          <Step at={2} as="li">넘침은 늘어남이 아니라 잘림 — 흡수와 신고로 답한다</Step>
        </ul>
      </ContentSlide>

      <SectionSlide index={3} title="집행" subtitle="문서가 아니라 게이트" foot="LDS 플랫폼 · 2026 Q3" />

      <AssessmentSlide
        eyebrow="게이트"
        title="배포 전 관문 · 정적"
        governing="계약은 문서가 아니라 게이트가 지킨다."
        metrics={[
          { id: 'own', name: '스타일 소유권', target: '램프 직참조 0', actual: '0', status: 'met' },
          { id: 'cat', name: '카탈로그 일치', target: '소스와 동일', actual: '동일', status: 'met' },
        ]}
        caption="정적 두 관문은 빌드 전에, 소스 트리 위에서 선다"
        source="출처: lk-design-system-slides CI 실행 기록, 2026-07"
        foot="LDS 플랫폼 · 2026 Q3"
        notes="정적 둘. 소유권 검사는 램프 직참조를 0으로 강제하고, 카탈로그 검사는 문서와 소스의 표류를 막는다. [~1분]"
      />

      <AssessmentSlide
        eyebrow="게이트"
        title="배포 전 관문 · 실행"
        governing="정적이 못 잡는 결함은 실행 관문이 렌더된 캔버스에서 잡는다."
        metrics={[
          { id: 'play', name: 'play 단언', target: '전건 통과', actual: '35 / 35', status: 'met' },
          { id: 'fit', name: '캔버스 초과', target: '0건', actual: '0 / 35', status: 'met' },
        ]}
        caption="실행 두 관문은 headless Chromium이 렌더한 캔버스 위에서 선다"
        source="출처: lk-design-system-slides CI 실행 기록, 2026-07"
        foot="LDS 플랫폼 · 2026 Q3"
        notes="실행 둘. 초과 검사는 play가 못 잡는 걸 잡는다 — 잘린 슬라이드도 렌더는 멀쩡하고 단언도 통과하기 때문이다. [~1분]"
      />

      <RoadmapSlide
        eyebrow="다음"
        title="수요 기반 확장"
        governing="다음 확장은 어휘가 아니라 실제 덱에서 나온 수요를 따른다."
        phases={[
          { id: 'decks', date: '2026-08', label: '실제 덱 작성', body: '어휘의 빈칸은 여기서 드러난다', emphasis: true },
          { id: 'vocab', date: '2026-09', label: '어휘 선별 확장', body: '카탈로그 기준으로 판단' },
          { id: 'export', label: 'PDF·PPTX 내보내기', body: '수요 확인 후 착수' },
        ]}
        source="출처: README 다음 단계, 2026-07"
        foot="LDS 플랫폼 · 2026 Q3"
        notes="날짜 없는 마지막 단계는 레일에 놓지 않고 각주로 빠진다 — 추정 배치를 하지 않는 게 이 컴포넌트의 계약이다."
      />

      <EndSlide
        message="컴포넌트는 순위를 갖고, 매체는 거리를 갖는다."
        contact="LDS 플랫폼 · jinhyuk2me@gmail.com"
        foot="LDS 플랫폼 · 2026 Q3"
        notes="Q&A 동안 이 한 줄이 화면에 남는다. 질문이 없으면 '리포트 매체를 붙일 때 무엇이 재사용되는가'를 먼저 던진다."
      />
    </DeckViewer>
  ),
};
