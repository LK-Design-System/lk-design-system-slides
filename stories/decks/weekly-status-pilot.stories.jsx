/**
 * 열람 덱 파일럿 (READING_DECK_PILOT) — 주간 업무현황.
 *
 * 발표 덱이 아니라 **열람 덱**(leave-behind/slidedoc)의 실측 파일럿이다:
 * 메신저로 회람되고 책상에서 스캔되는 주간보고는 "한 페이지 한 주제"가
 * 미덕이라, 발표 덱 규율과 다른 계약이 필요하다. 파일럿이 손으로 정의했던
 * 것들은 제안을 거쳐 승격됐다 — 덱은 `kind="read"`로 열람 게이트 프로파일을
 * 받고, 2단계 리스트·전시물 행·주차 스팬 행은 editorial 컴포넌트
 * (TopicList·ExhibitRow·WeekSpanRows)가 됐다. 이 덱은 이제 열람 덱의
 * 레퍼런스 실물이다.
 * 관찰 기록: docs/READING_DECK_PILOT.md → 제안: docs/READING_DECK_PROPOSAL.md
 */
import React from 'react';
import { DeckViewer, TitleSlide, ContentSlide, TopicList, ExhibitRow, WeekSpanRows } from '../../src/index.js';
import photo from './assets/site-photo-placeholder.svg';

const meta = { title: 'Decks/주간 업무현황 파일럿' };
export default meta;

const FOOT = 'LKR 플랫폼 · 8월 2주차';
const WEEKS = ['8월 2주차', '8월 3주차'];

export const Deck = {
  name: '주간 업무현황 (열람 파일럿)',
  render: () => (
    <DeckViewer label="8월 2주차 LKR 업무현황" kind="read" preset="briefing">
      <TitleSlide
        eyebrow="LKR 플랫폼"
        title="8월 2주차 업무현황"
        subtitle="장진혁"
        foot={FOOT}
        notes="열람 덱 파일럿: 회람용이라 발표자 서사 없이 페이지 단위로 완결된다. 표지는 제목·소속·보고자·주차로 완결 — 내용 요약 부제는 발표 문법이라 쓰지 않는다."
      />
      <ContentSlide
        eyebrow="업무 현황 · 장진혁"
        title="업무 현황 및 이슈"
        foot={FOOT}
        notes="열람 파일럿 2호: 원본은 내용|진행현황 2열 표지만, 실체는 프로젝트별 진행 리스트다 — TopicList의 2단계 리듬을 그대로 쓴다."
      >
        <TopicList
          items={[
            {
              topic: '대덕특구',
              details: [
                '시뮬레이션 기반 검증 완료',
                '실환경 검증을 위한 데모용 CCTV 제작 및 녹화 동기화 기능 구현',
              ],
            },
            {
              topic: '쓰러짐 기능 구현',
              details: ['시뮬레이션 기반 검증 및 실환경 검증 진행'],
            },
          ]}
        />
      </ContentSlide>
      <ContentSlide
        eyebrow="업무 현황 상세"
        title="시뮬레이션 기반 검증"
        foot={FOOT}
        notes="열람 페이지: 경과·수치·증거가 한 장에 담긴다 — 발표 덱이라면 세 장으로 나눌 내용. 전시물 행은 잔여 높이 주도(ExhibitRow 계약)라 크롬 밴드를 침범하지 않는다."
      >
        <div style={{ display: 'grid', gap: 'var(--space-5)', height: '100%', minHeight: 0, gridTemplateRows: 'auto minmax(0, 1fr)' }}>
          <TopicList
            style={{ gap: 'var(--space-4)' }}
            items={[
              {
                topic: '사전 검증 — 실제 CCTV 테스트 전 기능 검증과 부하 테스트를 수행',
                details: [
                  'Issac Sim: 6 CCTV·6명 동선 정상 생성 확인',
                  '동선 다양성·인원 추가 시 시뮬레이션 PC 부하 초과 — Unreal 전환 결정',
                ],
              },
              {
                topic: 'Unreal Engine 검증 — 5명·CCTV 6대·720p 구성',
                details: [
                  '감지 이벤트당 동선 추적 성공률 82.3%',
                  '의상이 유사한 케이스를 제외하면 대부분 성공',
                ],
              },
            ]}
          />
          <ExhibitRow
            exhibits={[
              { src: photo, caption: '시뮬레이션 화면 — P0002 추적 중' },
              { src: photo, caption: '동선 분석 결과 (job-efb4e2d36ca24d2b)' },
            ]}
          />
        </div>
      </ContentSlide>
      <ContentSlide
        eyebrow="업무 계획"
        title="향후 업무 계획"
        foot={FOOT}
        notes="열람 파일럿 3호: 주차 스팬 행(간트-lite) — WeekSpanRows로 승격된 세 번째 계약."
      >
        <WeekSpanRows
          label="향후 업무 계획"
          weeks={WEEKS}
          rows={[
            { name: '화재 검출', work: '화재 데이터셋 수집 및 학습', from: 0, to: 1, continues: true },
            { name: '쓰러짐 검출', work: '실환경 검증 및 테스트', from: 0, to: 1, continues: true },
          ]}
        />
      </ContentSlide>
    </DeckViewer>
  ),
};
