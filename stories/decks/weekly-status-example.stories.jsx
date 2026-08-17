/**
 * 열람 덱 예시 2호 — 주간 업무현황 (8월 3주차, 데모 데이터).
 *
 * 파일럿(1호)이 계약을 만들었다면, 이 덱은 그 계약을 **다른 조합**으로
 * 굴려 판단 재료를 늘린다:
 * - 지표 페이지: 기존 위임 어휘(AssessmentSlide)가 read 덱에서 거버닝 없이
 *   그대로 성립하는지
 * - 계획 페이지: 3주 축에서 스팬이 제각각일 때 — 중간 시작, 축 안에서
 *   끝나는 둥근 캡, 계속 화살촉 혼재 — 시간 격자가 정보를 나르는지
 * - 상세 페이지: TopicList + ExhibitRow의 한 페이지 동거(파일럿 3호 골격)
 */
import React from 'react';
import { DeckViewer, TitleSlide, ContentSlide, AssessmentSlide, TopicList, ExhibitRow, WeekSpanRows } from '../../src/index.js';
import photo from './assets/site-photo-placeholder.svg';

const meta = { title: 'Decks/주간 업무현황 예시' };
export default meta;

const FOOT = 'LKR 플랫폼 · 8월 3주차';
const WEEKS = ['8월 3주차', '8월 4주차', '9월 1주차'];

export const Deck = {
  name: '주간 업무현황 (열람 예시 2호)',
  render: () => (
    <DeckViewer label="8월 3주차 LKR 업무현황" kind="read">
      <TitleSlide
        eyebrow="LKR 플랫폼"
        title="8월 3주차 업무현황"
        subtitle="장진혁"
        foot={FOOT}
        notes="열람 덱 표지 관용구: 제목·소속·보고자·주차로 완결."
      />
      <ContentSlide
        preset="briefing"
        eyebrow="업무 현황 · 장진혁"
        title="업무 현황 및 이슈"
        foot={FOOT}
        notes="2단계 리스트 페이지 — 대항목이 프로젝트, 세부가 진행 사항."
      >
        <TopicList
          items={[
            {
              topic: '화재 검출',
              details: [
                '화재 데이터셋 1차 수집 완료 (12,400장) · 라벨링 외주 발주',
                '학습 파이프라인 구성 — 기존 쓰러짐 파이프라인 재사용',
              ],
            },
            {
              topic: '쓰러짐 검출',
              details: [
                '실환경 검증 3일차 — 오탐 2건 모두 반사광 케이스',
                '반사광 필터 파라미터 조정 후 재검증 예정',
              ],
            },
          ]}
        />
      </ContentSlide>
      <AssessmentSlide
        preset="briefing"
        eyebrow="검증 지표"
        title="쓰러짐 검출 실환경 검증 현황"
        metrics={[
          { id: 'recall', name: '감지 재현율', target: '95%', actual: '96.2%', status: 'met' },
          { id: 'fp', name: '일 오탐 건수', target: '2건 이하', actual: '2건', status: 'watch' },
          { id: 'latency', name: '감지 지연 p95', target: '3초', actual: '2.4초', status: 'met' },
        ]}
        caption="실환경 검증 3일차 누적 기준"
        source="출처: 사내 검증 대시보드, 2026-08"
        foot={FOOT}
        notes="기존 위임 어휘가 read 덱에서 그대로 성립하는지 보는 페이지 — 거버닝 없이 제목+표로 완결."
      />
      <ContentSlide
        preset="briefing"
        eyebrow="업무 현황 상세"
        title="반사광 오탐 분석"
        foot={FOOT}
        notes="상세 페이지 골격(파일럿 3호): 경과 리스트 + 본문 곁 증거."
      >
        <div style={{ display: 'grid', gap: 'var(--space-5)', height: '100%', minHeight: 0, gridTemplateRows: 'auto minmax(0, 1fr)' }}>
          <TopicList
            style={{ gap: 'var(--space-4)' }}
            items={[
              {
                topic: '오탐 2건 모두 저녁 시간대 유리문 반사광',
                details: [
                  '반사된 인영이 쓰러짐 자세로 오인식 — 신뢰도 0.62·0.58',
                  '반사면 마스킹 + 신뢰도 하한 0.7 상향으로 재검증 예정',
                ],
              },
            ]}
          />
          <ExhibitRow
            exhibits={[
              { src: photo, caption: '오탐 프레임 — 유리문 반사 (18:42)' },
              { src: photo, caption: '동일 지점 마스킹 적용 후' },
            ]}
          />
        </div>
      </ContentSlide>
      <ContentSlide
        preset="briefing"
        eyebrow="업무 계획"
        title="향후 업무 계획"
        foot={FOOT}
        notes="3주 축 계획 — 스팬이 제각각이라 시간 격자가 실제 정보를 나른다: 축 안에서 끝나는 둥근 캡, 중간 시작, 계속 화살촉."
      >
        <WeekSpanRows
          label="향후 업무 계획"
          weeks={WEEKS}
          rows={[
            { name: '화재 검출', work: '데이터셋 라벨링 및 1차 학습', from: 0, to: 2, continues: true },
            { name: '쓰러짐 검출', work: '반사광 보완 재검증 및 종료', from: 0, to: 1, continues: false },
            { name: '대덕특구 데모', work: '현장 설치 및 리허설 준비', from: 1, to: 2, continues: true },
          ]}
        />
      </ContentSlide>
    </DeckViewer>
  ),
};
