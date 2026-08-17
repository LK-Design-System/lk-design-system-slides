import React from 'react';
import { ExhibitRow } from '../src/index.js';
import photo from './decks/assets/site-photo-placeholder.svg';

const meta = {
  title: 'Editorial/Exhibit Row',
  component: ExhibitRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '본문 곁의 증거 행입니다 (주간 업무현황 파일럿에서 승격). 발표 덱의 "한 장 한 전시물"과 달리 열람 페이지는 전시물을 본문 옆에 둡니다. 높이는 고정값이 아니라 잔여 높이 주도입니다 — 고정 220px 첫 시도는 캡션을 크롬 밴드에 밀어 넣었고 그 스필이 chrome-intrusion 가드를 낳았습니다. 컨테이너가 minmax(0,1fr)로 높이를 한정해 줘야 계약이 성립합니다. 캡션은 caption 단의 ellipsis 한 줄입니다.',
      },
    },
  },
};

export default meta;

const EXHIBITS = [
  { src: photo, caption: '시뮬레이션 화면 — P0002 추적 중' },
  { src: photo, caption: '동선 분석 결과 (job-efb4e2d36ca24d2b)' },
];

export const Default = {
  name: 'Exhibit Row',
  render: () => (
    // The contract needs a bounded height from the caller — on a slide this
    // is the content region's minmax(0, 1fr) row; here a fixed demo box.
    <div style={{ height: 280, display: 'grid', gridTemplateRows: 'minmax(0, 1fr)' }}>
      <ExhibitRow exhibits={EXHIBITS} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('[data-lds-exhibit-row]');
    if (!row) throw new Error('ExhibitRow must render its row root.');
    const figures = row.querySelectorAll('[data-exhibit]');
    if (figures.length !== 2) throw new Error('Every exhibit must render as a figure.');
    // 높이 주도 계약: 이미지는 자기 파일 크기가 아니라 부여받은 높이를
    // 채운다. 고정 높이 전시물은 크롬 스필의 원인이었다 (파일럿 마찰 3).
    for (const img of row.querySelectorAll('img')) {
      const style = getComputedStyle(img);
      if (img.style.height !== '100%' || style.objectFit !== 'cover') {
        throw new Error('Exhibits are remaining-height driven: height 100% + cover, never a fixed px.');
      }
    }
    const rowRect = row.getBoundingClientRect();
    const imgRect = row.querySelector('img').getBoundingClientRect();
    if (imgRect.bottom > rowRect.bottom + 1) {
      throw new Error('The exhibit must stay inside the height its container granted.');
    }
    // 캡션은 한 줄로 잘린다 — 두 줄 캡션은 산문이 되고 싶은 문단이다.
    const caption = row.querySelector('figcaption');
    const captionStyle = getComputedStyle(caption);
    if (captionStyle.whiteSpace !== 'nowrap' || captionStyle.textOverflow !== 'ellipsis') {
      throw new Error('Captions are one ellipsis line at caption rank.');
    }
  },
};
