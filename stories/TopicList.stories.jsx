import React from 'react';
import { TopicList } from '../src/index.js';

const meta = {
  title: 'Editorial/Topic List',
  component: TopicList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '열람 페이지의 2단계 리스트입니다 (주간 업무현황 파일럿에서 승격). 대항목은 note 단·semibold·strong, 세부는 한 단 아래 note-body·regular·neutral로 내려가고, 들여쓰기는 표의 셀 패딩을 재사용해 리스트와 표가 왼쪽 리듬을 공유합니다. 2단계가 계약입니다 — 더 깊은 위계는 들여쓰기가 아니라 표나 페이지 분할의 몫입니다.',
      },
    },
  },
};

export default meta;

const ITEMS = [
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
];

export const Default = {
  name: 'Topic List',
  render: () => <TopicList items={ITEMS} />,
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('[data-lds-topic-list]');
    if (!list) throw new Error('TopicList must render its list root.');
    const topics = list.querySelectorAll('[data-topic]');
    if (topics.length !== 2) throw new Error('Every item must render as a topic.');
    // 두 단의 위계는 크기와 무게가 함께 나른다: 세부는 대항목보다 한 단
    // 작게, 대항목은 semibold 이상.
    const topicSize = parseFloat(getComputedStyle(topics[0]).fontSize);
    const details = list.querySelector('[data-topic-details] li');
    if (!details) throw new Error('Details must render under their topic.');
    const detailSize = parseFloat(getComputedStyle(details).fontSize);
    if (!(detailSize < topicSize)) {
      throw new Error('Details must read one rank below their topic.');
    }
    if (parseInt(getComputedStyle(topics[0]).fontWeight, 10) < 600) {
      throw new Error('Topics carry the weight; details stay regular.');
    }
    // 들여쓰기는 표의 inline 패딩과 같은 값 — 리스트와 표가 왼쪽 리듬을
    // 공유한다는 계약의 실측.
    const detailsList = list.querySelector('[data-topic-details]');
    const pad = getComputedStyle(detailsList).paddingLeft;
    const probe = document.createElement('div');
    probe.style.paddingLeft = 'var(--editorial-cell-pad-inline)';
    canvasElement.append(probe);
    const expected = getComputedStyle(probe).paddingLeft;
    probe.remove();
    if (pad !== expected) {
      throw new Error(`Details indent by the table's inline pad (${expected}); got ${pad}.`);
    }
    // 2단계가 계약이다 — 세부 안의 또 다른 리스트는 위계가 아니라 구조이고,
    // 구조는 표나 페이지 분할로 간다.
    if (list.querySelector('[data-topic-details] ul, [data-topic-details] ol')) {
      throw new Error('Two levels is the contract — a third level belongs to a table or another page.');
    }
  },
};
