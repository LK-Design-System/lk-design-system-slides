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
(오판 0), 비교표 전폭, 지표 3분할. 리뷰에서 남은 것, 심한 순서
(**1~3은 같은 날 구현 완료**, 4는 보류 항목으로 남김):

1. **AgendaSlide가 현 최약체.** 목차 3줄이 caption·body 스케일로 좌중앙에
   뭉치고 캔버스 ~80%가 빈다. 목차 재방문 패턴 때문에 덱마다 3~4회
   등장해 체감이 크다. 목차야말로 희소 슬라이드다 — 항목을 title
   스케일로 올리고 세로 리듬을 벌리는 B의 연장이 필요하다.
2. **RoadmapSlide(NarrativeTimeline)의 세로 나열.** 문서 관용구(세로
   타임라인)가 슬라이드에 그대로 올라와 좌측 뭉침 + 하단 공백. 3~4단계
   로드맵의 슬라이드 관용구는 가로 전개다 — NarrativeTimeline이
   `direction="row"`를 얻었고(서사 계약은 한 경로, 레일만 두 렌더),
   RoadmapSlide가 row를 선택한다. Core에 가로 레일이 없어 위성이 자체
   렌더 중 — 업스트림 제안:
   `lk-design-system/docs/TIMELINE_ORIENTATION_PROPOSAL.md`.
   부수 발견: StatSlide 지표 gap이 존재하지 않는 `--space-9`를 참조해
   **조용히 0으로 떨어져 있었다**(함정 2의 실사례). `--editorial-figure-gap`
   seam 신설(기본 24px, 슬라이드 32px)로 로드맵 row와 함께 해소.
3. **anchor="center"가 도구로만 존재.** 덱이 아직 안 쓴다. lds-deck 스킬과
   작성 가이드에 "본문이 표·지표 하나면 anchor center" 지침이 실려야
   실제로 쓰인다.
4. 소소한 것 셋 — 처리 결과 (2026-08-16):
   - **간지 subtitle 승급: 구현.** subtitle이 제목의 단을 따라간다 —
     hero 제목 아래에서는 title 스케일(4.7:1 → 2.8:1), display 제목
     아래에서는 body 유지(2.3:1).
   - **StatSlide 숫자 hero: 업스트림 레버 필요로 보류.** 숫자는 Product
     `Stat`이 `--display2-size`를 인라인으로 소유한다(실측). 매체가
     재정의하면 "숫자는 Product 소유" 경계를 뚫는 것이라 하지 않는다.
     열려면 Stat이 크기 변수를 소비해야 한다 — A·B·C 반영 후에도 지표
     슬라이드가 밋밋하면 업스트림에 제안한다(트리거 기록).
   - **전폭 표 열폭 캡: 기각.** 조사에서 채택한 규칙 자체가 "열이
     적을수록 넓게"(SmartArt)이고, 실덱 재확인에서 3열 비교표는 전폭이
     자연스러웠다. 실덱에서 불편이 재현되면 그때 연다.

## 자체 시각 리뷰 2차 (2026-08-16, 캡처 45장 전수 육안 검토)

아젠다 라벨이 승급 문맥에 남겨진 결함(사용자 발견, 수정됨)을 계기로 같은
부류 — 이웃 요소가 승급을 안 따라온 경우 — 를 전수 재검토했다:

- 간지 index(40px)·subtitle(티어 추종)·hero 제목: 정합. briefing 간지
  (80px + 32px)도 비율 유지.
- Statement eyebrow: 처음엔 "강조 예산의 의도된 조용함"으로 유지 판정했으나
  **번복** (사용자 재지적) — 계약이 약속한 조용함의 수단은 색(label 톤)이지
  크기가 아니고, 희소 캔버스의 유일한 라벨이라는 점에서 아젠다 라벨과 같은
  경우다. caption→body 한 단 승급, 색 유지. EndSlide contact·인용
  attribution은 라벨이 아니라 후속 정보(fine print)라 유지가 맞다.
- **ImageSlide(contained)가 작아 보이는 것은 결함이 아니라 계약이다** —
  박스는 파일이 아니라 잔여 높이가 정하고(오버플로 게이트가 잡았던 사고의
  해법), 더 크게는 bleed의 몫. FigureSlide 차트 크기는 children 소유.
  둘 다 작성 가이드(스킬)에 지침으로 옮겼다.
- 잔여 소견: 로드맵 row의 시점 미상 각주가 1열 본문과 가까워 보일 수
  있으나 판독 혼동 수준은 아님 — 보류.

11차 (사용자 재확인 — "표도 마찬가지 아닌가"): 맞다 — 그리고 표까지 같은
증상이라는 것은 10차의 랭크 승급이 국소 처방이었고 **seam 매핑 자체가 한 단
보수적**이었다는 뜻이다. 일반해로 교체: seam에서 note→body,
note-body→caption으로 한 단 상향(caption→fine 바닥 유지). claim과 note가
body에서 수렴하는 것은 바닥에서 note-body·caption이 수렴하는 것과 같은
원리 — 램프의 가장자리에서 순위는 무게·색이 나른다. 10차의 타임라인 랭크
승급은 원복(정통 랭크 note/note-body로 복귀, 렌더 크기는 동일). 표의
페이로드(OptionAssessment 판정 셀, StatusAssessment 지표명·수치)는 note
랭크로 선언 — 판정 계약의 본체가 fine print일 수 없다. 헤더와 셀이 같은
크기가 되고 무게가 헤더 행을 가르는 것은 표의 관례다. 결과(keynote/briefing):
표 전체 24/20px, 주석·타임라인 본문 20/15px, 캡션·출처 18/14px 유지.

10차 (사용자 발견 — "여유가 있는데도 로드맵 글자가 작다"): 맞다. 가로
타임라인의 사건이 note/note-body 단으로 조판되고 있었는데, 그 단들은
**밀집 데이터 그래픽 안에 박힌** 타임라인용 크기다. 로드맵 슬라이드에서
타임라인은 캔버스를 통째로 가진 유일한 전시물 — 밀도용 크기를 희소 역할에
쓴 것이다. 해소는 크기 조정이 아니라 **랭크 재선언**(editorial 소유):
가로 전개는 희소 관용구를 위한 모드이므로 그 모드의 사건 라벨은 claim,
설명은 note로 한 랭크씩 승급 — 기존 seam을 그대로 타서 keynote
24/20px·briefing 20/15px가 된다. 세로(문서·로그 관용구)는 기존 랭크 유지.
남는 하단 공백은 타입이 아니라 구도의 몫(anchor="center", 덱 작성자 선택).

9차 (사용자 발견 — "eyebrow 성격 요소가 장마다 크기가 바뀐다"): 맞다.
슬라이드 단위 판정(킥커는 caption, 유일 라벨은 body 승급)이 각각은 옳았지만,
덱을 연속으로 넘기면 같은 문법의 요소가 15→20→24px로 출렁였다 — 덱 단위
일관성이 슬라이드 단위 최적화보다 상위다. 해소: **`--slides-overline-*` 단
신설**(keynote heading1 22px / briefing heading2 20px) — eyebrow 가족 4곳
(표지·본문 계열·목차 라벨·스테이트먼트)이 전부 이 한 단을 읽고, 부각의
차이는 크기가 아니라 **색**(악센트 vs label 톤)만으로 낸다. 간지 인덱스는
eyebrow가 아니라 목차 번호와 짝인 넘버링 가족(40px 공유)이라 제외.
검증: 대표 스토리 실측 keynote 전부 22px·briefing 전부 20px 단일.
주: alpha.6 릴리스 직후의 변경이라 소비자 전달은 다음 릴리스(alpha.7)부터.

8차 (사용자 문제 제기 — "그럴거면 LDS를 바꿔야 하지 않나"): 맞다.
확인 결과 Product `Table`은 열 의도(width/truncate/align)와 공개 셀 스타일
헬퍼까지 이미 갖고 있는데 StatusAssessment가 이를 우회해 `<table>`을 손으로
말고 있었고, 7차의 열 정책·밴딩은 그 복제 위에 다시 발명된 것이다. 밴딩은
업스트림에 없고 Table의 밀도·타입은 제품 고정이라 위임이 불가능한 상태 —
둘을 함께 업스트림에 제안했다:
`lk-design-system/docs/TABLE_MEDIUM_CONTRACT_PROPOSAL.md` (banded prop +
셀 스타일의 변수 경유; 채택 시 StatusAssessment는 Table 위임으로 복귀).
display0·Timeline orientation에 이어 세 번째 승격 제안이며, 세 건 모두
"위성 실측이 확정한 문법을 본체 계약으로"라는 같은 경로다.

7차 (사용자 발견): **전폭 표의 열 분배에 설계 의도가 없던 것** — 폭 100%를
주자 auto 레이아웃이 잉여를 열들에 임의로 흩어 목표·실적 사이가 250px씩
벌어졌다. StatusAssessment에 열 정책을 박음: 라벨 열이 잉여를 전부
흡수하고, 측정 열(목표·실적·판정)은 1%+nowrap으로 내용 폭에 서서 우측
레일에 묶인다 — 비교되는 값들은 붙어 있어야 한다는 컨설팅 표 관용구.
측정값은 숫자든 짧은 문구든 한 토큰이라 nowrap이 계약이다(문구형 목표가
꺾이며 캔버스를 넘친 실측이 근거). OptionAssessment는 열=옵션이라 균등
분배가 맞아 그대로 둔다. 알려진 엣지: briefing에서 출처 존이 콘텐츠 존
하단을 ~11px 침범하므로 표가 영역을 꽉 채우면 캡션과 출처가 근접한다 —
실덱에서 겹침이 재현되면 안전영역 산식으로 푼다.

6차 (렌즈 전수 재검토 — "매체 관용구 vs 문서·제품 관성"): 15개 레이아웃
전부를 이 렌즈 하나로 재판정했다.

- **수정 2건**: CodeSlide — 측정 폭(72ch)으로 캡된 코드 블록이 좌측 레일에
  붙어 있던 것을 캔버스 중앙 배치로(블록은 중앙, 코드 텍스트는 좌측 유지);
  ImageSlide(contained) — `justifyItems: 'start'`로 명시 고정돼 있던 사진을
  크레딧 블록과 함께 중앙 배치로.
- **작성 지침 1건**: SplitSlide pane 헤더는 슬라이드가 소유하지 않는 영역
  (pane 내용은 덱의 것) — "본문 크기 볼드 대신 eyebrow 문법" 지침을 스킬로.
- **현행 유지 판정, 근거와 함께**: TitleSlide 좌측 시작 정렬(표지 위계 +
  PPT 표지 스케일 동급 — 조사 기준표), ContentSlide 상단 고정(업계 워크호스
  표준, 모자랄 때는 anchor), EndSlide contact·인용 attribution(fine print),
  CodeSlide의 코드 caption 스케일("mono는 같은 공칭 크기에서 크게 읽힌다"는
  기존 근거 유효), RoadmapSlide 시점 미상 각주(콘텐츠 부속), CompareSlide
  평가 기준 캡션(전시물 캡션은 전시물을 따른다 — ImageSlide 크레딧과 동일
  관용구).

5차 (사용자 발견): **도판이 고유 폭에 묶여 있던 것** — 2차 리뷰에서 "차트
크기는 children 소유"로 넘겼던 판정의 번복이다. 표에 세운 규칙(폭은 매체
소유)이 도판이라고 다를 이유가 없다: `--editorial-figure-width` seam 신설
(제품 auto / 슬라이드 100%), AnnotatedFigure 본체가 flex-grow로 잔여 폭을
받고 주석 칼럼은 기존 비율 계약(실측 32%)이 자동 추종. 데모 차트는
width 100%로 컨테이너를 따르고 스케일은 viewBox가 맡는다. 측정 루프에는
1px 완충을 넣어 반올림 진동을 막았다. 크롬 밴드 여백도 16→24px로 올려
코너 라운드와 분리(같은 날 사용자 지적).

4차 (사용자 발견): **출처 줄이 본문 흐름에 붙어 있던 것** — 컨설팅 덱
관용구에서 출처는 내용이 어디서 끝나든 슬라이드 하단에 고정되는 크롬이다
(세로 타임라인과 같은 "문서 관용구" 부류). SlideSurface가 `source` prop으로
provenance 존(푸터 위 밴드, out-of-flow)을 소유하게 하고, 다섯 위임
슬라이드(Stat·Compare·Assessment·Roadmap·Figure)는 전달만 한다. 속성은
`data-slide-source`로 통일(play 4곳·deck-content 게이트 갱신).
ImageSlide의 캡션·크레딧은 전시물에 붙는 게 관용구라 유지.

3차 (재지적 후): 2차가 놓친 실결함 둘을 수정 — **로드맵 레일이 그리드
gap마다 끊겨** 하나의 연대기가 세 토막으로 읽히던 것(음수 마진으로 선을
gap 너머까지 연장), **지표 카드의 유령 들여쓰기**(투명 카드의 인라인
패딩이 행 전체를 제목 축에서 밀어내던 것 — 행을 밖으로 블리드해 숫자를
텍스트 축에 정렬). 교훈은 리뷰 방법에 있다: 계약 준수 확인이 아니라
"처음 보는 디자이너의 눈"으로 봐야 하고, 정렬 축·연속성·유령 여백이
그 눈이 잡는 부류다.

## 검증 (A 기준)

- 제품 매체 스토리(editorial-*)에서 표 폭이 고유 폭 그대로인지 (computed
  width가 변경 전과 동일).
- 슬라이드 스토리(compare·assessment)에서 표가 콘텐츠 영역 폭과 같은지.
- 게이트 전량: style-ownership · 오버플로(폭이 넓어지면 줄바꿈이 줄어
  높이는 같거나 줄어든다) · play 단언 · 카탈로그 · 덱 콘텐츠.
