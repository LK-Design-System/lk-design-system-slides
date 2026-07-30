# LDS Slides

발표 슬라이드용 LDS 자매 시스템. Robotics·3D와 같은 패턴으로, Core/Theme 토큰을 소비해
슬라이드 지오메트리·투사 타이포 스케일·슬라이드 레이아웃 계약을 소유한다.

**이 저장소는 매체(medium)다.** 무엇을 주장하는지는 매체 중립인
[LDS Editorial](../lk-design-system-editorial)이 소유하고, 그걸 얼마나 먼 거리에서 읽는지를
여기가 소유한다. 그래서 Slides는 숫자·주석·픽토그램을 다시 만들지 않고 Editorial을 얹는다 —
`StatSlide`의 수치는 Editorial `KeyFigure`가, 그 안의 조판은 Product `Stat`이 그린다.

## 소유 경계

- **LDS Slides가 소유**: 16:9 캔버스와 세이프 존(`SlideSurface`), 투사 거리용 타입 스케일
  (`--slides-*` 토큰), 슬라이드 레이아웃 계약(`TitleSlide`, `ContentSlide`), 덱 종류 프리셋 축
  (`preset` → `data-slides-preset`; 기본 `keynote`는 본문 24px 투사 하한, `briefing`은 밀도 상향).
  종류는 토큰 축이지 레이아웃 축이 아니다 — 프리셋은 `--slides-*` 값만 갈아끼운다.
  `ContentSlide`는 한국 장표의 헤더 계약(제목/거버닝/본문)도 소유한다: `governing`은 제목
  아래 놓이는 완결 문장 한 개의 주장이며, 슬라이드는 그 위치·타입(본문 스케일, 본문보다
  무거움)만 소유하고 문구는 덱이 소유한다. 명사형 종결은 제목의 것, 문장은 거버닝의 것.
- **Core/Theme이 소유**: 색·간격·radius·폰트 토큰 전부. 이 저장소는 `--slides-*` 접두사만
  정의하며, 교차 저장소 스타일 계약의 소유 접두사(`--color-` `--space-` `--radius-` `--font-`)를
  재정의하지 않는다.
- **LDS Editorial이 소유**: 주장 프레임·주석·픽토그램의 서사 규약과 그 순위. Slides는 그
  순위를 재해석하지 않고 거리만 지정한다.
- **덱(사용처)이 소유**: 발표 내용, 슬라이드 순서, 콘텐츠 구성.

## Editorial 접합부

Editorial 컴포넌트는 업스트림 램프를 직접 참조하지 않고 `--editorial-*` 5단계
(value > claim > note > note-body > caption)만 읽는다. `tokens/slides.css`의
`:root [data-lds-slide-surface]` 블록이 그 다섯 단계를 `--slides-*` 단계로 재지정하므로,
슬라이드에 얹힌 Editorial 컴포넌트는 컴포넌트가 아무것도 모르는 채로 투사 거리에서 읽힌다.

업스트림 램프가 아니라 **`--slides-*`를 경유**해 매핑하는 것이 핵심이다 — `briefing`
프리셋이 슬라이드 단계를 갈아끼우면 Editorial 층도 공짜로 따라온다. `note-body`와
`caption`이 둘 다 `--slides-fine-*`에 떨어지는 건 의도된 바닥이다: 하한 아래로는 크기가
아니라 무게와 색이 순위를 나른다.

강조 예산도 여기서 집행된다. Editorial은 한 도판 안에서만 강조를 단속할 수 있고 경쟁은
도판들 사이·도판과 eyebrow 사이에서 일어나므로, `StatSlide`가 첫 요청만 승인하고 나머지를
강등하며 강조를 쓴 슬라이드는 악센트 eyebrow를 내린다.

## 상태

`0.1.0-alpha.1` — 최소 골격. Storybook 포트는 **6009** (Core 6006 · 3D 6007 · Robotics 6008 다음).

Core/Theme/Product는 Robotics·Editorial과 같은 `0.1.0-rc.3`을 소비한다. Editorial의
Core/Product는 `peerDependencies`라 트리에 Core는 정확히 하나만 존재한다 — 토큰 층이
두 벌이 되면 `--color-*`의 승자가 로드 순서로 정해지기 때문이다. 알파 부트스트랩 동안은
`vendor/`의 tarball을 `file:` 의존성으로 설치하며, 레지스트리 인증이 준비되면 Robotics처럼
semver 고정(캐럿 없음)으로 전환한다.

```bash
npm run check:storybook   # 소유권 검사 + 빌드 + 모든 play 단언을 headless Chromium에서 실행
```

`check:style-ownership`이 체인의 첫 게이트다: 컴포넌트는 업스트림 램프 변수
(`--display1-size` 등)를 직접 읽을 수 없고 `--slides-*` 단계만 읽는다 — 램프 직참조는
프리셋 축을 무시하고 투사 하한을 조용히 깨는데, 모든 스토리에서 멀쩡해 보이기 때문에
play가 아니라 정적 게이트가 잡는다. `tokens/slides.css`는 `--slides-*`만 정의할 수 있고,
유일한 예외는 슬라이드 표면에 스코프된 `--editorial-*` 재지정(Editorial 접합부)이다.

```bash
npm install
npm run storybook   # http://127.0.0.1:6009
```

## 다음 단계

- 레이아웃 어휘: mckinsey-pptx 카탈로그의 주요 패턴은 매핑 완료(구조·stat·도판·비교·
  로드맵·상태 평가). 추가 확장은 실제 덱에서 수요가 생길 때 카탈로그 기준으로 선별.
- 배포 워크플로.
- Directory 등재: Core Storybook의 LDS Directory에 행 추가, github.io 배포.
