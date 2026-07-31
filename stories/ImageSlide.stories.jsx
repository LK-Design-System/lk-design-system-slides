import React from 'react';
import { ImageSlide } from '../src/index.js';
import photo from './decks/assets/site-photo-placeholder.svg';

const meta = {
  title: 'Slides/Image Slide',
  component: ImageSlide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '사진이 콘텐츠인 슬라이드입니다. FigureSlide가 주석 달린 전시물의 자리라면, 이 판은 '
          + '이미지가 순간을 나르는 자리입니다 — 현장 사진, 제품 샷, 히어로.\n\n'
          + '이미지는 비동기라는 사실에서 세 계약이 나옵니다: `aspect`가 로드 전에 박스를 예약해 '
          + '늦게 온 사진이 슬라이드를 리플로하지 못하고(Step의 무리플로 계약을 네트워크에 대해 '
          + '지키는 것), alt 없는 사진은 캔버스에 보이는 실패로 렌더되며(앵커 미확인 선례), '
          + '`caption`/`source`가 귀속을 강제합니다 — 출처 없는 사진은 장식이고, 장식은 이 '
          + '시스템이 이미 거부한 안티패턴입니다.\n\n'
          + '덱 자산은 `stories/decks/assets/`에 두고 import합니다 — Vite가 번들해 Pages 배포에 '
          + '함께 실립니다.',
      },
    },
  },
};

export default meta;

export const Contained = {
  name: 'Image Slide',
  render: () => (
    <ImageSlide
      eyebrow="현장"
      title="물류동 증설 현장"
      governing="9월 착공분이 외장 마감 단계에 들어갔습니다."
      src={photo}
      alt="철골 골조가 선 물류동 공사 현장, 크레인이 지붕 패널을 올리는 중"
      caption="물류동 B동, 남측에서"
      source="출처: 현장 주간 보고, 2026-07"
    />
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('[data-image-slide-box]');
    const img = box.querySelector('img');

    // The box is reserved before the image arrives: the aspect ratio lives on
    // the container, not on however tall the file happens to decode.
    if (getComputedStyle(box).aspectRatio === 'auto') {
      throw new Error('The image box must reserve its space with an aspect ratio.');
    }
    if (getComputedStyle(img).objectFit !== 'cover') {
      throw new Error('The image must cover its reserved box, never size it.');
    }
    if (!img.getAttribute('alt')) throw new Error('The photograph must carry its alt text.');
    if (canvasElement.querySelector('[data-image-alt-warning]')) {
      throw new Error('A slide with alt must not show the missing-alt breach marker.');
    }
    if (!canvasElement.querySelector('[data-image-slide-source]')) {
      throw new Error('A photograph names where it came from.');
    }
  },
};

export const Bleed = {
  name: '전면 사진',
  render: () => (
    <ImageSlide
      bleed
      src={photo}
      alt="철골 골조가 선 물류동 공사 현장 전경"
      caption="물류동 B동 전경"
      source="출처: 현장 주간 보고, 2026-07"
    />
  ),
  play: async ({ canvasElement }) => {
    const surface = canvasElement.querySelector('[data-lds-slide-surface]');
    if (surface.getAttribute('data-image-bleed') !== 'true') {
      throw new Error('Bleed must be declared on the surface.');
    }
    // Full bleed: the safe area stands down and the image owns the canvas.
    if (Number.parseFloat(getComputedStyle(surface).paddingLeft) !== 0) {
      throw new Error('A bleed image removes the safe-area padding.');
    }
    const box = surface.querySelector('[data-image-slide-box]');
    const surfaceRect = surface.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    // The image sits inside the surface's 1px frame border, so the honest
    // comparison allows the border on both edges.
    if (Math.abs(boxRect.height - surfaceRect.height) > 3 || Math.abs(boxRect.width - surfaceRect.width) > 3) {
      throw new Error('A bleed image fills the whole canvas.');
    }
    // Attribution survives on a scrim — provenance does not yield to drama.
    const attribution = surface.querySelector('[data-image-slide-attribution]');
    if (!attribution || !attribution.textContent.includes('출처')) {
      throw new Error('Bleed keeps caption and source on the scrim.');
    }
  },
};

export const MissingAltIsVisible = {
  name: 'alt 없음은 보이는 실패',
  parameters: {
    docs: {
      description: {
        story:
          'alt 없는 사진은 조용히 통과하지 않습니다 — 캔버스 위에 경고가 렌더되고(앵커 미확인 '
          + '선례), 덱에서는 `check:deck-content`(img-alt)가 빌드를 세웁니다.',
      },
    },
  },
  render: () => (
    <ImageSlide
      eyebrow="현장"
      title="대체 텍스트를 잊은 판"
      governing="이 슬라이드는 계약 위반이 어떻게 보이는지 보여줍니다."
      src={photo}
      caption="물류동 B동"
      source="출처: 현장 주간 보고, 2026-07"
    />
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('[data-image-slide-box]');
    if (box.getAttribute('data-image-alt-missing') !== 'true') {
      throw new Error('A missing alt must be machine-detectable on the box.');
    }
    if (!canvasElement.querySelector('[data-image-alt-warning]')) {
      throw new Error('A missing alt must render as a visible breach, not pass as a design choice.');
    }
  },
};
