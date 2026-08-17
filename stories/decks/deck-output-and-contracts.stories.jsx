import React from 'react';
import {
  DeckViewer,
  TitleSlide,
  AgendaSlide,
  SectionSlide,
  ContentSlide,
  CodeSlide,
  StatSlide,
  StatementSlide,
  Step,
  FigureSlide,
  TriptychSlide,
  QuadrantSlide,
  AssessmentSlide,
  EndSlide,
  MappingDiagram,
} from '../../src/index.js';

/**
 * 산출과 계약 — LDS Slides 플랫폼 보고 (2026-08-17).
 *
 * 실물 덱이다. 감사 백로그가 비면서 "다음 확장은 실제 덱에서 나온 수요를
 * 따른다"는 자기 규율이 유일한 입력이 됐고, 이 덱이 그 입력을 만드는 첫
 * 시도다. **숫자는 전부 이 세션의 실측값**이다 — 발명한 수치가 하나도
 * 없어야 덱에서 나오는 마찰도 진짜다.
 *
 * 거버닝 체인(고스트 덱 테스트):
 *  1. 저작·규율·검증은 다 있었는데 산출물이 Storybook을 나갈 길이 없었다.
 *  2. 그래서 완성된 덱의 전달 수단이 화면 캡처뿐이었다.
 *  3. 인쇄 시트 하나를 만들고 두 소비자가 그것을 쓴다.
 *  4. (전환) 산출을 열자 드러난 것은 어휘가 아니라 계약의 부재였다.
 *  5. 도판이 배율로 폭을 채우면 활자가 주장보다 커진다.
 *  6. 화면 px와 캔버스 px를 섞은 실수는 축소된 표면에서만 틀린다.
 *  7. 그래서 규칙은 산문이 아니라 게이트로 옮겨 적었다.
 *  8. 어휘도 실물 수요가 있는 것부터 채웠다.
 *  9. 감사의 차단·제한·마모가 전부 0이다.
 * 10. 다음 확장은 목록이 아니라 실제 덱에서 나온 수요를 따른다.
 *
 * 이 덱이 쓰지 않은 어휘도 기록으로 남긴다: TrendChart는 이 주제에 진짜
 * 시계열이 없어서 쓰지 않았다(하루 안의 게이트 개수 변화는 추이가 아니다).
 * 없는 데이터를 만들어 차트를 채우는 것이 정확히 이 시스템이 막으려는 일이다.
 */

const meta = {
  title: 'Decks/산출과 계약',
  parameters: {
    docs: {
      description: {
        component:
          '실물 보고 덱입니다 — LDS Slides가 산출물을 내보내게 된 릴리스와, 그 과정에서 계약으로 옮겨 적은 것들. '
          + '수치는 전부 2026-08-17 세션의 실측값이고, `keynote` 프리셋 · 15장 · 문서 등급 표시가 붙습니다.',
      },
    },
  },
};

export default meta;

const FOOT = 'LDS 플랫폼 · 2026-08-17';
const AGENDA = ['산출', '계약', '상태'];

const ATTRIBUTE_TRAP = `// var()는 style 선언에서만 치환된다
<text fontSize="var(--lk-chart-tick-size, 10px)">
<text style={{ fontSize: 'var(--lk-chart-tick-size)' }}>`;

// 결함의 종류와 그것을 잡는 게이트 — 대응 관계이므로 손으로 그리지 않는다.
const DEFECT_TO_GATE = [
  { from: '캔버스 넘침', to: 'check:slide-overflow' },
  { from: '도판 글자 확대', to: 'check:figure-fill', emphasis: true },
  { from: '콜아웃 이탈', to: 'check:figure-fill' },
  { from: '인쇄 장수 불일치', to: 'check:print-sheet' },
  { from: '이름 없는 변화', to: 'check:visual-snapshot' },
];

export const Deck = {
  name: '산출과 계약',
  render: () => (
    <DeckViewer label="산출과 계약" classification="내부용">
      <TitleSlide
        eyebrow="플랫폼 보고"
        title="산출과 계약"
        subtitle="LDS Slides · 덱이 파일로 나가기까지 · 2026-08-17"
        foot={FOOT}
        notes="이 덱은 기능 목록이 아니라 하나의 논증이다: 산출을 열었더니 어휘가 아니라 계약이 부족했다는 것. 결론부터 말하지 않는다. [~1분]"
      />

      <AgendaSlide
        items={AGENDA}
        foot={FOOT}
        notes="세 챕터. 산출 → 계약 → 상태. 질문은 챕터 끝에서."
      />

      <SectionSlide index={1} title="산출" subtitle="만든 덱이 나갈 길이 없던 문제" foot={FOOT} />

      <ContentSlide
        eyebrow="문제"
        title="마지막 마일의 부재"
        anchor="center"
        governing="저작과 검증은 다 있었는데 덱이 나갈 길이 없었다."
        foot={FOOT}
        notes="게이트 8종, 스토리 71개, 어휘 15종 — 전부 있었다. 그런데 완성된 덱을 남에게 주는 방법이 캡처뿐이었다. 주간보고는 파일로 회람되고 발표자는 파일을 들고 간다. [~1분 30초]"
      >
        <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
          <Step at={1} as="li">저장소 전체에 인쇄 CSS 0건</Step>
          <Step at={2} as="li">전달 수단은 화면 캡처뿐</Step>
          <Step at={3} as="li">동종 3종은 전원 PDF를 내보낸다</Step>
        </ul>
      </ContentSlide>

      <StatSlide
        eyebrow="실측"
        title="첫 산출물"
        governing="4장 덱이 4페이지 PDF로, 글자를 글자로 유지한 채 나왔다."
        figures={[
          { value: 960, unit: '×540pt', label: '페이지 크기', claim: '1280×720 캔버스와 1:1.' },
          { value: 4, label: '4장 덱이 만든 페이지', emphasis: true, claim: '장수가 정확히 일치.' },
        ]}
        source="출처: out/weekly-pilot.pdf 실측, 2026-08-17"
        foot={FOOT}
        notes="PDF 내부를 열어 확인한 값이다. MediaBox가 960×540pt = 1280×720px, Pretendard가 임베드되고 텍스트 연산자가 살아 있다 — 선택·검색이 된다. 동종의 PPTX는 이미지 기반이라 못 하는 것이다."
      />

      <FigureSlide
        eyebrow="설계"
        title="시트 하나, 소비자 둘"
        governing="인쇄 시트는 뷰어가 일부러 하는 세 가지를 되돌린다."
        annotations={[
          {
            id: 'why',
            title: '시트는 하나뿐',
            body: '브라우저 인쇄와 CLI가 같은 시트를 쓰므로 PDF가 화면과 갈라질 자리가 없다.',
            emphasis: true,
          },
          { id: 'url', title: 'prop이 아니라 URL', body: 'PDF가 필요한 사람 앞에 있는 것은 소스 파일이 아니라 주소다.' },
        ]}
        caption="?lds-print=1 — 이미 쓰여 있는 모든 덱이 그 순간 인쇄 시트가 된다"
        source="출처: DeckPrintSheet 구현, 2026-08-17"
        foot={FOOT}
        notes="시트가 되돌리는 것은 뷰어가 일부러 하는 세 가지다: 한 장씩 마운트, 맞춤 변환, 크롬. 크롬은 숨기지 않고 렌더 자체를 안 한다 — 숨기기는 스타일시트 하나 차이로 인쇄된다. [~2분]"
      >
        <MappingDiagram
          rows={[
            { from: '한 장씩 마운트', to: '전 장 마운트' },
            { from: '맞춤 변환(scale)', to: 'scale="none"', emphasis: true },
            { from: '크롬 렌더', to: '렌더하지 않음' },
          ]}
          fromLabel="뷰어가 하는 것"
          toLabel="시트가 하는 것"
          label="인쇄 시트가 뷰어의 세 동작을 되돌리는 구조"
        />
      </FigureSlide>

      <StatementSlide
        eyebrow="전환점"
        statement="산출을 열자 드러난 것은 어휘의 부족이 아니라 계약의 부재였다."
        foot={FOOT}
        notes="여기가 덱이 도는 지점이다. PDF를 만들자마자 4장 덱이 6페이지로 나왔고, 그 원인이 우리 자신의 32px 패딩이었다. 어휘를 더 만들 문제가 아니었다. [~1분]"
      />

      <SectionSlide index={2} title="계약" subtitle="산문이던 규칙을 게이트로 옮긴 과정" foot={FOOT} />

      <StatSlide
        eyebrow="결함"
        title="측정으로만 보이는 것"
        governing="눈으로 멀쩡한 렌더가 계약을 두 번 어기고 있었다."
        figures={[
          { value: '×1.97', label: '도판 글자 확대', claim: '18px 라벨이 주장 문장보다 크게 찍혔다.', emphasis: true },
          { value: 32, unit: 'px', label: '패딩이 만든 오차', claim: '4장 덱이 6페이지로 나왔다.' },
        ]}
        source="출처: check:figure-fill · check:print-sheet 실측, 2026-08-17"
        foot={FOOT}
        notes="첫 번째는 폭을 배율로 채운 결과다 — 게이트가 '70% 채워라'만 재니까 확대가 통과했다. 두 번째는 인쇄 시트를 감싼 우리 데코레이터의 패딩이다. 둘 다 렌더는 정상으로 보인다."
      />

      <CodeSlide
        eyebrow="함정"
        title="속성 안의 변수"
        anchor="center"
        governing="SVG 프레젠테이션 속성의 var()는 치환되지 않는다."
        code={ATTRIBUTE_TRAP}
        caption="2행은 죽은 코드, 3행이 살아 있는 코드 · lk-design-system"
        highlight={[2]}
        foot={FOOT}
        notes="커밋 직전에 잡았다. 폴백이 기존 리터럴이라 렌더가 '정상'으로 보이고, 훅이 죽은 것을 아무도 못 본다. 계약이라고 믿는 죽은 코드가 남는 방식이다. [~1분 30초]"
      />

      <TriptychSlide
        eyebrow="집행"
        title="세 단의 사다리"
        anchor="center"
        governing="같은 규칙이라도 어디에 적히느냐가 효력을 가른다."
        panels={[
          { id: 'prose', label: '산문', body: '문서에만 있는 규칙. 쓴 사람이 그날 지키고 끝난다.' },
          { id: 'snapshot', label: '스냅샷', body: '"달라졌다"를 말한다. 잘못 축복된 기준은 영원히 통과한다.' },
          { id: 'measure', label: '측정', body: '"틀렸다"를 말한다. 임계값과 근거가 함께 남는다.', emphasis: true },
        ]}
        foot={FOOT}
        notes="스냅샷과 측정은 대체재가 아니라 한 벌이다. 측정 게이트는 무엇을 찾는지 알고, 스냅샷은 아무것도 모르는 대신 나머지를 덮는다. [~1분 30초]"
      />

      <FigureSlide
        eyebrow="대응"
        title="결함과 관문"
        governing="결함마다 그것을 잡는 관문을 하나씩 붙였다."
        annotations={[
          { id: 'scale', title: '확대는 폭 미달의 해법이 아니다', body: '정직한 해법은 넓게 배치하는 것이고, 부정직한 해법을 막는 것이 두 번째 규칙이다.', emphasis: true },
        ]}
        caption="게이트 11종 중 도판·인쇄·시각 관련 5종"
        source="출처: package.json check:* 스크립트, 2026-08-17"
        foot={FOOT}
        notes="왼쪽이 실제로 겪은 결함, 오른쪽이 지금 그것을 잡는 게이트다. 강조한 행이 오늘 새로 생긴 규칙이다. [~2분]"
      >
        <MappingDiagram
          rows={DEFECT_TO_GATE}
          fromLabel="겪은 결함"
          toLabel="잡는 관문"
          label="결함 유형과 그것을 검출하는 게이트의 대응"
        />
      </FigureSlide>

      <AssessmentSlide
        eyebrow="관문"
        title="배포 전 검사 현황"
        governing="게이트는 로컬이 아니라 CI에서 돌아야 계약이다."
        metrics={[
          { id: 'gates', name: 'CI가 돌리는 게이트', target: '전건', actual: '11 / 11', status: 'met' },
          { id: 'play', name: 'play 단언', target: '전건 통과', actual: '86 / 86', status: 'met' },
          { id: 'snap', name: '시각 스냅샷', target: '기준선 일치', actual: '25 / 25', status: 'met' },
        ]}
        caption="오늘 CI에 등록된 게이트 4종을 포함한다"
        source="출처: lk-design-system-slides CI 실행 기록, 2026-08-17"
        foot={FOOT}
        notes="CI가 5종만 돌리고 있었다 — 로컬에서만 도는 게이트는 셸 스크립트 붙은 산문이다. 지금은 11종 전부 돈다."
      />

      <SectionSlide index={3} title="상태" subtitle="감사 격차와 남긴 판정" foot={FOOT} />

      <StatSlide
        eyebrow="감사"
        title="격차 정산"
        governing="차단·제한·마모 등급의 격차가 모두 0으로 내려왔다."
        figures={[
          { value: 0, label: '남은 차단 등급 격차', claim: 'PDF 경로가 유일한 차단이었다.', emphasis: true },
          { value: 17, label: '레이아웃 어휘 (종)', claim: '쿼드런트·3분할이 더해졌다.' },
        ]}
        source="출처: docs/COMPLETENESS_AUDIT.md, 2026-08-17"
        foot={FOOT}
        notes="감사는 alpha.9 기준으로 16개 격차를 적었다. 남은 것은 전부 명시적 보류 판정이고, 판정 없이 남은 항목은 0이다."
      />

      <QuadrantSlide
        eyebrow="보류"
        title="남긴 것의 배치"
        governing="보류는 잊은 것이 아니라 비용과 효과로 판정한 것이다."
        xAxis={{ name: '드는 비용', low: '작다', high: '크다' }}
        yAxis={{ name: '덱 저작에 주는 효과', low: '작다', high: '크다' }}
        quadrants={[
          { label: '수요가 오면 먼저' },
          { label: '별건으로 계획' },
          { label: '틈에' },
          { label: '하지 않는다' },
        ]}
        items={[
          { id: 'en', label: '영어 덱 프로파일', x: 0.34, y: 0.64 },
          { id: '3d', label: '3D 핀 65버전', x: 0.62, y: 0.36 },
          { id: 'merge', label: '표 셀 병합', x: 0.44, y: 0.28 },
          { id: 'pptx', label: 'PPTX 내보내기', x: 0.9, y: 0.3 },
          { id: 'draw', label: '판서·자동 진행', x: 0.72, y: 0.12 },
        ]}
        source="출처: COMPLETENESS_AUDIT 보류 판정, 2026-08-17"
        foot={FOOT}
        notes="자리가 곧 주장인 슬라이드다. PPTX는 동종 제품들도 이미지 기반이라 텍스트가 선택되지 않는다 — 비용은 크고 효과는 PDF보다 낮다. [~2분]"
      />

      <EndSlide
        message="다음 확장은 목록이 아니라 실제 덱에서 나온 수요를 따릅니다."
        contact="LDS 플랫폼 · jinhyuk2me@gmail.com"
        foot={FOOT}
        notes="Q&A 동안 이 문장을 남긴다. 이 덱 자체가 그 규율의 첫 적용이다 — 감사 목록이 비었으므로 다음 계약은 이런 덱을 쓰다가 부딪히는 것에서만 나온다."
      />
    </DeckViewer>
  ),
};
