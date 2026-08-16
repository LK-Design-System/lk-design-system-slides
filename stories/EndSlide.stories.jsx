import React from 'react';
import { EndSlide } from '../src/index.js';

const meta = {
  title: 'Slides/End Slide',
  component: EndSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '막지입니다. Q&A 동안 화면에 남는 슬라이드라서 작별 인사보다 잔상을 계약으로 삼습니다 — 벽에 남길 한 줄(`message`)과 후속 연락처(`contact`)까지, 그 이상은 싣지 않습니다.',
      },
    },
  },
};

export default meta;

export const Default = {
  name: 'End Slide',
  render: () => (
    <EndSlide
      message="지연 민감 테이블부터, 3분기에 시작합니다."
      contact="jinhyuk2me@gmail.com · LK Robotics 플랫폼팀"
    />
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-end-slide]');
    const message = canvasElement.querySelector('[data-slide-message]');
    const contact = canvasElement.querySelector('[data-slide-contact]');
    if (!surface || !message) throw new Error('EndSlide must render its message region.');
    // A takeaway sentence rides display; only a short residue ("감사합니다")
    // rides hero (sparseScale.js). Declared tier and rendered size must agree.
    const scale = message.getAttribute('data-slide-scale');
    if (scale !== 'display') {
      throw new Error(`A sentence-length message stays at display scale; declared "${scale}".`);
    }
    const probe = document.createElement('span');
    probe.style.fontSize = `var(--slides-${scale}-size)`;
    surface.append(probe);
    const expected = parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    if (parseFloat(getComputedStyle(message).fontSize) !== expected) {
      throw new Error('The closing message must render at its declared scale — it stays up through Q&A.');
    }
    if (!contact) throw new Error('When given, contact must render as the fine-print region.');
    if (!(message.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      throw new Error('The message leads; contact follows as fine print.');
    }
    const captionSize = parseFloat(
      getComputedStyle(surface).getPropertyValue('--slides-caption-size')
    );
    if (parseFloat(getComputedStyle(contact).fontSize) !== captionSize) {
      throw new Error('Contact reads at caption scale — follow-up detail, not a second message.');
    }
  },
};
