---
name: lds-deck
description: "LDS Slides 컴포넌트로 발표 덱을 생성한다. 이 저장소(lk-design-system-slides) 안에서 사용자가 발표자료·슬라이드·덱·장표·프레젠테이션을 만들어 달라고 하면 — '~에 대한 발표자료 만들어줘', '이 문서로 슬라이드 만들어줘', '보고용 장표 구성해줘' 등 — 이 스킬을 사용한다. 산출물은 raw HTML이나 PPTX가 아니라 @lk-design-system/lds-slides-ui 컴포넌트를 조립한 덱 스토리(stories/decks/*.stories.jsx)이며, Storybook(포트 6009)에서 재생한다."
---

# lds-deck — LDS Slides 덱 생성 스킬 (저장소 판)

**두 판이 있고 규칙은 한 벌이다.** 이 파일은 lds-slides-ui **저장소 안에서**
덱을 저작할 때의 판이다 — 산출물이 덱 스토리이고, Storybook과 기계 게이트가
있다. 소비 레포용 판은 [`docs/agent-skills/lds-deck/SKILL.md`](../../../docs/agent-skills/lds-deck/SKILL.md)
로 패키지에 실려 나가며, 워크플로(조립 위치·QA 수단)만 다르다. 내용 규율과
컴포넌트 어휘는 두 판이 **같은 파일 두 개**를 읽는다(`docs/agent-skills/lds-deck/
references/`) — 사본을 만들지 말 것, 규칙이 두 벌이 되는 순간 어긋난다.

## 전제

이 스킬은 **내용을 만들고 컴포넌트를 조립하는 스킬**이지, 스타일을 만드는 스킬이 아니다.
슬라이드의 지오메트리·타입 스케일·레이아웃 계약은 전부 `@lk-design-system/lds-slides-ui`가
이미 소유한다. 스킬이 하는 일은 세 가지다:

1. 내용을 논증 구조로 편성한다 → [../../../docs/agent-skills/lds-deck/references/content-rules.md](../../../docs/agent-skills/lds-deck/references/content-rules.md)
2. 각 슬라이드를 컴포넌트 어휘에 매핑한다 → [../../../docs/agent-skills/lds-deck/references/components.md](../../../docs/agent-skills/lds-deck/references/components.md)
3. `stories/decks/<덱이름>.stories.jsx` 한 파일로 조립한다

**두 레퍼런스를 모두 읽은 뒤에 개요를 짜기 시작한다.**

## 금지 사항 (소유 경계)

- 새 CSS 파일·새 토큰·인라인 폰트 크기(px 직접 지정) 금지. 타입은 `--slides-*` 단계만,
  색은 `--color-semantic-*` 토큰만 사용한다. 업스트림 램프 변수(`--display1-size` 등)
  직접 참조는 `check:style-ownership`가 컴포넌트에서 잡는 위반이며, 덱 콘텐츠 마크업에서도
  같은 이유로 금지다 — 프리셋 축이 무시되고 투사 하한이 조용히 깨진다.
- 슬라이드 레이아웃을 새로 발명하지 않는다. 필요한 패턴이 어휘에 없으면 우회하지 말고
  사용자에게 알린다 (레이아웃 어휘 확장은 mckinsey-pptx 카탈로그 기준으로 저장소가 결정).
- 수치·주석·비교표·타임라인을 손으로 그리지 않는다. Editorial 위임 슬라이드
  (`StatSlide` `FigureSlide` `CompareSlide` `RoadmapSlide` `AssessmentSlide`)에 데이터로 넘긴다.

## 워크플로

### 1단계 — 입력 판별

- **A. 주제만**: "X에 대한 10분 발표" → 구조·내용을 직접 설계
- **B. 자료 제공**: 문서/노트/데이터 → 자료를 논증으로 증류
- **C. 대본 제공**: 발표 대본 → 대본 구조에 맞춰 슬라이드 구성

슬라이드 수 가늠: 5분 ≈ 6–9장, 10분 ≈ 10–15장, 20분 ≈ 18–25장.
보고용(회람) 덱은 발표용보다 장수가 줄고 장당 밀도가 올라간다.

**kind 판별 — 발표하러 가는 덱인가, 읽으라고 보내는 덱인가.** 회람·열람이
목적(주간보고, leave-behind)이면 `DeckViewer kind="read"`를 달고
[content-rules.md §8 열람 프로파일](../../../docs/agent-skills/lds-deck/references/content-rules.md)을 따른다:
거버닝 없이 명사형 제목+전시물로 완결, 본문 예산 300자, 상단 정렬, 빈
슬롯은 비워둔다. 표지는 제목·소속·보고자·주차. 열람 페이지의 어휘는
`TopicList`·`ExhibitRow`·`WeekSpanRows`. 레퍼런스 실물: Decks/주간 업무현황
파일럿. 아래 3~4단계의 거버닝·고스트 덱·구도 지침은 **present 덱의 것**이다.

### 2단계 — 프리셋 결정

`preset`은 토큰 축이지 레이아웃 축이 아니다. 물어보거나 맥락으로 정한다:

- `keynote` (기본): 강당 발표. 본문 24px 투사 하한.
- `briefing`: 배포·회람용 보고서 덱. 각 단계가 한 눈금 내려가고 세이프 존이 좁아진다.

프리셋은 `DeckViewer preset="briefing"`으로 덱에 한 번 선언한다 — 슬라이드의
`preset`은 오버라이드다 (kind와 축 대칭, ADAPTIVE_CONTRACTS_PROPOSAL 변경 1).

### 3단계 — 개요 작성과 고스트 덱 테스트

한국 장표 골격을 따른다: **표지(TitleSlide) → 목차(AgendaSlide) → 본문 챕터들
(SectionSlide + 콘텐츠 슬라이드) → 막지(EndSlide)**.

슬라이드마다 세 가지를 정한다:

| 항목 | 규칙 |
|------|------|
| 컴포넌트 | components.md의 어휘에서 선택 |
| 제목(title) | **명사형 종결** ("1위 달성" — "~했다" 금지) |
| 거버닝(governing) | **완결 문장 한 개의 주장** — 본문이 이를 입증 |

**고스트 덱 테스트**: 거버닝 메시지만 순서대로 이어 읽는다. 그것만으로 논증 전체가
성립해야 한다. 성립하지 않으면 슬라이드를 만들기 전에 개요를 고친다.
(제목이 아니라 거버닝이 문장을 소유한다 — 제목만 읽으면 목차, 거버닝만 읽으면 논증.)

개요를 사용자에게 보여주고 확인받은 뒤 조립한다. 10장 이하 단순 덱은 생략 가능.

### 4단계 — 조립

`stories/decks/<덱이름>.stories.jsx` 한 파일로 작성한다:

```jsx
import React from 'react';
import { DeckViewer, TitleSlide, AgendaSlide, SectionSlide, /* … */ EndSlide } from '../../src/index.js';

const meta = { title: 'Decks/<덱 제목>' };
export default meta;

export const Deck = {
  name: '<덱 제목>',
  render: () => (
    <DeckViewer label="<덱 제목>">
      <TitleSlide eyebrow="…" title="…" subtitle="…" />
      <AgendaSlide items={['…', '…']} />
      <SectionSlide index={1} title="…" />
      {/* … */}
      <EndSlide message="…" contact="…" />
    </DeckViewer>
  ),
};
```

- 챕터 사이에 `AgendaSlide`를 `current={n}`으로 재사용하면 진행 표시 슬라이드가 된다.
- 자유 마크업은 `ContentSlide`/`SplitSlide`의 children 안에서만. 타입 단계는
  `var(--slides-body-*)` 등 `--slides-*`, 색은 semantic 토큰.
- **발표자 노트는 각 슬라이드의 `notes` prop**에 싣는다 (DeckViewer가 `N` 키로 표시).
  대화체로, 슬라이드 텍스트의 반복이 아니라 확장을 쓴다. 타이밍 힌트(`[~2분]`) 허용.
  발표 전체 대본이 필요하면 추가로 `<덱이름>.script.md`를 같은 폴더에 생성한다.
- 발표자 신호에 맞춰 드러낼 항목은 `Step`으로 감싼다(`at` 순번, `as`로 시맨틱 유지).
  공개는 리플로를 일으키지 않으므로 맞춤 확인은 전부 공개된 상태에서 한다.

**구도 — 모자란 슬라이드를 위에 못박아 두지 않는다** (2026-08-16 규칙,
**present 전용** — 투사 캔버스의 균형 규칙이다. `kind="read"` 페이지는
문서처럼 위에서 아래로 읽혀 본문이 제목에 붙는다; 가운데 정렬은 읽기
단절이다):

- **위임 슬라이드(Stat/Roadmap/Assessment/Compare)의 center는 자동이다**
  (ADAPTIVE_CONTRACTS_PROPOSAL 변경 2): 지표 행·가로 레일은 항상, 표는 행
  ≤4일 때 규칙으로 center에 앉고, read 덱에서는 top으로 해소된다. 손으로
  `anchor`를 주는 것은 규칙을 뒤집을 때뿐이다. `ContentSlide` 자유
  마크업만 수동이 남는다 — 본문이 짧으면(불릿 서너 줄) `anchor="center"`,
  영역을 2/3 이상 채우면 기본값(top). 헤더는 어느 쪽이든 상단 고정.
- 희소 슬라이드(Statement·Section·End)의 타입 단은 **분량이 자동으로
  정한다**(공백 제외 12자 이하 → hero 112px). 짧은 발화를 hero로 만들려고
  스타일을 만지지 말고, 문장을 hero로 키우려고 자르지도 말 것 — 규칙이
  구도다.
- 표(OptionAssessment·StatusAssessment)와 지표·로드맵 행은 슬라이드에서
  자동으로 전폭을 나눠 갖는다. 좁은 표를 원한다고 폭을 죽이는 스타일을
  덧대지 않는다 — 열이 적으면 넓게 읽히는 것이 슬라이드의 관용구다.
- ImageSlide(contained)의 사진 폭은 **잔여 높이 × 종횡비**로 정해진다
  (파일 크기가 아니라). 헤더·캡션이 다 있는 슬라이드에서 사진이 작아
  보이면 그건 계약이 일한 것이다 — 더 크게 원하면 `bleed`를 쓰거나
  헤더를 줄인다.
- SplitSlide pane의 첫 줄 헤더는 본문과 같은 크기의 볼드가 아니라
  **eyebrow 문법**(caption 스케일 + 자간 + 포인트 컬러 또는 회색)으로
  쓴다 — 본문과 크기가 같으면 위계가 무게 하나에 매달린다.
- FigureSlide의 도판은 슬라이드에서 **콘텐츠 폭을 가득 쓴다**(표와 같은
  매체 폭 정책). 차트 children은 `width: '100%'`로 컨테이너를 따르게
  만들고, 스케일은 svg viewBox가 맡는다 — 확대되며 선도 비례로 굵어져
  투영에 맞다. 차트 안에 라벨 텍스트를 그려 넣었다면 확대 후 크기를
  실물로 확인할 것.

### 5단계 — QA

1. `npm run storybook` (127.0.0.1:6009) → `Decks/<덱 제목>` 확인. 각 슬라이드에서
   내용이 세이프 존을 넘치지 않는지 본다 — 넘치면 스타일을 줄이지 말고 **내용을 쪼갠다**
   (슬라이드 추가가 정답, 폰트 축소는 오답).
2. content-rules.md의 체크리스트를 통과시킨다.
3. 저장소 게이트: `npm run check:storybook` (소유권 검사 + 모든 play 단언).

## 산출 규칙

- 산출물: `stories/decks/<덱이름>.stories.jsx` (+ 선택 `<덱이름>.script.md`)
- 내용 언어는 대화 언어를 따른다. 제목 명사형 종결 규약은 한국어 덱에 적용.
- PPTX/PDF 내보내기는 아직 이 저장소에 없다. 요청받으면 "배포 워크플로는 README 다음
  단계 항목"임을 알리고, 임시로는 Storybook 화면 캡처를 안내한다.
