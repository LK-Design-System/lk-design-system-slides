# 제안 — 헤더 체계: 한 문법, 세 기하

상태: **제안** (2026-08-18 작성, 미구현)
근거: [references/SLIDE_SYSTEMS_COMPARISON.md](./references/SLIDE_SYSTEMS_COMPARISON.md) §6,
크롬 밴드 개편(2026-08-18, 43d7a3f)에서 드러난 동형 결함

## 문제 — "헤더"라는 말이 세 개의 다른 것을 가리킨다

`data-slide-header`는 ContentSlide에만 있다. 그런데 헤더 모양의 상단 스택을
가진 레이아웃은 셋이고, 슬롯 구성이 전부 다르다:

| 레이아웃 | 1단 | 2단 | 3단 |
|---|---|---|---|
| ContentSlide | eyebrow | title | governing |
| TitleSlide (표지) | eyebrow | title | subtitle |
| SectionSlide (간지) | index | title | subtitle |

문서와 게이트는 ContentSlide 것만 "헤더 계약"이라 부르고, 나머지 둘은 이름
없이 각자 산다. 그 비용은 이미 두 번 지불됐다:

- **briefing 헤더 문법(구분선·압축 띠)을 넣을 때 ContentSlide만 손댔다.**
  표지·간지에 같은 논리가 적용되는지 아무도 묻지 않았다 — 물을 어휘가
  없었기 때문이다. (결론은 "적용 안 함"이 맞지만, 그 판정이 어디에도
  기록되지 않은 채 우연히 맞은 상태다.)
- **eyebrow가 두 색 체계로 갈라졌다.** TitleSlide는 `--slides-ink-accent`
  (간접층), ContentSlide는 `--color-semantic-primary-normal`(직접). 푸터가
  브랜드 네이비 위에서 1.37:1로 죽어 있던 것과 정확히 같은 계열의 잠복
  결함이다 — 지금 안 터지는 이유는 브랜드 외관이 희소 레이아웃 전용이라
  ContentSlide가 네이비를 안 만나기 때문일 뿐이다.

## 원칙 — 합치지도, 셋으로 찢지도 않는다

세 스택은 기하(고정 상단 띠 / 중앙 조판 / 중앙 조판)와 활자 단이 실제로
다르므로 **한 컴포넌트로 합치는 것은 틀린 통일**이다. 반대로 셋을 완전히
따로 두는 것은 지금 상태 — 같은 질문을 세 번 다시 논쟁하게 된다.

맞는 통일은 **역할 문법**이다. 세 스택은 모두 같은 세 역할의 수직 나열이다:

```
오리엔테이션   "지금 어디인가"   — eyebrow / index
이름          "무엇인가"        — title (명사형 종결, 공통 규칙)
부연          "그래서 무엇인가"  — governing / subtitle
```

**문법(역할·순서·오리엔테이션의 색 규칙·이름의 명사형 규칙)은 셋이 공유하고,
기하와 활자 단은 레이아웃이 소유한다.** 이는 이미 이 레포가 다른 곳에서 쓰는
구조다 — editorial seam이 "순위는 컴포넌트, 거리는 매체"로 가른 것과 같은
칼질이다.

## 변경 R1 — 오리엔테이션 슬롯의 색을 간접층으로 (즉시, 결함 수정)

ContentSlide eyebrow의 `--color-semantic-primary-normal` 직접 참조를
`--slides-ink-accent`로. 기본값이 같은 토큰이라 흰 표면 렌더는 바이트
동일하고, 재지정된 표면에서만 따라온다. 푸터 수리(43d7a3f)와 동형이므로
같은 논거로 종결된다.

## 변경 R2 — 한글 eyebrow에서 영문 kicker 관용구 제거 (즉시, 시각 변경)

현행 `textTransform: uppercase` + `letterSpacing: 0.08em`은 영문 kicker
관용구다. 실덱의 eyebrow는 전부 한글("병목 분석", "확장 방식")이고, 한글에
uppercase는 무연산, 0.08em 자간은 이미 넓은 자소 블록을 더 벌린다.

- letterSpacing → `--slides-overline-spacing` (램프 값, 한글 기준)
- textTransform 제거. 영문 eyebrow가 스몰캡을 잃는 것은 수용 — 이 시스템의
  1급 시민은 한글이고, 영문 덱 프로파일은 별도 보류 항목(E3)이다.
- 스냅샷: eyebrow가 있는 전 스토리 재축복. 리뷰 눈은 "자간이 줄었다"를
  확인하면 된다.

## 변경 R3 — 헤더 종류를 기계 가시화 (즉시, 무해)

`data-slide-header="content" | "cover" | "divider"`를 세 레이아웃에 선언.
속성 존재 셀렉터(`[data-slide-header]`)는 값이 있어도 매치되므로 기존
play는 깨지지 않는다. 이후의 게이트·플레이·문서가 "어느 헤더"인지 이름으로
말할 수 있게 된다.

## 변경 R4 — 거버닝 부재를 캔버스에 신고 (설계 검토 후)

`{governing && ...}` 자체는 옳다 — read 덱은 정당하게 거버닝을 생략한다
(명사형 제목 + 전시물 완결). 문제는 present 덱의 부재가 **게이트에만**
잡히고 컴포넌트는 모른다는 것.

이 레포의 기존 관용구를 따른다: 위반은 캔버스에 렌더된다 (Triptych "레이블
없음", AnnotatedFigure "앵커 미확인"). ContentSlide가 DeckMediumContext를
읽어 `kind === 'present' && !governing`일 때 자리 표시 경고를 렌더한다.
매체 밖(카탈로그 데모)에서는 조용히 — 지금과 동일.

검토점: 거버닝을 위임 레이아웃(Stat·Compare 등)이 rest로 전달하므로, 경고
지점은 ContentSlide 하나로 충분하다.

## 판정 기록 (변경 없음)

- **briefing 구분선은 content 헤더 전용이다.** 표지·간지는 중앙 조판의 희소
  구성이라 그어진 경계가 아니라 여백이 경계다. 우연히 맞아 있던 것을
  판정으로 승격.
- **활자 단은 통일하지 않는다.** 부연 슬롯이 content에서는 governing 룽,
  간지에서는 orient 룽을 타는 것은 역할이 같고 거리가 다른 것 — 매체-순위
  분리 원칙 그대로다.
- **AgendaSlide는 헤더 문법 밖이다.** 목차는 상단 스택이 아니라 슬라이드
  전체가 오리엔테이션이다.

## 순서와 비용

1. R1 + R3 — 코드 3곳, 렌더 무변경(스냅샷 0), 반나절 미만
2. R2 — 토큰 1곳 + 스냅샷 재축복 다수, 눈 검수 필수
3. R4 — play 단언 추가 포함, 별도 커밋

R1·R2는 오늘의 크롬 밴드 커밋과 같은 계열("간접층을 안 탄 직접 참조",
"영문 관용구의 무비판 이식")이므로 근거 재작성 없이 진행 가능.
