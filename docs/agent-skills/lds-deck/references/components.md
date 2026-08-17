# 컴포넌트 어휘

`@lk-design-system/lds-slides-ui`의 슬라이드 어휘 전체. 모두 `src/index.js`에서 flat export.
모든 슬라이드는 `preset`('keynote' | 'briefing')과 `style`을 받고 나머지는 표면으로 전달한다.

## 골격 슬라이드

### TitleSlide — 표지
```jsx
<TitleSlide eyebrow="LK Robotics" title="물류 자동화 제안" subtitle="2026 3분기 경영 보고" />
```
`title`은 display 스케일(18ch 상한). eyebrow는 대문자 캡션.

### AgendaSlide — 목차 / 진행 표시
```jsx
<AgendaSlide items={['현황 진단', '개선 방안', '실행 계획']} />
<AgendaSlide items={[...]} current={2} />   {/* 챕터 사이 진행 슬라이드로 재사용 */}
```
`current`는 1-based, SectionSlide의 `index`와 같은 번호 체계. 정확히 한 항목만 current.
번호는 자동으로 01 02 … 제로 패딩.

### SectionSlide — 챕터 간지
```jsx
<SectionSlide index={2} title="개선 방안" subtitle="세 갈래 접근" />
```
`index`는 숫자면 제로 패딩(02). 제목은 명사형 종결, subtitle은 방향 제시 한 줄 — 내용 금지.

### EndSlide — 막지
```jsx
<EndSlide message="다음 분기, 두 배로" contact="jinhyuk2me@gmail.com · 플랫폼팀" />
```
`message`는 Q&A 동안 화면에 남는 한 줄(display 스케일). 논증하는 막지는 늦게 도착한
콘텐츠 슬라이드다 — 주장 잔향 또는 감사, 덱이 결정.

## 콘텐츠 슬라이드

### ContentSlide — 만능 본문
```jsx
<ContentSlide eyebrow="현황" title="지연 원인 진단" governing="병목은 수집이 아니라 반영 단계에서 발생한다.">
  {/* 자유 마크업 — 타입은 --slides-* 단계, 색은 semantic 토큰 */}
</ContentSlide>
```
헤더 계약: eyebrow(선택) / title(명사형) / governing(완결 문장 주장, 선택, 46ch 상한).
content 영역 기본 타입은 body 단계.

### SplitSlide — 2분할
```jsx
<SplitSlide title="…" governing="…" ratio="2:1" left={<…/>} right={<…/>} />
```
`ratio`는 닫힌 어휘: `'1:1' | '2:1' | '1:2'`. 그 이상 기울면 비교가 아니라 그리드 —
표나 도판으로 처리. ContentSlide 헤더 계약이 그대로 흐른다.

### StatementSlide — 주장 한 문장 / 인용
```jsx
<StatementSlide eyebrow="핵심 주장" statement="지연을 줄이는 가장 싼 방법은 이관이 아니라 폐기다." />
<StatementSlide statement="…" attribution="— 플랫폼팀 기술 검토서" />   {/* 인용 형태 */}
```
캔버스 전체가 주장 하나. `statement`는 **완결 문장**(명사형 제목 금지 — title/governing
구분과 같은 결). 이 슬라이드에서는 statement 자체가 accent라 eyebrow는 자동으로
라벨 톤으로 내려간다. 덱이 도는 결정적 주장이나 인용에만 쓴다 — 남발하면 무게가 죽는다.

## 단계 공개 — Step

```jsx
<ContentSlide title="…" governing="…">
  <ul style={{ /* … */ }}>
    <Step at={1} as="li">첫 번째 근거</Step>
    <Step at={2} as="li">두 번째 근거</Step>
  </ul>
</ContentSlide>
```
`at`은 슬라이드 안 신호 번호(1부터). DeckViewer가 ← →를 **슬라이드보다 단계에 먼저**
소비한다. 계약: **공개는 리플로를 일으키지 않는다** — 대기 단계도 투명하게 자리를
지키므로, 구성은 전부 공개된 상태 기준으로 맞춘다. `as`로 시맨틱 요소(li 등)를 유지할 것.
덱 밖(카탈로그)에서는 전부 공개로 렌더된다. 이전 슬라이드로 돌아가면 끝 상태로 들어간다.

## Editorial 위임 슬라이드 (데이터를 넘기고 그리지 않는다)

### StatSlide — 수치
```jsx
<StatSlide
  eyebrow="운영 지표" title="분기 성과 요약"
  figures={[
    { value: 99.2, unit: '%', label: '가동률', claim: '분기 목표 98%를 상회했다.' },
    { value: 14, unit: '분', label: '평균 복구 시간', claim: '작년 동기 대비 절반으로 단축.', emphasis: true },
  ]}
  source="출처: 사내 운영 대시보드, 2026-07"
/>
```
숫자는 Editorial `KeyFigure`가 그린다. **강조 예산**: emphasis를 요청한 첫 figure만
승인, 나머지는 강등, 강조를 쓴 슬라이드는 eyebrow가 자동으로 내려간다. 데이터에
emphasis를 여러 개 넣지 말 것 — 컴포넌트가 걸러주지만 의도가 불명확해진다.

### FigureSlide — 도판 (차트/이미지/SVG)
```jsx
<FigureSlide
  title="지연 추이" governing="스트리밍 전환 이후 p95 지연이 절반으로 줄었다."
  annotations={[
    { id: 'cutover', anchor: 'streaming-cutover', title: '스트리밍 전환', body: '6주차, 지연 민감 테이블 이관', emphasis: true },
    { id: 'method', title: '동일 계측 기준', body: '집계 방식 변경 없음' },
  ]}
  caption="…" source="출처: …"
>
  <차트든 img든 svg든 />
</FigureSlide>
```
**도판은 슬라이드당 한 개.** 차트가 둘이면 슬라이드가 둘이다. 주석은 Editorial
`AnnotatedFigure` 계약: **`anchor`가 있는 주석은 캔버스 위 콜아웃**(지시선 +
앵커 점, 여백이 있는 차트의 관용구), **앵커 없는 주석은 옆 레일**(방법론
노트의 자리). 캔버스가 꽉 찬 밀집 도판(다열 다이어그램)에는 콜아웃이 앉을
여백이 없다 — 앵커를 떼고 레일을 쓴다; 도판 자신이 강조를 나르면 콜아웃은
중복이다. emphasis 주석이 있으면 eyebrow가 내려간다.

### ImageSlide — 사진
```jsx
import photo from './assets/site-photo.jpg';   // 덱 자산은 덱 파일 옆 assets/에 두고 import
<ImageSlide
  eyebrow="현장" title="물류동 증설 현장"
  governing="9월 착공분이 외장 마감 단계에 들어갔습니다."
  src={photo} alt="철골 골조가 선 물류동 공사 현장"
  caption="물류동 B동, 남측에서" source="출처: 현장 주간 보고, 2026-07"
/>
<ImageSlide bleed src={photo} alt="…" caption="…" source="…" />   {/* 전면(히어로) */}
```
사진이 콘텐츠인 슬라이드 (FigureSlide는 주석 달린 전시물용). `alt`는 필수 — 없으면
캔버스에 보이는 경고가 렌더되고 `check:deck-content`(img-alt)가 빌드를 세운다.
박스는 남은 높이가 몰고 `aspect`(기본 16/9)가 모양만 정하므로 늦게 로드된 사진이
리플로하지 않는다. 자유 마크업에 raw `<img>`를 쓸 때는 width+height 속성이나
aspect-ratio로 박스를 예약할 것 — 안 하면 img-unsized가 잡는다.

### CompareSlide — 대안 평가표 (컨설팅 비교표)
```jsx
<CompareSlide
  title="이관 방식 비교" governing="부분 이관이 비용과 확장성의 균형점이다."
  criteria={['도입 비용', '운영 부담', '확장성']}
  options={[
    { id: 'batch', name: '배치 유지', verdicts: ['strong', 'strong', 'weak'] },
    { id: 'hybrid', name: '부분 이관', verdicts: ['fair', 'fair', 'strong'] },
  ]}
  recommendation="hybrid"
  caption="…" source="…"
/>
```
verdict는 닫힌 어휘(`strong` `fair` `weak`), 추천 열은 하나. `recommendation`이 있으면
강조가 소비된 것으로 보고 eyebrow가 내려간다.

### RoadmapSlide — 실행 로드맵
```jsx
<RoadmapSlide
  title="실행 계획" governing="지연 민감 테이블부터 단계 이관한다."
  phases={[
    { id: 'pilot', date: '2026-08', label: '1차: 지연 민감 테이블 이관', body: '주문·텔레메트리 5개', emphasis: true },
    { id: 'verify', date: '2026-10', label: '2차: 운영 검증', body: 'p95 지연·비용 이중 추적' },
    { id: 'sunset', label: '배치 경로 폐기', body: '확대 결정에 종속' },   // 날짜 미정 → 각주로 표기됨
  ]}
  source="…"
/>
```
정렬은 Editorial `NarrativeTimeline`이 소유 — 입력 순서 무관. 날짜 없는 단계는 레일에
추정 배치되지 않고 각주가 된다. emphasis 단계가 있으면 eyebrow가 내려간다.

**시간축이 정보를 나를 때만 쓴다.** 모든 phase의 date가 같으면 그건 일정이 아니라
의존 관계다("A와 B가 끝나야 C") — 로드맵이 아니라 StepList나 도식이 그 내용의 모양이고,
`check:deck-content`(roadmap-flat-dates)가 빌드에서 잡는다. 날짜를 못 박을 단계는
date를 비워 각주로 보내는 것이 같은 날짜를 복붙하는 것보다 정직하다.

### AssessmentSlide — 상태 평가표 (신호등 테이블)
```jsx
<AssessmentSlide
  title="분기 목표 달성 현황" governing="성능은 궤도에 있으나 비용이 목표를 이탈했다."
  metrics={[
    { id: 'p95', group: '성능', name: '수집–반영 p95 지연', target: '20분', actual: '18분', status: 'met' },
    { id: 'cost', group: '비용', name: '월 운영 비용', target: '₩42M', actual: '₩51M', status: 'missed' },
  ]}
  caption="…" source="…"
/>
```
status 닫힌 어휘: `met`(무채색) `watch` `missed`. 상태 틴트는 일탈 채널이라 강조 예산과
경쟁하지 않는다 — eyebrow 유지됨.

## 열람 페이지 콘텐츠 (kind="read" 전용 어휘, content-rules §8)

ContentSlide children 안에서 쓰는 열람 덱의 세 계약. 레퍼런스 실물:
Decks/주간 업무현황 파일럿.

### TopicList — 2단계 리스트
```jsx
<TopicList items={[
  { topic: '대덕특구', details: ['시뮬레이션 기반 검증 완료', '…'] },
]} />
```
대항목 note·semibold·strong, 세부 note-body·regular·neutral, 들여쓰기는 표의
셀 패딩 재사용. **2단계가 계약** — 세 번째 위계는 들여쓰기가 아니라 표나
페이지 분할로 간다.

### ExhibitRow — 본문 곁 증거 행
```jsx
<ExhibitRow exhibits={[{ src, caption: '시뮬레이션 화면 — P0002 추적 중' }]} />
```
N열 균등 grid + 잔여 높이 주도 이미지(고정 px 높이 금지 — 크롬 스필의
원인이었다) + ellipsis 한 줄 캡션. 컨테이너가 `minmax(0, 1fr)` 행으로
높이를 한정해 줘야 한다.

### WeekSpanRows — 주차 스팬 행 (간트-lite)
```jsx
<WeekSpanRows label="향후 업무 계획" weeks={['8월 2주차', '8월 3주차']}
  rows={[{ name: '화재 검출', work: '화재 데이터셋 수집 및 학습', from: 0, to: 1, continues: true }]} />
```
시간 격자(주차 칸 눈금 + 칸 중앙 헤더)가 축을 만들고, 스팬 바는 grid-column
**한 몸**이다 — **스팬·레일은 경계에서 끊기지 않는다**(타임라인 레일과 공통
연속성 규칙, play 단언으로 집행). `continues`는 표 끝을 살짝 넘는 화살촉.

## 컨테이너

### DeckViewer
```jsx
<DeckViewer label="덱 제목" initial={0} kind="present"> {slides} </DeckViewer>
```
`kind`: `present`(기본, 발표) | `read`(회람·열람 — 콘텐츠 게이트 프로파일이
바뀐다, content-rules §8).
한 번에 한 슬라이드 마운트. ← → PageUp/Down Home End, 끝은 순환하지 않고 멈춤.
이전/다음 버튼 + 진행 바 + `n / total` 카운터 내장. `Step`이 있으면 키가 단계를 먼저
소비하고, `N` 키가 현재 슬라이드의 발표자 노트를 토글한다.

**발표자 노트**: 각 슬라이드 요소의 `notes` prop에 싣는다 — 캔버스에는 절대 넣지 않는다
(SlideSurface가 흡수해 DOM에도 남지 않음).
```jsx
<ContentSlide title="…" notes="이 장에서는 비용 얘기를 먼저 꺼낸다. [~2분]" … />
```

### SlideSurface (직접 쓸 일은 드묾)
고정 1280px 논리 캔버스를 컨테이너에 scale로 끼움. 모든 px는 설계 px.
새 레이아웃이 필요할 때만 직접 조립하되, 그 전에 lds-slides-ui 소유자에게 어휘 확장을 요청한다 — 우회 구현은 계약 밖이다.

## 공통 규칙

- `source` prop이 있는 슬라이드(Stat/Figure/Compare/Roadmap/Assessment)에서 외부·내부
  데이터를 보였으면 반드시 출처를 채운다. 형식: `"출처: <시스템/문서>, <YYYY-MM>"`.
- 강조 예산 요약: 슬라이드당 accent는 하나다. figure emphasis / annotation emphasis /
  recommendation / phase emphasis 중 하나가 쓰이면 eyebrow의 accent가 자동으로 내려간다.
  status 틴트(AssessmentSlide)만 예외.
