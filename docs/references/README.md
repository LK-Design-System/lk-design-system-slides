# 외부 참조 레지스트리

> **이관 기록**: 이 문서는 아카이브된 lk-design-system-editorial 저장소의
> `docs/references/README.md`를 2026-08-16에 그대로 옮겨온 것이다. Editorial 컴포넌트가
> 이 저장소(`src/components/editorial/`)로 흡수되면서 채택 결정의 근거 문서도 함께 따라왔다.
> 아래 본문의 "이 저장소"는 원문 그대로 Editorial 컴포넌트군을 가리키며, 현재 그 소유
> 주체는 이 저장소다. 채택/미채택 판정 자체는 이관으로 바뀌지 않았다.

LDS Editorial가 참고하는 외부 소스와, **각 소스에서 무엇을 채택하고 무엇을 채택하지
않는지**의 기록. Core가 WDS를 `docs/references/wds/`에 증거로 박제한 것과 같은 원칙이다 —
이탈은 자유가 아니라 추적 가능한 결정이며, 여기 없는 규칙을 외부 소스 권위로 주장하지 않는다.

조회일: 2026-07-30. 소스가 갱신되어도 이 문서의 채택 결정은 자동으로 따라가지 않는다.

---

## 1. FT Visual Vocabulary — 기능 분류의 어휘

- 소스: <https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary>
  (코드 예제: <https://github.com/ft-interactive/visual-vocabulary>)
- 내용: 데이터 그래픽을 9개 기능 카테고리(Deviation · Correlation · Ranking · Distribution ·
  Change over Time · Part-to-Whole · Magnitude · Spatial · Flow)로 분류한 선택 가이드.

**채택**
- 9개 기능 카테고리를 **컴포넌트 분류와 로드맵의 축**으로 사용한다.
  매핑은 [VISUAL_VOCABULARY_MAP.md](./VISUAL_VOCABULARY_MAP.md)가 소유한다.
- ISOTYPE(픽토그램)을 Magnitude 계열로 위치시키는 분류 — `PictogramRow`의 소속 근거.
- "차트를 만드는 법이 아니라 **쓸 기회를 알아보는 법**"이라는 목적 정의 — 이 저장소의
  문서 톤(어떤 질문에 이 컴포넌트를 쓰는가)과 일치.

**미채택**
- 차트 구현 자체. 측정을 그리는 프리미티브는 Core/Product 소유이며, 이 저장소는 조립만 한다.
- FT 하우스 스타일(색·타이포). Theme 소유.

## 2. Urban Institute Data Visualization Style Guide — 규칙 문서의 모범

- 소스: <https://urbaninstitute.github.io/graphics-styleguide/>
- 내용: 조직 차원의 시각화 스타일 가이드. 색·타이포·차트 부위·접근성·차트별 do/don't.

**채택** (표현 규약으로 흡수 예정, 근거와 함께)
- **주장형 타이틀**: "The Labor Force Participation Rate Has Declined"처럼 제목이 주장을
  말한다 — `KeyFigure`의 claim 계약과 동일한 원칙. 확장 컴포넌트에도 적용.
- **직접 라벨링 우선**: 범례보다 데이터에 직접 라벨 — `AnnotatedFigure` 주석 설계의 근거.
- **영 기준선**: 막대류는 0에서 시작. 조립 스토리에서 Core 차트를 쓸 때의 검증 항목.
- **이중 축 금지**, **카테고리 ≤7**, **파이 조각 <5**: 조립 스토리의 play 단언 후보.
- **WCAG AA 대비**: 이미 LDS 전역 계약(2.2 AA)과 합치 — 재확인용.
- 규칙마다 "왜"를 붙이는 문서 구조 자체를 표현 규약 문서의 형식 모델로 삼는다.

**미채택**
- Urban 고유 팔레트·폰트·Excel/R 툴체인. 색과 타이포는 Theme 소유.
- 미국 지도 투영 규칙 등 지리 시각화. Spatial은 이 저장소 밖(Robotics/3D 인접 도메인).

## 3. Datawrapper Academy — 주석의 실무 계약

- 소스: <https://academy.datawrapper.de/article/142-how-to-create-text-annotations>,
  <https://www.datawrapper.de/academy/annotate-tab>,
  <https://www.datawrapper.de/blog/annotations-in-bar-charts>
- 내용: 주석 도구의 실제 동작 규칙. 도구 문서지만 계약 설계가 정교하다.

**채택** (`AnnotatedFigure`에 구현 완료)
- **주석은 데이터에 앵커된다**: `anchor` id가 도판 안의 `data-annotation-anchor` 요소와
  연결되어 재정렬을 따라가고, 대상 요소는 `aria-details`로 주석을 참조한다. 대상이 없는
  앵커는 숨겨지지 않고 "앵커 미확인"으로 표시된다.
- **비율 기반 지오메트리**: `--editorial-annotation-offset`(3%)·`--editorial-annotation-width`(32%)
  — 픽셀이 아니라 도판 폭 대비 비율. 가독성 하한(`--editorial-annotation-min-width`,
  200px)까지 클램프되고, 하한보다 좁은 도판은 주석을 아래로 스택한다(Datawrapper의
  모바일 동작). play 단언이 실측 폭과 스택 전환을 검증한다.
- **두 가지 주석 형태**: 앵커형(`data-annotation-kind="anchored"`, 연결 글리프) /
  맥락형(`context`)의 구분.

**미채택**
- Datawrapper 런타임·에디터 UX. 이 저장소는 컴포넌트 계약만 소유한다.

## 4. AntV chart-visualization-skills — 서사 템플릿 분류

- 소스: <https://github.com/antvis/chart-visualization-skills>
- 내용: 목록·순서·계층·비교·관계 등으로 분류된 50+ 서사 그래픽 템플릿.

**채택**
- FT가 덜 다루는 **비차트 서사 그래픽**(순서도형 목록, 계층, 프로세스)의 분류를 확장
  로드맵의 보조 축으로 참고한다.

**미채택**
- AntV/G2 런타임 의존성. 템플릿 코드 이식.

## 5. EU Data Visualisation Guide — 메시지 기반 선택

- 소스: <https://data.europa.eu/apps/data-visualisation-guide/visual-vocabulary>,
  <https://data.europa.eu/apps/data-visualisation-guide/choosing-charts-the-message>
- 내용: FT 어휘를 포함한 종합 가이드. "데이터 타입"이 아니라 "전하려는 메시지"에서
  차트를 고르는 프레임.

**채택**
- **메시지 우선 선택 프레임**: 각 컴포넌트 문서의 마스트헤드가 "언제/왜 쓰는가"를
  말해야 한다는 Core 마스트헤드 카피 계약의 인포그래픽판 근거.

**미채택**
- 가이드의 개별 차트 튜토리얼.
