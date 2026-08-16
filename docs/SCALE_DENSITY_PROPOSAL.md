# 제안 — 투영 스케일 확장과 밀도 seam (토큰 층)

상태: **제안** (2026-08-16 작성, 미구현)
근거: [references/SLIDE_SYSTEMS_COMPARISON.md](./references/SLIDE_SYSTEMS_COMPARISON.md)
— 업계 시스템 실측 비교에서 확인된 두 격차를 토큰 층에서 닫는다.

문제를 한 문장으로: **이 시스템은 "무엇을 말하는가"의 계약(강조 예산, 명사형
종결, 오버플로 게이트)은 업계보다 앞서 있는데, "얼마나 크게 말하는가"는 제품
UI 램프를 두 단 올려 쓰는 데서 멈춰 있다.** 그 결과가 ① 점보 단 부재(희소
슬라이드가 휑함), ② 최소 단이 투영 하한 아래(데이터 컴포넌트가 오밀조밀함)다.

## 소유권 제약 — 이 제안이 지켜야 하는 것

- `tokens/slides.css`는 `--slides-*`만, `tokens/editorial.css`는 `--editorial-*`만
  정의한다. 업스트림(Core/Theme) 토큰의 재정의는 금지, 조합(compose)만 허용.
- 모든 단은 업스트림 램프 변수를 **통해** 해소되어야 Theme 교체가 덱을
  재도장한다. 슬라이드 전용 리터럴 px는 이 흐름을 끊으므로 금지.
- 업스트림 램프의 최상단은 `--display1-size: 56px`다. 그 위 단은 존재하지 않는다.

## 변경 1 — 점보 단 `--slides-hero-*`

Statement·Title·Section·End 계열(희소 슬라이드)이 쓸, 캔버스 15% 급의 단을
신설한다. 업계 대응물: Slidev `fact`(17.4%), reveal.js h1(15.0%).

```css
/* tokens/slides.css — :root (keynote) */
--slides-hero-size: calc(var(--display1-size) * 2);      /* 112px → 캔버스 15.6% */
--slides-hero-line: calc(var(--display1-line) * 2);      /* 144px */
--slides-hero-spacing: var(--display1-spacing);          /* em 단위라 자동 스케일 */

/* [data-slides-preset='briefing'] — 한 단 아래 앵커로 강하 (기존 규칙 유지) */
--slides-hero-size: calc(var(--display2-size) * 2);      /* 80px → 11.1% */
--slides-hero-line: calc(var(--display2-line) * 2);
--slides-hero-spacing: var(--display2-spacing);
```

**왜 calc 조합인가.** 업스트림에 이 단이 없으므로 선택지는 둘이다:
(A) 업스트림 램프에 display0 신설 — 표면(surface) 변경이라 업스트림 합의가
필요하다(lds-3d assets export 때와 같은 절차). (B) 기존 램프 단의 calc 조합 —
`--slides-*` 신설이고 업스트림 변수를 통해 해소되므로 소유권 계약 안에 있으며,
Theme가 display1을 바꾸면 hero도 따라간다. **B로 즉시 진행하고, A(업스트림
display0 승격)를 장기 정착지로 병행 제안한다.** A가 합의되면 hero의 우변을
`var(--display0-size)`로 바꾸는 한 줄 마이그레이션이다.

주의: ×2는 유일하게 검토한 배수가 아니라 측정 결과다 — 112px(15.6%)는
reveal(15.0%)과 Slidev(17.4%) 사이에 앉는다. 상속 letter-spacing(-0.0319em)이
112px에서 과하게 조일 수 있으므로 구현 시 실물 확인 항목에 넣는다.

소비자(동반 레이아웃 PR, 이 제안의 범위 밖): StatementSlide 본문,
TitleSlide/SectionSlide 제목의 hero 승격 여부는 레이아웃 제안에서 다룬다.
토큰이 먼저 존재해야 그 논의가 성립하므로 여기서 단만 만든다.

## 변경 2 — keynote 최소 단 상향

keynote 프리셋의 약속은 "body ≥ 24px ≈ 18pt"인데, 실제 램프는 caption 18px
(2.5%)·fine 16px(2.2%)로 그 아래까지 내려간다. fine은 전 비교군 최소이고
PPT 권장 하한(3.3%)의 3분의 2다. 한 단씩 올린다:

```css
/* tokens/slides.css — :root (keynote), 변경분만 */
--slides-caption-size: var(--heading2-size);    /* headline1 18px → 20px (2.8%) */
--slides-caption-line: var(--heading2-line);
--slides-caption-spacing: var(--heading2-spacing);
--slides-fine-size: var(--headline1-size);      /* body1 16px → 18px (2.5%) */
--slides-fine-line: var(--headline1-line);
--slides-fine-spacing: var(--headline1-spacing);
```

- 최소 단 2.5%는 Marp·Slidev의 최소와 동률이 된다. PPT 하한(3.3%)까지는
  올리지 않는다 — 그러려면 fine=body가 되어 랭크가 죽는다.
- **briefing은 건드리지 않는다.** 가까이서 보는 밀집 보고가 그 프리셋의
  계약이고, 하한 약속은 keynote의 것이다.
- editorial seam은 자동으로 따라온다: note-body·caption이 fine에 앉으므로
  표 본문이 16→18px가 된다. seam 재배선은 불필요.
- `Fit`의 축소 하한은 fine÷body로 유도되므로(0.66→0.75) 축소 여지가
  줄어든다 — 의도된 결과다. 하한이 올라갔다는 뜻이기 때문이다. 기존 덱에서
  Fit이 흡수하던 초과분이 오버플로로 드러날 수 있고, 이는 게이트가 잡는 게
  맞다 (검증 계획 참조).

**보류 — body 상향.** LDS body 3.3% vs 업계 4.0~6.0%. 올릴 근거는 있지만
모든 덱의 수용량을 줄이는 변경이라 파급이 최소 단과 자릿수가 다르다. 기존
덱 전체에 `check:slide-overflow`를 돌려 초과 슬라이드 수를 측정한 뒤 별도
제안으로 다룬다. 이 제안에 끼워 넣지 않는다.

## 변경 3 — 간격 seam 신설

타입에는 매체 번역 층이 있다(editorial 5단 ↔ slides 재지정). **간격에는
없다** — editorial 컴포넌트가 `var(--space-2) var(--space-4)` 같은 제품
밀도의 리터럴을 그대로 쓰고, 매체가 개입할 지점이 존재하지 않는다. 셀 텍스트
상대 크기가 업계의 3분의 1인데 패딩까지 제품 값이니 "제품 대시보드를 오려
붙인" 톤이 된다. 타입 seam과 같은 구조를 간격에도 만든다.

1단계 — editorial이 자기 밀도 변수를 갖는다 (기본값 = 현행, 시각 변화 0):

```css
/* tokens/editorial.css — 신설. 기본값은 제품 매체(팔 거리) 밀도 */
--editorial-cell-pad-block: var(--space-2);     /* 8px */
--editorial-cell-pad-inline: var(--space-4);    /* 16px */
--editorial-row-gap: var(--space-3);            /* 12px */
--editorial-figure-gap: var(--space-6);         /* 24px */
```

컴포넌트의 리터럴 `--space-*` 참조를 위 변수로 치환한다. 대상은 caption/fine
사용 밀도 상위 컴포넌트부터: OptionAssessment(셀 패딩 2곳),
StatusAssessment, AnnotatedFigure, RankShift, KeyFigure. 제품 매체에서는
기본값이 동일하므로 **이 단계는 순수 리팩터링이다.**

2단계 — 슬라이드 매체가 재지정한다 (타입 seam과 같은 자리, 같은 특이도):

```css
/* tokens/slides.css — :root [data-lds-slide-surface] 블록에 추가 */
--editorial-cell-pad-block: var(--space-3);     /* 8 → 12px */
--editorial-cell-pad-inline: var(--space-6);    /* 16 → 24px */
--editorial-row-gap: var(--space-4);            /* 12 → 16px */
--editorial-figure-gap: var(--space-9);         /* StatSlide 지표 간격과 정렬 */
```

값은 전부 업스트림 space 램프의 단이다 — 재정의가 아니라 다른 단을 가리키는
것이므로 소유권 계약 안이고, briefing 프리셋이 나중에 다른 단을 가리킬 수도
있는 구조가 된다(이 제안에서는 keynote/briefing 공통으로 시작).

## 하지 않는 것

- **캔버스 유동화** — 비교 문서로 기각 확정. 고정 캔버스는 업계 표준이다.
- **under-fill 구도** (ContentSlide 앵커 prop, StatSlide 폭 분배·개수 적응,
  희소 레이아웃의 가로 중앙) — 레이아웃 층. 이 제안의 토큰이 선행 조건이며,
  별도 레이아웃 제안에서 다룬다.
- **briefing 밀도 완화** — 그 프리셋의 계약 위반.
- **product 컴포넌트·업스트림 토큰 변경** — 소유권 밖. 유일한 업스트림 요청은
  display0 승격 **제안**이고, 그 전까지 이 레포는 calc 조합으로 자립한다.

## 검증 계획

| 단계 | 게이트 | 기대 |
|---|---|---|
| 모든 단계 | `check:style-ownership` | slides.css에 `--slides-*`+seam 재지정만, editorial.css에 `--editorial-*`만 |
| 간격 seam 1단계 | 스토리 시각 확인 | 제품 매체 시각 변화 0 (기본값 동일) |
| 최소 단 상향 | `check:slide-overflow` 전 덱 | 초과 슬라이드 목록 = 이 변경의 실제 파급 측정. Fit 흡수 or 콘텐츠 수정으로 해소 후 머지 |
| hero 신설 | 스토리 추가 시 3종 레지스터 동기화 | 신규 스토리를 만들면 dedup 해시·IA 리뷰·인벤토리가 한 세트 |
| 전체 | 수치 성공 기준 | 최소 단 ≥ 2.5% (업계 min 동률) · hero 15.6% (reveal~Slidev 사이) · 셀 패딩 12×24px |

다운스트림: lds-motion은 vendored tarball 고정이라 자동 영향 없음. 다음 핀
갱신 때 렌더 산출물이 달라지는 것은 정상(시각 변경이 목적)이며 결정론과는
무관하다.

## 진행 순서

1. **간격 seam 1단계** (리팩터링, 시각 변화 0) — 위험 최소, 즉시 가능
2. **keynote 최소 단 상향** + 전 덱 오버플로 측정·해소
3. **hero 단 신설** (토큰만; 소비는 레이아웃 제안으로)
4. **간격 seam 2단계** (슬라이드 매체 재지정) — 2·3의 시각 리뷰와 묶어서
5. 업스트림에 **display0 승격 제안** 제출, body 상향은 측정 후 별도 제안
