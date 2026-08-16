# Visual Vocabulary ↔ LDS Editorial 매핑

> **이관 기록**: 아카이브된 lk-design-system-editorial 저장소의
> `docs/references/VISUAL_VOCABULARY_MAP.md`를 2026-08-16에 그대로 옮겨온 것이다.
> 본문의 "이 저장소"는 Editorial 컴포넌트군(현재 `src/components/editorial/`)을 가리킨다.

FT Visual Vocabulary의 9개 기능 카테고리를 축으로, 이 저장소가 **직접 소유하는 것 /
Core·Product 차트를 조립하는 것 / 소유하지 않는 것**을 판정한다. 새 컴포넌트 제안은
이 표의 빈 칸에서 출발하고, 판정을 바꾸면 이 문서를 함께 갱신한다.

판정 어휘:
- **소유** — 이 저장소의 컴포넌트가 계약을 소유한다.
- **조립** — Core/Product 차트를 `AnnotatedFigure` 등으로 감싸 서사만 얹는다. 차트 자체는 만들지 않는다.
- **밖** — 이 저장소의 도메인이 아니다. 소유자를 명시한다.

| # | 카테고리 | 질문 | 판정 | 현재 | 로드맵 |
|---|---|---|---|---|---|
| 1 | Magnitude | 얼마나 큰가? | **소유** | `KeyFigure`(Product `Stat` 조립), `PictogramRow`(ISOTYPE) | 단위 아이콘 커스텀(로봇·대수 등) |
| 2 | Change over Time | 어떻게 변해왔는가? | 조립 + **소유(서사층)** | `AnnotatedFigure` + Core 차트 조립, `NarrativeTimeline`(Core Timeline 조립 + 시간순·날짜 강제·강조 1개) | 기간 표현이 필요한 시계열은 차트 조립으로 |
| 3 | Ranking | 몇 등인가? | **소유** | `RankShift`(양측 직접 라벨링 + 강조 1개 계약) | 3개 이상 시점(범프 차트) 확장 |
| 4 | Deviation | 기준 대비 얼마나 벗어났는가? | **소유** | `BeforeAfter`(명시 기준 강제 + 부호 텍스트 + 강조 1개 계약) | 시계열 편차(기준 대비 추이) 확장 |
| 5 | Part-to-Whole | 무엇으로 구성되는가? | 조립 | Assembly 스토리: `DonutChart` 조립, 조각 <5·라벨 병기 단언 | 자체 컴포넌트 없음 |
| 6 | Correlation | 서로 관계있는가? | 조립 | Assembly 스토리: 스몰 멀티플 조립, 이중 축 금지·영 기준선 단언 | 스캐터가 상류에 생기면 조립 교체 |
| 7 | Distribution | 어떻게 퍼져 있는가? | 조립 | Assembly 스토리: `BarChart` 히스토그램 조립, 영 기준선(비례 실측)·구간 ≤7 단언 | 자체 컴포넌트 없음 |
| 8 | Spatial | 어디에서 일어나는가? | **밖** | — | 지도·공간 표기는 Robotics(오버레이)·3D(씬) 소유. 여기서 만들면 소유권 충돌 |
| 9 | Flow | 무엇이 어디로 흐르는가? | 보류 | — | Sankey류는 구현 비용 대비 수요 미확인. 두 번째 실사용처가 나올 때 판정 |

## 카테고리 밖 (AntV 분류에서 보완)

비차트 서사 그래픽 — 데이터가 아니라 구조를 그리는 것:

| 종류 | 판정 | 비고 |
|---|---|---|
| 프로세스/단계 | 조립 우선 | Core `StepList`·`Timeline`이 이미 있음. 부족한 것이 확인되면 소유 검토 |
| 계층/구성도 | 보류 | 수요 미확인 |
| 비교표 | 조립 | Core 테이블 + `KeyFigure` 조합 |

## 소유 판정의 공통 기준

1. **측정을 그리면 상류, 서사를 얹으면 여기.** 축·눈금·마크가 필요하면 Core/Product 차트를 조립한다.
2. **강조는 한 번에 하나** — 소유 컴포넌트는 모두 이 계약을 코드로 강제한다.
3. **그래픽은 보조 채널** — 정확한 값·주장은 항상 텍스트로 병기한다.
4. Spatial은 만들지 않는다 — Robotics/3D와의 경계는 협상이 아니라 전제다.
