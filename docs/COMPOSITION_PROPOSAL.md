# 제안 — 슬라이드 구도: 허용된 공간을 쓰는 규칙 (레이아웃 층)

상태: **구현됨** (2026-08-16 작성, 같은 날 A·B·C 전부 구현)
근거: [references/SLIDE_SYSTEMS_COMPARISON.md](./references/SLIDE_SYSTEMS_COMPARISON.md),
[SCALE_DENSITY_PROPOSAL.md](./SCALE_DENSITY_PROPOSAL.md)(토큰 층 — 구현 완료)

토큰 층이 "얼마나 크게"를 고쳤다면, 이 문서는 "어디에 어떻게 놓는가"를
다룬다. 촉발 사례: briefing CompareSlide에서 표가 고유 폭으로 좌상단에
쪼그라들고 캔버스 우측 60%·하단 50%가 비는 화면 — 넘침(Fit·오버플로
게이트)에는 정교한 계약이 있는데 **모자람에는 규칙이 하나도 없다.**

업계의 답 세 가지가 조사에 있다: 폭 분배(PPT SmartArt — 항목이 적을수록
크게 나눠 갖는다), 희소 슬라이드 전용 구도(Slidev fact/statement — 중앙 +
점보 타입), 슬라이드 단위 구도 전환(Marp lead). 각각을 A·B·C로 옮긴다.

## A. 폭 분배 — 표와 지표가 허용 폭을 나눠 갖는다 (구현됨)

**문제.** editorial 표(OptionAssessment·StatusAssessment)는 `inline-block` +
고유 폭이라 내용만큼만 차지한다. 제품 문서(팔 거리, 흐르는 본문)에서는 그게
맞다 — 표가 본문 폭을 다 먹으면 안 된다. 슬라이드(고정 캔버스, 표가 곧
내용)에서는 반대다 — 안 먹으면 낭비다. **폭 정책은 매체 소유다.** 타입
seam·밀도 seam과 같은 구조로 폭 seam을 만든다:

```css
/* tokens/editorial.css — 기본값은 제품 매체: 고유 폭 */
--editorial-table-width: auto;

/* tokens/slides.css — :root [data-lds-slide-surface] */
--editorial-table-width: 100%;   /* 슬라이드에서 표는 콘텐츠 영역을 가득 쓴다 */
```

컴포넌트 쪽은 figure와 table이 이 변수를 읽는다. 열 분배는 브라우저 테이블
레이아웃이 알아서 한다 — 열이 적을수록 한 열이 넓어지는 것이 정확히
SmartArt의 개수 적응이다.

지표 행(StatSlide)은 seam이 필요 없다 — 슬라이드 소유 레이아웃이므로 지표
카드에 `flex: 1 1 0`을 직접 준다. 지표가 2개면 반씩, 4개면 1/4씩 나눠 갖고,
강조 카드의 배경면이 실제 면적을 갖게 된다.

**하지 않는 것**: 세로 방향으로 표를 늘리는 것(행 높이 부풀리기는 밀도
위반), 제품 매체의 표 폭 변경(기본값 auto 유지).

## B. 희소 슬라이드 구도 — 분량이 단을 정한다 (구현됨)

Statement·Section·End가 가로 중앙 구도로 전환하고, **텍스트 분량이 타입
단을 정한다** (`src/components/slides/sparseScale.js`): 공백 제외 12자
이하의 짧은 발화("집행", "감사합니다", 챕터명)는 hero(112px, 캔버스 15.6%),
문장은 display(56px) 유지. prop의 순수 함수라 결정론적이고(모션 렌더 안전),
`data-slide-scale`로 선언되어 play가 단언한다.

당초안("hero 소비 + 중앙")에서 조정된 것 두 가지, 근거와 함께:

- **일괄 hero가 아니라 분량 적응.** 실덱 측정 결과 StatementSlide·EndSlide의
  실제 내용은 문장이다("잔향 한 줄이 막지의 전부입니다."). 문장을 112px로
  올리면 9.8자/행으로 여러 줄의 벽이 된다 — Slidev도 fact(8xl)와
  statement(6xl)를 나눈다. 분량 적응이 그 구분의 우리식 표현이고,
  "허용된 공간에 따라 동적으로"라는 원래 문제의식과도 정합한다.
- **TitleSlide 제외.** 표지 제목은 eyebrow·subtitle을 거느린 위계라 좌측
  시작 정렬이 맞고, 스케일도 PPT 표지(8.1%)와 동급(7.8%)이라 격차가 없다.
  조사 기준표가 근거다.

## C. ContentSlide 세로 앵커 (구현됨)

`anchor="center"` 옵트인 prop. 기본값 `top`(업계 워크호스 표준, 시각 변화 0),
`center`면 헤더는 그대로 두고 **잔여 공간 안에서 콘텐츠 블록만 세로 중앙**.
Marp `lead`의 이식이다. ContentSlide를 감싸는 Stat·Compare·Assessment 계열은
rest 전파로 같은 prop을 받는다. 짧은 표 하나짜리 슬라이드에서 하단 절반이
죽는 화면(이 문서의 촉발 사례)에 덱 작성자가 쓰는 도구다.

## 실덱 리뷰 후속 (2026-08-16, A·B·C 반영 상태에서 덱 2종 전 슬라이드 검토)

반영분은 실덱에서 의도대로 동작했다 — 간지 hero 3/3, 문장형 display 2/2
(오판 0), 비교표 전폭, 지표 3분할. 리뷰에서 남은 것, 심한 순서:

1. **AgendaSlide가 현 최약체.** 목차 3줄이 caption·body 스케일로 좌중앙에
   뭉치고 캔버스 ~80%가 빈다. 목차 재방문 패턴 때문에 덱마다 3~4회
   등장해 체감이 크다. 목차야말로 희소 슬라이드다 — 항목을 title
   스케일로 올리고 세로 리듬을 벌리는 B의 연장이 필요하다.
2. **RoadmapSlide(NarrativeTimeline)의 세로 나열.** 문서 관용구(세로
   타임라인)가 슬라이드에 그대로 올라와 좌측 뭉침 + 하단 공백. 3~4단계
   로드맵의 슬라이드 관용구는 가로 전개다 — 방향(orientation)을 매체가
   재지정하는 seam이 폭 seam의 다음 후보.
3. **anchor="center"가 도구로만 존재.** 덱이 아직 안 쓴다. lds-deck 스킬과
   작성 가이드에 "본문이 표·지표 하나면 anchor center" 지침이 실려야
   실제로 쓰인다.
4. 소소한 것: 간지 subtitle(24px)이 hero 제목(112px)과 4.7:1로 격차가 커
   한 단 승급 검토 여지 · StatSlide 숫자(40px)는 fact 모멘트치고 얌전 —
   hero 소비는 강조 예산과 조율해 별도 판단 · 전폭 4열 표는 열 간 시선
   이동이 길어져, 열이 적을 때의 폭 캡 또는 열폭 비율 계약 검토 여지.

## 검증 (A 기준)

- 제품 매체 스토리(editorial-*)에서 표 폭이 고유 폭 그대로인지 (computed
  width가 변경 전과 동일).
- 슬라이드 스토리(compare·assessment)에서 표가 콘텐츠 영역 폭과 같은지.
- 게이트 전량: style-ownership · 오버플로(폭이 넓어지면 줄바꿈이 줄어
  높이는 같거나 줄어든다) · play 단언 · 카탈로그 · 덱 콘텐츠.
