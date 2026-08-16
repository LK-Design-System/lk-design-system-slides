# 슬라이드 시스템 비교 레지스트리

슬라이드 **매체**가 참고하는 외부 시스템과, 각 시스템에서 무엇을 채택하고 무엇을
채택하지 않는지의 기록. [README.md](./README.md)가 Editorial(데이터 그래픽)의
외부 소스 레지스트리인 것과 같은 원칙의 자매 문서다 — 여기는 캔버스·타입
스케일·구도, 즉 매체 층을 다룬다.

조회일: 2026-08-16. 수치는 각 시스템의 소스 코드에서 직접 읽은 값이다. 소스가
갱신되어도 이 문서의 채택 결정은 자동으로 따라가지 않는다.

---

## 실측 기준표 — 캔버스 높이 대비 타입 비율

같은 역할의 타입이 화면에서 차지하는 비율로 정규화했다. 논리 캔버스가 다르면
픽셀 비교는 무의미하기 때문이다 (LDS 1280×720, reveal.js 960×700,
Marp 1280×720, Slidev 980×552, PowerPoint 13.333×7.5in).

| 역할 | LDS keynote | reveal.js black | Marp default | Slidev default | PPT 기본 템플릿 |
|---|---|---|---|---|---|
| 최상위 (표지·팩트) | display 56px → **7.8%** | h1 105px → 15.0% | h1 ~46px → 6.4% | fact 96px → **17.4%** | 제목 44pt → 8.1% |
| 본문 슬라이드 제목 | title 40px → 5.6% | h2 67px → 9.6% | — | h1 36px → 6.5% | 36pt → 6.7% |
| 본문 | body 24px → 3.3% | 42px → **6.0%** | 29px → 4.0% | 16px → 2.9% | 24–28pt → 4.4–5.2% |
| 최소 단 | fine 16px → **2.2%** | (본문이 최소) | 18px → 2.5% | 14px → 2.5% | 권장 하한 18pt → 3.3% |

읽는 법 두 가지:

- **점보 티어**: 업계는 희소 슬라이드(팩트·스테이트먼트)용으로 캔버스 10~17%의
  타입 단을 따로 갖는다. LDS 램프는 7.8%에서 끝난다.
- **최소 단**: LDS fine(2.2%)은 전 비교군의 최소이며, PPT 투영 권장 하한
  (18pt ≈ 이 캔버스의 24px)의 3분의 2다. keynote 프리셋이 약속하는
  "body ≥ 24px ≈ 18pt" 하한은 body에만 참이고, caption·fine은 그 아래에 있다.

---

## 1. reveal.js — 고정 캔버스의 선례, 전역 세로 중앙

- 소스: <https://github.com/hakimel/reveal.js> —
  `css/theme/template/settings.scss`, `css/theme/black.scss`
- 구조: 960×700 논리 캔버스 + transform 스케일. `center: true`(기본값)가 내용
  높이를 재서 짧은 슬라이드를 세로 중앙에 놓는다.

**채택**
- **고정 논리 캔버스 + 스케일**은 업계 표준이라는 확인. SlideSurface의 설계
  근거(유동 박스는 투영 하한을 한 폭에서만 지킨다)가 업계와 합치한다 —
  캔버스 유동화 요구는 이 문서를 근거로 기각한다.
- 본문 비율의 참조점: reveal은 본문조차 6.0%다. LDS body(3.3%)를 당장 여기에
  맞추자는 것이 아니라, "투영 본문"의 업계 상한이 어디인지의 기준으로 쓴다.

**미채택**
- 전역 세로 중앙(`center: true`). 모든 슬라이드를 일괄 중앙에 놓는 방식은
  ContentSlide의 헤더 계약(제목은 안전영역 상단에 고정)과 충돌한다. LDS는
  전역 스위치가 아니라 레이아웃별 의도로 푼다 (Slidev 항목 참조).
- 마크다운/HTML 저작 모델. 의미 기반 prop 계약(`governing` 등)이 LDS의 강점이다.

## 2. Slidev — 희소/밀집 레이아웃 이원화

- 소스: <https://github.com/slidevjs/slidev> `packages/client/layouts/*.vue`,
  <https://github.com/slidevjs/themes> `theme-default/styles/layouts.css`
- 구조: `fact`/`statement`/`quote`/`cover`는 `h-full grid` + `my-auto`
  (세로 중앙) + `text-center`, fact는 text-8xl(17.4%)로 타입 자체를 키운다.
  `default`/`two-cols`는 상단 정렬 유지.

**채택**
- **희소/밀집 이원화**: 내용이 적은 레이아웃은 중앙 구도 + 큰 타입으로 공간을
  채우고, 워크호스 레이아웃은 상단 고정을 유지한다는 분리. LDS의
  Statement/Title/Section/End 계열 vs Content 계열 구분과 정확히 대응하며,
  ContentSlide의 상단 고정 자체는 업계와 합치함을 확인해준다.
- **점보 단의 존재 이유**: fact의 17.4%가 그 레이아웃의 정체성이다. LDS 램프에
  같은 단이 필요하다는 근거 → [SCALE_DENSITY_PROPOSAL.md](../SCALE_DENSITY_PROPOSAL.md).

**미채택**
- UnoCSS 유틸리티 스타일링. 토큰 소유권 계약(slides는 `--slides-*`만 정의)과
  충돌한다.
- 테마가 외관만 바꾸는 구조. LDS의 프리셋 축(keynote/briefing)은 밀도 계약까지
  바꾸며, 이쪽이 더 강한 모델이다.

## 3. Marp — 슬라이드 단위 중앙 전환

- 소스: <https://github.com/marp-team/marp-core> `themes/default.scss`
- 구조: 1280×720, 본문 29px(4.0%). `lead` 클래스를 준 슬라이드만 중앙 정렬로
  전환한다 (v4부터 `align-content` 기반).

**채택**
- **슬라이드 단위 opt-in 중앙**이라는 낮은 비용의 해법 존재 확인. LDS로
  옮기면 전역 스위치도, 레이아웃 신설도 아닌 "기존 레이아웃에 구도 prop 추가"
  경로가 성립한다는 근거 (단, 이는 토큰 층 밖 — 레이아웃 후속 작업).

**미채택**
- CSS 클래스로 구도를 바꾸는 인터페이스. LDS에서는 prop 계약으로 표현한다.

## 4. PowerPoint — 앵커·오토핏·개수 적응

- 소스: 제품 문서 (오픈소스 아님) —
  [AutoFit](https://www.officetooltips.com/powerpoint_365/tips/autofit_feature),
  [SmartArt 크기 적응](http://howtomicrosoftofficetutorials.blogspot.com/2018/08/resize-smartart-graphic-shape-or-entire.html)
- 구조: 플레이스홀더마다 세로 앵커(top/middle/bottom), 넘침은 autofit이 축소로
  흡수. SmartArt는 항목 개수와 가용 공간에 따라 도형 전체가 재배치·재크기된다.

**채택**
- **축소는 한 방향 장치라는 확인**: PPT의 autofit도 LDS의 `Fit`처럼 축소만
  한다. 모자람은 앵커·SmartArt가 메운다 — 즉 "Fit의 반대 방향"을 만드는 게
  아니라 별도의 구도·분배 장치가 정답이라는 구조적 근거.
- **개수 적응 분배**(SmartArt): 지표가 2개면 크게 2개, 5개면 작게 5개.
  StatSlide 지표 행의 장기 방향으로 참고한다 (레이아웃 후속 작업).

**미채택**
- 자유 배치 캔버스와 마스터/레이아웃 편집 모델. LDS는 레이아웃을 코드 계약으로
  고정하며, 이것이 CI 가드(오버플로·카탈로그·play 단언)를 가능하게 한다.

---

## 비교가 확인해준 LDS의 우위 (유지 대상)

비교군 어디에도 없는 것들이므로, 아래는 개선 과정에서 훼손하면 안 되는 계약이다:

- **CI 가드레일**: `check:slide-overflow`, 카탈로그 동기화, play 단언, 명사형
  종결 집행. reveal/Marp/Slidev 전무.
- **강조 예산**: StatSlide의 "강조는 슬라이드당 하나" 집행.
- **밀도 프리셋 축**: keynote/briefing이 토큰 축으로 분리되고 레이아웃은 불변.
- **의미 기반 저작**: `governing` 등 한국 보고서 문법의 prop 계약.
- **매체-랭크 분리**(editorial seam): 타입에는 이미 있다. 간격에는 없다 —
  그 공백이 [SCALE_DENSITY_PROPOSAL.md](../SCALE_DENSITY_PROPOSAL.md)의 대상이다.
