import React from 'react';
import { ContentSlide, DeckViewer, Step } from '../src/index.js';

const meta = {
  title: 'Slides/Step',
  component: Step,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '발표자 신호에 맞춰 도착하는 콘텐츠입니다. 덱이 카운터를 소유하고 ← →를 슬라이드보다 '
          + '단계에 먼저 씁니다. 핵심 계약은 **공개가 리플로를 일으키지 않는다**는 것 — 대기 중인 '
          + '단계도 자기 자리를 유지하므로 구성은 처음부터 최종 상태이고, 청중이 글자가 밀리는 걸 '
          + '보지 않습니다. 덱 밖에서는 전부 공개된 상태로 렌더됩니다.',
      },
    },
  },
};

export default meta;

const press = async (deck, key) => {
  deck.focus();
  deck.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  await new Promise((resolve) => { setTimeout(resolve, 0); });
};

const findings = ['수집 지연 p95 41분', '적재 큐 대기 28분', '변환 단계 3분'];

export const InADeck = {
  name: '덱 안에서',
  render: () => (
    <DeckViewer label="단계 공개 데모">
      <ContentSlide eyebrow="현황" title="지연은 어디서 생기나">
        <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
          {findings.map((finding, order) => (
            <Step key={finding} at={order + 1} as="li">
              {finding}
            </Step>
          ))}
        </ul>
      </ContentSlide>
      <ContentSlide eyebrow="결론" title="적재가 병목">
        <p style={{ margin: 0 }}>단계가 없는 슬라이드는 한 번에 넘어갑니다.</p>
      </ContentSlide>
    </DeckViewer>
  ),
  play: async ({ canvasElement }) => {
    const deck = canvasElement.querySelector('[data-lds-deck-viewer]');
    const steps = () => [...canvasElement.querySelectorAll('[data-lds-step]')];
    const revealed = () => steps().filter((s) => s.getAttribute('data-step-state') === 'revealed');
    const progress = () => canvasElement.querySelector('[data-deck-progress]').textContent;

    if (steps().length !== findings.length) throw new Error('Every step must mount with the slide.');
    if (revealed().length !== 0) throw new Error('A slide opens with none of its steps revealed.');
    if (progress() !== `1 / 2 · 0 / ${findings.length}`) {
      throw new Error(`The counter must report slide and step; got "${progress()}".`);
    }

    // Reveal must not reflow: the layout is final before the first cue.
    const boxesBefore = steps().map((s) => s.getBoundingClientRect().top);
    await press(deck, 'ArrowRight');
    if (revealed().length !== 1) throw new Error('ArrowRight must spend the first cue on a step.');
    const boxesAfter = steps().map((s) => s.getBoundingClientRect().top);
    if (boxesBefore.some((top, i) => Math.abs(top - boxesAfter[i]) > 0.5)) {
      throw new Error('Revealing a step must not move anything — pending steps keep their box.');
    }

    // Steps come before slides: the deck stays put until they are spent.
    await press(deck, 'ArrowRight');
    await press(deck, 'ArrowRight');
    if (revealed().length !== findings.length || !progress().startsWith('1 / 2')) {
      throw new Error('The deck must not advance while the slide still has cues left.');
    }

    await press(deck, 'ArrowRight');
    if (!progress().startsWith('2 / 2')) {
      throw new Error('Once the cues are spent, the next press advances the slide.');
    }

    // Stepping back arrives at the previous slide's end — the room already
    // saw those reveals, so replaying them would be a lie about progress.
    await press(deck, 'ArrowLeft');
    if (progress() !== `1 / 2 · ${findings.length} / ${findings.length}`) {
      throw new Error(`Going back must enter the previous slide fully revealed; got "${progress()}".`);
    }
  },
};

export const OutsideADeck = {
  name: '덱 밖에서',
  render: () => (
    <ContentSlide eyebrow="현황" title="카탈로그에서는 전부 보인다">
      <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: 'var(--space-3)' }}>
        {findings.map((finding, order) => (
          <Step key={finding} at={order + 1} as="li">
            {finding}
          </Step>
        ))}
      </ul>
    </ContentSlide>
  ),
  play: async ({ canvasElement }) => {
    const steps = [...canvasElement.querySelectorAll('[data-lds-step]')];
    if (steps.length !== findings.length) throw new Error('The story must render every step.');
    const pending = steps.filter((s) => s.getAttribute('data-step-state') !== 'revealed');
    if (pending.length > 0) {
      throw new Error('With no deck counting, a slide must show all of its content, not an empty canvas.');
    }
  },
};
