import React from 'react';
import { TitleSlide } from '../src/index.js';

const meta = {
  title: 'Slides/Title Slide',
  component: TitleSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '덱을 여는 레이아웃입니다. 아이브로·디스플레이 타이틀·서브타이틀 슬롯을 소유하고, 투사 스케일로 원거리 가독성을 지킵니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'Title Slide',
  render: () => (
    <TitleSlide
      eyebrow="LK ROBOTICS · DESIGN SYSTEM"
      title="LK Design System"
      subtitle="정밀하고, 차분하고, 산업적인 — 로봇 운영 도메인을 위한 디자인 시스템"
    />
  ),
  play: async ({ canvasElement }) => {
    const title = canvasElement.querySelector('[data-slide-title]');
    const eyebrow = canvasElement.querySelector('[data-slide-eyebrow]');
    if (!title || !eyebrow) throw new Error('TitleSlide must render its eyebrow and title slots.');
    if (!(eyebrow.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      throw new Error('The eyebrow must precede the title in reading order.');
    }
    const titleSize = parseFloat(getComputedStyle(title).fontSize);
    const bodySize = parseFloat(getComputedStyle(canvasElement.querySelector('[data-slide-subtitle]')).fontSize);
    if (titleSize <= bodySize * 2) {
      throw new Error('The display title must use the projection scale, clearly above body size.');
    }
  },
};
