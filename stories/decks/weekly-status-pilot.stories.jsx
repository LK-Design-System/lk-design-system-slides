/**
 * 열람 덱 파일럿 (READING_DECK_PILOT) — 주간 업무현황.
 *
 * 발표 덱이 아니라 **열람 덱**(leave-behind/slidedoc)의 실측 파일럿이다:
 * 메신저로 회람되고 책상에서 스캔되는 주간보고는 "한 페이지 한 주제"가
 * 미덕이라, 발표 덱 규율(한 슬라이드 한 주장, 전시물 하나)과 다른 계약이
 * 필요하다. 이 스토리는 실제 LKR 업무현황 페이지 하나를 한 장 밀도로
 * 옮기면서 현행 시스템에 없는 계약을 드러내는 것이 목적이다 — 여기서
 * 손으로 짠 것(2단계 리스트 리듬, 복수 전시물 행)이 곧 열람 모드 제안의
 * 계약 후보이고, 게이트와 부딪힌 지점은 known-failures에 사유와 함께
 * 핀되어 "열람 모드가 합법화해야 할 것"의 목록이 된다.
 * 관찰 기록: docs/READING_DECK_PILOT.md
 */
import React from 'react';
import { DeckViewer, TitleSlide, ContentSlide } from '../../src/index.js';
import photo from './assets/site-photo-placeholder.svg';

const meta = { title: 'Decks/주간 업무현황 파일럿' };
export default meta;

const FOOT = 'LKR 플랫폼 · 8월 2주차';

/* 2단계 리스트 — 열람 덱의 핵심 요구. 현행 시스템에 계약이 없어 파일럿이
   손으로 정의한다(제안의 초안 값): 대항목은 body·semibold·strong, 세부는
   caption·regular·neutral, 들여쓰기는 cell-pad-inline 재사용. 이 리듬이
   검증되면 열람 모드의 리스트 계약으로 승격한다. */
const Topic = ({ children }) => (
  <li style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--color-semantic-label-strong)' }}>
    {children}
  </li>
);
const Details = ({ items }) => (
  <ul
    style={{
      margin: 'var(--space-2) 0 0',
      paddingLeft: 'var(--editorial-cell-pad-inline)',
      listStyle: 'disc',
      display: 'grid',
      gap: 'var(--space-2)',
      fontSize: 'var(--slides-caption-size)',
      lineHeight: 'var(--slides-caption-line)',
      letterSpacing: 'var(--slides-caption-spacing)',
      fontWeight: 'var(--fw-regular)',
      color: 'var(--color-semantic-label-neutral)',
    }}
  >
    {items.map((item) => <li key={item}>{item}</li>)}
  </ul>
);

/* 주차 스팬 행(간트-lite) — 열람 덱의 세 번째 요구(파일럿 3호에서 등장).
   계획 항목이 주차 축 위에 스팬 바로 눕는다. 표의 밴딩 문법(데이터 행 밴드,
   헤더 맨몸)과 --editorial-* 밀도 seam을 재사용하고, 바는 primary 토큰이다.
   `continues`는 마지막 주차 너머로 이어짐을 화살표 글리프로 말한다 —
   원본 PPT의 표 밖으로 삐져나가는 화살표의 정직한 번역. */
const WEEKS = ['8월 2주차', '8월 3주차'];
const PlanRows = ({ rows }) => (
  <div
    role="table"
    aria-label="향후 업무 계획"
    style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr) repeat(2, minmax(0, 0.7fr))',
      fontSize: 'var(--editorial-note-size)',
      lineHeight: 'var(--editorial-note-line)',
      letterSpacing: 'var(--editorial-note-spacing)',
    }}
  >
    {['프로젝트', '업무 내용', ...WEEKS].map((head) => (
      <div
        key={head}
        role="columnheader"
        style={{
          padding: 'var(--editorial-cell-pad-block) var(--editorial-cell-pad-inline)',
          fontWeight: 'var(--fw-semibold)',
          color: 'var(--color-semantic-label-strong)',
          borderBottom: '1px solid var(--color-semantic-line-normal-normal)',
        }}
      >
        {head}
      </div>
    ))}
    {rows.map(({ name, work, from, to, continues }) => (
      <React.Fragment key={name}>
        <div role="rowheader" style={{ padding: 'var(--editorial-cell-pad-block) var(--editorial-cell-pad-inline)', background: 'var(--color-semantic-fill-alternative)', fontWeight: 'var(--fw-semibold)', color: 'var(--color-semantic-label-strong)' }}>
          {name}
        </div>
        <div role="cell" style={{ padding: 'var(--editorial-cell-pad-block) var(--editorial-cell-pad-inline)', background: 'var(--color-semantic-fill-alternative)', color: 'var(--color-semantic-label-neutral)' }}>
          {work}
        </div>
        {WEEKS.map((week, order) => {
          const active = order >= from && order <= to;
          const isStart = order === from;
          const isEnd = order === to;
          return (
            /* 스팬 바는 칸 경계에서 끊기면 안 된다 — 끊긴 스팬은 두 개의
               계획으로 읽힌다(타임라인 레일과 같은 연속성 규칙). 활성 칸은
               가로 패딩을 버리고 바가 경계까지 닿게 하며, 둥근 끝은 스팬의
               진짜 시작·끝에만 준다. */
            <div
              key={week}
              role="cell"
              aria-label={active ? `${week} 진행` : undefined}
              style={{
                padding: 'var(--editorial-cell-pad-block) 0',
                paddingLeft: active && isStart ? 'var(--space-2)' : 0,
                paddingRight: active && isEnd && !continues ? 'var(--space-2)' : 0,
                background: 'var(--color-semantic-fill-alternative)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {active && (
                <>
                  <span
                    style={{
                      flex: 1,
                      height: 12,
                      background: 'var(--color-semantic-primary-normal)',
                      borderRadius: `${isStart ? '6px' : 0} ${isEnd && !continues ? '6px 6px' : '0 0'} ${isStart ? '6px' : 0}`,
                    }}
                  />
                  {/* 계속 화살촉 — 글리프가 아니라 바와 같은 토큰의 삼각형.
                      글리프를 바 위에 얹는 첫 시도는 primary 위 primary라
                      보이지 않았다. */}
                  {isEnd && continues && (
                    <span
                      aria-label="다음 주차로 계속"
                      style={{
                        width: 0,
                        height: 0,
                        flex: 'none',
                        borderTop: '9px solid transparent',
                        borderBottom: '9px solid transparent',
                        borderLeft: '12px solid var(--color-semantic-primary-normal)',
                      }}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </React.Fragment>
    ))}
  </div>
);

export const Deck = {
  name: '주간 업무현황 (열람 파일럿)',
  render: () => (
    <DeckViewer label="8월 2주차 LKR 업무현황">
      <TitleSlide
        eyebrow="LKR 플랫폼"
        title="8월 2주차 업무현황"
        subtitle="장진혁"
        foot={FOOT}
        notes="열람 덱 파일럿: 회람용이라 발표자 서사 없이 페이지 단위로 완결된다. 표지는 제목·소속·보고자·주차로 완결 — 내용 요약 부제는 발표 문법이라 쓰지 않는다."
      />
      <ContentSlide
        preset="briefing"
        eyebrow="업무 현황 · 장진혁"
        title="업무 현황 및 이슈"
        anchor="center"
        foot={FOOT}
        notes="열람 파일럿 2호: 원본은 내용|진행현황 2열 표지만, 실체는 프로젝트별 진행 리스트다 — 1호의 2단계 리스트 계약을 재사용한다."
      >
        <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-5)' }}>
          <Topic>
            대덕특구
            <Details items={[
              '시뮬레이션 기반 검증 완료',
              '실환경 검증을 위한 데모용 CCTV 제작 및 녹화 동기화 기능 구현',
            ]} />
          </Topic>
          <Topic>
            쓰러짐 기능 구현
            <Details items={[
              '시뮬레이션 기반 검증 및 실환경 검증 진행',
            ]} />
          </Topic>
        </ul>
      </ContentSlide>
      <ContentSlide
        preset="briefing"
        eyebrow="업무 현황 상세"
        title="시뮬레이션 기반 검증"
        foot={FOOT}
        notes="열람 페이지: 경과·수치·증거가 한 장에 담긴다 — 발표 덱이라면 세 장으로 나눌 내용."
      >
        <div style={{ display: 'grid', gap: 'var(--space-5)', height: '100%', minHeight: 0, gridTemplateRows: 'auto minmax(0, 1fr)' }}>
          <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-4)' }}>
            <Topic>
              사전 검증 — 실제 CCTV 테스트 전 기능 검증과 부하 테스트를 수행
              <Details items={[
                'Issac Sim: 6 CCTV·6명 동선 정상 생성 확인',
                '동선 다양성·인원 추가 시 시뮬레이션 PC 부하 초과 — Unreal 전환 결정',
              ]} />
            </Topic>
            <Topic>
              Unreal Engine 검증 — 5명·CCTV 6대·720p 구성
              <Details items={[
                '감지 이벤트당 동선 추적 성공률 82.3%',
                '의상이 유사한 케이스를 제외하면 대부분 성공',
              ]} />
            </Topic>
          </ul>
          {/* 복수 전시물 행 — 열람 덱의 두 번째 요구. 발표 덱 규율은 한 장
              한 전시물이지만, 열람 페이지는 증거를 본문 옆에 둔다.
              전시물 높이는 고정값이 아니라 잔여 높이 주도(ImageSlide의
              height-driven 계약과 동일) — 고정 220px 첫 시도는 캡션이 크롬
              밴드로 스필돼 푸터와 겹쳤고, 그 스필은 패딩 존이라 오버플로
              게이트에도 안 잡혔다(파일럿 발견 2, READING_DECK_PILOT.md). */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--editorial-figure-gap)', minHeight: 0 }}>
            {[
              ['시뮬레이션 화면 — P0002 추적 중', photo],
              ['동선 분석 결과 (job-efb4e2d36ca24d2b)', photo],
            ].map(([label, src]) => (
              <figure key={label} style={{ margin: 0, minWidth: 0, minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', gap: 'var(--space-2)' }}>
                <img src={src} alt={label} width={533} height={220} style={{ width: '100%', height: '100%', minHeight: 0, objectFit: 'cover', borderRadius: 'var(--radius-md, 12px)' }} />
                <figcaption
                  style={{
                    fontSize: 'var(--slides-fine-size)',
                    lineHeight: 'var(--slides-fine-line)',
                    letterSpacing: 'var(--slides-fine-spacing)',
                    color: 'var(--color-semantic-label-alternative)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </ContentSlide>
      <ContentSlide
        preset="briefing"
        eyebrow="업무 계획"
        title="향후 업무 계획"
        anchor="center"
        foot={FOOT}
        notes="열람 파일럿 3호: 주차 스팬 행(간트-lite) — 기존 어휘에 없는 세 번째 계약 후보."
      >
        <PlanRows
          rows={[
            { name: '화재 검출', work: '화재 데이터셋 수집 및 학습', from: 0, to: 1, continues: true },
            { name: '쓰러짐 검출', work: '실환경 검증 및 테스트', from: 0, to: 1, continues: true },
          ]}
        />
      </ContentSlide>
    </DeckViewer>
  ),
};
