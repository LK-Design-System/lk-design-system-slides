---
name: lds-deck
description: "@lk-design-system/lds-slides-ui 컴포넌트로 발표·열람 덱을 만든다. 사용자가 발표자료·슬라이드·덱·장표·프레젠테이션·주간보고를 만들어 달라고 하면 — '~에 대한 발표자료 만들어줘', '이 문서로 슬라이드 만들어줘', '보고용 장표 구성해줘' — 이 스킬을 사용한다. 산출물은 raw HTML이나 PPTX가 아니라 lds-slides-ui 컴포넌트를 조립한 React 덱 모듈이다."
---

# lds-deck — LDS Slides 덱 저작 규칙

## 설치

이 디렉터리(`@lk-design-system/lds-slides-ui/docs/agent-skills/lds-deck/`)를 소비
레포의 `.claude/skills/lds-deck/`로 통째로 복사한다. 내용은 도구 중립 마크다운이라
다른 에이전트에서는 그대로 규칙 문서로 읽어도 된다.

## 전제 — 이 스킬이 하는 일과 하지 않는 일

**스타일을 만드는 스킬이 아니다.** 슬라이드의 지오메트리·타입 스케일·줄바꿈·
강조 중재는 전부 `@lk-design-system/lds-slides-ui`가 이미 소유한다. 스킬이 하는
일은 셋이다:

1. 내용을 논증(또는 보고) 구조로 편성한다 → [references/content-rules.md](references/content-rules.md)
2. 각 슬라이드를 컴포넌트 어휘에 매핑한다 → [references/components.md](references/components.md)
3. 덱 하나를 한 파일로 조립한다

**두 레퍼런스를 모두 읽은 뒤에 개요를 짜기 시작한다.**

기계 계약의 정본은 패키지 루트의 `catalogue.json`이다(레이아웃 어휘 + 규칙 10개).
산문과 컴포넌트 동작이 다르면 컴포넌트가 정본이다.

## 금지 사항 (소유 경계)

- 새 CSS 파일·새 토큰·인라인 폰트 크기(px 직접 지정) 금지. 타입은 `--slides-*`
  단계만, 색은 `--color-semantic-*` 토큰만 쓴다. 업스트림 램프 변수
  (`--display1-size` 등) 직접 참조는 프리셋 축을 무시하고 투사 하한을 조용히
  깨므로, 컴포넌트에서든 덱 마크업에서든 금지다.
- 슬라이드 레이아웃을 새로 발명하지 않는다. 필요한 패턴이 어휘에 없으면 우회하지
  말고 사용자에게 알린다 — 어휘 확장은 lds-slides-ui가 결정한다.
- 수치·주석·비교표·타임라인을 손으로 그리지 않는다. 위임 슬라이드
  (`StatSlide` `FigureSlide` `CompareSlide` `RoadmapSlide` `AssessmentSlide`)에
  데이터로 넘긴다.

## 워크플로

### 1단계 — 입력과 kind 판별

입력: **A. 주제만** (구조·내용을 직접 설계) · **B. 자료 제공** (문서/노트/데이터를
논증으로 증류) · **C. 대본 제공** (대본 구조에 맞춰 구성).

**kind — 발표하러 가는 덱인가, 읽으라고 보내는 덱인가.**

- `present`(기본): 발표자가 말로 덮는 덱. 거버닝 체인이 논증을 이룬다.
- `read`: 회람·열람되는 덱(주간보고, leave-behind). `DeckViewer kind="read"`를
  달고 [content-rules.md §8](references/content-rules.md)의 열람 프로파일을
  따른다 — 거버닝 없이 명사형 제목+전시물로 완결, 본문 예산 300자, 상단 정렬,
  **빈 슬롯은 비워둔다**, 표지는 제목·소속·보고자·주차.

슬라이드 수 가늠: 5분 ≈ 6–9장, 10분 ≈ 10–15장, 20분 ≈ 18–25장. 열람 덱은 장수가
줄고 장당 밀도가 올라간다.

### 2단계 — 프리셋 결정

`preset`은 토큰 축이지 레이아웃 축이 아니다. `keynote`(기본)는 강당 발표, 본문
24px 투사 하한. `briefing`은 배포·회람용이라 각 단계가 한 눈금 내려가고 세이프
존이 좁아진다. `DeckViewer preset="briefing"`으로 덱에 한 번 선언한다 —
슬라이드의 `preset`은 오버라이드다.

### 3단계 — 개요와 고스트 덱 테스트

한국 장표 골격: **표지 → 목차 → 본문 챕터들 → 막지**. 슬라이드마다 컴포넌트,
제목(**명사형 종결**), 거버닝(**완결 문장 한 개의 주장**)을 정한다.

- `present`: **거버닝만 이어 읽어** 논증 전체가 성립해야 한다.
- `read`: 거버닝이 없으므로 **명사형 제목만 이어 읽어** 보고의 목차가 서야 한다.

성립하지 않으면 슬라이드를 만들기 전에 개요를 고친다. 개요를 사용자에게 보여주고
확인받은 뒤 조립한다(10장 이하 단순 덱은 생략 가능).

### 4단계 — 조립

덱 하나를 한 모듈로 만든다. 소비 레포의 관례를 따르되(라우트·페이지·스토리 등
그 레포가 React 컴포넌트를 두는 자리), 덱 자체는 이 형태다:

```jsx
import {
  DeckViewer, TitleSlide, AgendaSlide, SectionSlide, ContentSlide, EndSlide,
} from '@lk-design-system/lds-slides-ui';
import '@lk-design-system/lds-slides-ui/styles.css';

export function QuarterlyDeck() {
  return (
    <DeckViewer label="<덱 제목>" kind="present">
      <TitleSlide eyebrow="…" title="…" subtitle="…" />
      <AgendaSlide items={['…', '…']} />
      <SectionSlide index={1} title="…" />
      {/* … */}
      <EndSlide message="…" contact="…" />
    </DeckViewer>
  );
}
```

스타일은 core → theme → slides 순으로 로드한다(소비 앱이 이미 core/theme을
불렀다면 slides의 `styles.css`만 추가).

- 챕터 사이에 `AgendaSlide`를 `current={n}`으로 재사용하면 진행 표시가 된다.
- 자유 마크업은 `ContentSlide`/`SplitSlide`의 children 안에서만. 타입은
  `var(--slides-body-*)` 등 `--slides-*`, 색은 semantic 토큰.
- 발표자 노트는 각 슬라이드의 `notes` prop(`N` 키로 표시). 대화체로, 슬라이드
  텍스트의 반복이 아니라 확장을 쓴다. **논증에 필수인 근거를 노트에만 두지
  않는다** — 회람본에는 노트가 없다.
- 발표자 신호에 맞춰 드러낼 항목은 `Step`으로 감싼다. 공개는 리플로를 일으키지
  않으므로 맞춤 확인은 전부 공개된 상태에서 한다.

**구도 — present 전용 규칙** (열람 페이지는 문서처럼 위에서 아래로 읽히므로
본문이 제목에 붙는다; 가운데 정렬은 읽기 단절이다):

- **위임 슬라이드(Stat/Roadmap/Assessment/Compare)의 center는 자동이다**:
  지표 행·가로 레일은 항상, 표는 행 ≤4일 때 규칙으로 center에 앉고, read
  덱에서는 top으로 해소된다. `ContentSlide` 자유 마크업만 수동 — 본문이
  짧으면(불릿 서너 줄) `anchor="center"`, 2/3 이상 채우면 top.
- 희소 슬라이드(Statement·Section·End)의 타입 단은 **분량이 자동으로 정한다**
  (공백 제외 12자 이하 → hero). 짧은 발화를 키우려고 스타일을 만지지 않는다.
- 표·지표·로드맵 행은 자동으로 전폭을 나눠 갖는다. 좁게 만들려고 폭을 죽이지
  않는다 — 열이 적으면 넓게 읽히는 것이 슬라이드의 관용구다.
- `ImageSlide`(contained) 사진 폭은 **잔여 높이 × 종횡비**로 정해진다. 작아
  보이면 `bleed`를 쓰거나 헤더를 줄인다.
- `SplitSlide` pane의 첫 줄 헤더는 **eyebrow 문법**(caption 스케일 + 자간 +
  포인트 컬러)으로 쓴다 — 본문과 크기가 같으면 위계가 무게 하나에 매달린다.
- `FigureSlide` 도판은 콘텐츠 폭을 가득 쓴다. 차트 children은 `width: '100%'`로
  두고 스케일은 svg viewBox가 맡는다.

**열람 페이지의 어휘**: 2단계 리스트는 `TopicList`(세 번째 위계는 들여쓰기가
아니라 표나 페이지 분할), 본문 곁 증거는 `ExhibitRow`(잔여 높이 주도 — 고정 px
높이 금지), 주차 계획은 `WeekSpanRows`(시간 격자 + 무단절 스팬 바 + 계속 화살촉).

### 5단계 — QA

**소비 레포에는 저장소의 기계 게이트(`check:deck-content`·`check:slide-overflow`)가
없다.** 그러니 [content-rules.md §7 체크리스트](references/content-rules.md)를
사람이 전부 확인한다. 특히 기계가 대신 잡아주지 않는 것:

1. **넘침** — 캔버스는 `overflow: hidden`이라 넘친 내용은 스크롤도 경고도 없이
   잘린다. 각 슬라이드를 실제 크기로 띄워 세이프 존을 넘치지 않는지 눈으로
   확인한다. 넘치면 **스타일을 줄이지 말고 내용을 쪼갠다**(슬라이드 추가가 정답,
   폰트 축소는 오답).
2. **명사형 종결·거버닝 형태**(1문장 ≤55자), **불릿 ≤7**, **본문 상한**
   (present 140자 / read 300자), **출처**(데이터를 보였으면 반드시),
   **StatementSlide 덱당 ≤2**, **막지는 감사 인사가 아니라 논증의 잔향**.
3. 덱을 처음부터 끝까지 넘겨보며 고스트 덱(또는 제목 체인) 테스트를 다시 한다.

컴포넌트가 런타임에 스스로 지키는 것은 따로 확인할 필요가 없다: 강조 예산 중재,
줄바꿈·구 묶음, 페이지 번호, `Fit`의 축소 하한.

## 산출 규칙

- 산출물: 덱 모듈 한 파일. 발표 전체 대본이 필요하면 `<덱이름>.script.md`를 옆에
  둔다.
- 내용 언어는 대화 언어를 따른다. 제목 명사형 종결 규약은 한국어 덱에 적용.
- **PDF는 덱 URL에 `?lds-print=1`을 붙이면 나온다.** 덱이 인쇄 시트로 바뀌어
  전 장이 한 장씩 페이지로 쌓이고, 브라우저 인쇄(여백 없음·배경 그리기)로
  저장하면 1280×720 페이지의 PDF가 된다. 글자는 이미지가 아니라 글자로 남는다
  (선택·검색 가능). 단계 공개는 접혀서 최종 상태로 인쇄된다 — 열람물은 방이
  마지막에 본 것을 보여주는 게 맞다.
  - 인쇄 시트는 **페이지 원점에 놓여야** 한다. 감싸는 레이아웃의 패딩이 첫
    페이지를 밀면 모든 슬라이드가 장 경계에서 잘린다.
- PPTX는 아직 없다. 요청받으면 PDF 경로를 안내한다 (동종 제품들의 PPTX도 전부
  이미지 기반이라 텍스트가 선택되지 않는다 — PDF가 더 나은 산출물이다).
