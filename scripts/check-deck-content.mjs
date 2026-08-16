import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { closeServer, startStaticServer } from './_storybook-static.mjs';

// Content discipline, mechanised — the layer of content-rules.md a machine can
// hold. The ghost-deck test (does the governing chain argue?) and layout-fit
// judgement stay with a reviewer (qa/rubric.md); everything below is a rule
// with a number, and every number carries its source:
//
//   title-noun-final   Titles are noun-ended labels; the sentence lives in
//                      `governing`. (한국 장표 규약; enforced repo-wide since the
//                      Editorial worked examples.)
//   governing-required A content slide with no claim is a slide with no reason.
//                      (content-rules.md §2; Alley's assertion-evidence: every
//                      body slide opens with a sentence-assertion headline.)
//   governing-shape    One sentence, ≤55 chars. Alley pins the assertion at
//                      8–14 words / max two lines (Garner & Alley 2013 measured
//                      comprehension gains); 8–14 English words lands at roughly
//                      25–50 Korean characters, and the largest honest governing
//                      in this repository is 49.
//   bullet-count       >7 bullets on one slide. (tahta lint.mjs MANY_BULLETS=7:
//                      "split it or show the structure"; content-rules.md calls
//                      5+ a warning sign — 7 is where warning becomes failure.)
//   body-cap           Prose body >140 chars. (academic-pptx-skill: ~40 words;
//                      content-rules.md: ~120 Korean chars; 140 leaves slack for
//                      punctuation the way tahta's LONG_BULLET=140 does.)
//                      Delegation slides are exempt — a comparison table's
//                      density is the exhibit, not prose.
//   statement-budget   >2 StatementSlides per deck. (content-rules.md: "덱에
//                      한두 번이 한계다. 남발하면 무게가 죽는다.")
//   source-required    A delegation slide (Stat/Figure/Compare/Roadmap/
//                      Assessment) with no source line. (content-rules.md §3:
//                      빌린 데이터·도판마다 source; every exhibit here shows data.)
//   end-residue        An EndSlide message opening with thanks. (content-rules
//                      §6: what stays on screen through Q&A is the argument's
//                      residue — "감사합니다"로 끝나는 덱은 마지막 10분을 빈
//                      화면에 버리는 것과 같다.)
//   roadmap-flat-dates A RoadmapSlide whose dated phases all share one date.
//                      A timeline's value is its time axis; when every phase
//                      reads "2026 Q4" the axis carries nothing and the content
//                      is a dependency graph wearing a schedule's clothes.
//                      (Found by the first qa harness critique, 2026-07-31: an
//                      agent-authored deck passed every gate with a roadmap
//                      whose three phases shared one date.)
//   img-alt            An image with no text channel. ImageSlide renders its
//                      own visible breach marker (data-image-alt-missing); a
//                      raw <img> missing the alt attribute entirely is the
//                      same breach unmarked. alt="" on a raw img is an
//                      explicit decorative declaration and passes.
//   img-unsized        A raw <img> with no reserved box (width+height attrs,
//                      CSS aspect-ratio, or a fixed height). Images decode
//                      after layout, so an unsized one reflows the slide when
//                      it arrives — the reveal no-reflow contract, broken by
//                      the network instead of the presenter. ImageSlide
//                      reserves its box by construction and is exempt.
//   canvas-under-fill  Three or more content slides whose PAINTED content ends
//                      above half the canvas. The overflow gate catches spill,
//                      never sparseness, and the defect survived one round of
//                      prose guidance — both harness critiques flagged decks
//                      whose bodies stopped at 45–50% while every gate stayed
//                      green, which is what promoted this from rubric to rule.
//                      Thresholds from measurement, not taste: the flagged
//                      slides sat at 45–50%, the two committed decks span
//                      0.46–0.89 with at most ONE slide under 0.5 each, and the
//                      failing agent deck had four. So one sparse slide is a
//                      breathing beat, three are a pattern. Painted content
//                      means text ranges and replaced elements — a flex
//                      container stretches to the safe area and reads ~0.86
//                      regardless of how empty the slide looks, so container
//                      boxes are exactly the wrong thing to measure. The
//                      footer is excluded (out-of-flow chrome), and layouts
//                      without a content region (Title/Section/Statement/End)
//                      are exempt: their whitespace is the design.
//
// Scope: stories under Decks/ only. Component stories demonstrate contracts —
// sometimes by violating them on purpose — so the discipline binds the decks,
// not the catalogue.
//
// Deck stories are WALKED (same affordance as check-slide-overflow): one slide
// is mounted at a time, so judging what is on screen would judge the cover.
//
// Known failures are pinned in deck-content-known-failures.json on the same
// ratchet terms as the other gates.

const root = process.cwd();
const staticDir = path.join(root, 'storybook-static');
const knownPath = path.join(root, 'deck-content-known-failures.json');
const updateKnown = process.argv.includes('--update-known-failures');
const onlyArguments = process.argv.filter((argument) => argument.startsWith('--only='));
const concurrency = Math.max(1, Number(process.env.DECK_CONTENT_CONCURRENCY || 4));
const renderTimeoutMs = Number(process.env.DECK_CONTENT_TIMEOUT_MS || 30000);

const requestedIds = onlyArguments.length === 0
  ? null
  : new Set(onlyArguments[0].slice('--only='.length).split(',').map((id) => id.trim()).filter(Boolean));

function storyUrl(origin, id) {
  return `${origin}/iframe.html?${new URLSearchParams({ id, viewMode: 'story' }).toString()}`;
}

async function auditStory(page, origin, id) {
  await page.goto(storyUrl(origin, id), { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForFunction(
      () => document.querySelector('[data-lds-slide-surface]') !== null,
      undefined,
      { timeout: renderTimeoutMs },
    );
  } catch {
    return { id, issues: [], visited: 0 };
  }
  await page.waitForTimeout(300);
  return page.evaluate(async ({ maxAdvances, settleMs }) => {
    const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
    const clean = (text) => (text ?? '').replace(/\s+/g, ' ').trim();
    // Images decode after layout; auditing before they settle judges a slide
    // that does not exist yet. Await every current <img> before each look.
    const imagesSettled = () => Promise.all([...document.images].map((img) => (
      img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; })
    )));
    const issues = [];
    let statements = 0;
    const underFilled = [];

    // How far the slide's PAINTED content reaches down the canvas: text via
    // Range boxes, replaced elements via their own. Container boxes lie —
    // a flex:1 region stretches to the safe area however empty it is.
    const paintedFill = (surface) => {
      const surfaceRect = surface.getBoundingClientRect();
      let bottom = null;
      const walker = document.createTreeWalker(surface, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      for (let node = walker.currentNode; node; node = walker.nextNode()) {
        if (node.nodeType === 1) {
          if (node.closest('[data-slide-foot]')) continue;
          if (/^(svg|IMG|CANVAS|VIDEO)$/i.test(node.tagName)) {
            const rect = node.getBoundingClientRect();
            if (rect.height > 0) bottom = Math.max(bottom ?? -Infinity, rect.bottom);
          }
          continue;
        }
        if (!node.textContent.trim() || node.parentElement?.closest('[data-slide-foot]')) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rect = range.getBoundingClientRect();
        if (rect.height > 0) bottom = Math.max(bottom ?? -Infinity, rect.bottom);
      }
      return bottom === null ? 0 : (bottom - surfaceRect.top) / surfaceRect.height;
    };

    const auditSurface = (surface, position) => {
      const at = position ? `slide ${position}` : 'slide';
      const flag = (rule, detail) => issues.push({ rule, position: at, detail });

      // title-noun-final — a title ending in a Korean predicate is a sentence
      // wearing a label's clothes; the sentence belongs in governing.
      for (const node of surface.querySelectorAll('[data-slide-title]')) {
        const title = clean(node.textContent);
        if (/(?:[다요])\s*[.!?]?$/.test(title)) {
          flag('title-noun-final', `"${title}" — 명사형으로 닫아야 한다`);
        }
      }

      const statement = surface.querySelector('[data-slide-statement]');
      if (statement) statements += 1;

      // A delegation slide's marker lands on the surface itself (spread through
      // ContentSlide) or on the exhibit inside it (CodeSlide's figure).
      const delegation = ['data-lds-stat-slide', 'data-lds-figure-slide', 'data-lds-compare-slide',
        'data-lds-roadmap-slide', 'data-lds-assessment-slide', 'data-lds-code']
        .some((marker) => surface.hasAttribute(marker) || surface.querySelector(`[${marker}]`) !== null);

      const content = surface.querySelector('[data-slide-content]');
      const governing = surface.querySelector('[data-slide-governing]');
      const isStructural = surface.querySelector(
        '[data-slide-agenda], [data-slide-message], [data-slide-subtitle]',
      ) !== null && !content;

      // governing-required — a content slide with no claim has no reason to
      // exist. Structural slides (표지·목차·간지·막지) and statements are exempt.
      const carriesContent = (content && clean(content.textContent).length > 0) || delegation;
      if (carriesContent && !statement && !isStructural && !governing) {
        const title = clean(surface.querySelector('[data-slide-title]')?.textContent ?? '(무제)');
        flag('governing-required', `"${title}" — 주장이 없는 콘텐츠 슬라이드`);
      }

      // governing-shape — one sentence, bounded. Multiple terminators inside
      // the text mean two claims, and two claims mean two slides.
      if (governing) {
        const text = clean(governing.textContent);
        const terminators = (text.match(/[.!?](?=\s|$)/g) ?? []).length;
        if (terminators > 1) flag('governing-shape', `"${text.slice(0, 40)}…" — 문장이 둘이면 슬라이드가 둘`);
        if (text.length > 55) flag('governing-shape', `${text.length}자 — 상한 55자 (Alley 8–14 단어)`);
      }

      // canvas-under-fill — counted per slide here, judged per deck below:
      // one sparse slide is a breathing beat, three are a pattern.
      if (content) {
        const fill = paintedFill(surface);
        if (fill < 0.5) {
          const title = clean(surface.querySelector('[data-slide-title]')?.textContent ?? '(무제)');
          underFilled.push(`${at} "${title}" (${Math.round(fill * 100)}%)`);
        }
      }

      if (!delegation && content) {
        // bullet-count — past seven the list is a structure pretending to be
        // prose; show it as a diagram, a table, or two slides.
        const bullets = content.querySelectorAll('li');
        if (bullets.length > 7) flag('bullet-count', `불릿 ${bullets.length}개 — 상한 7 (tahta MANY_BULLETS)`);

        // body-cap — prose beyond ~140 chars is a document, not a slide.
        const body = clean(content.textContent);
        if (body.length > 140) flag('body-cap', `본문 ${body.length}자 — 상한 140자 (~40단어)`);
      }

      // source-required — every delegation exhibit shows data, and shown data
      // names where it came from.
      if (delegation && !surface.querySelector('[data-lds-code]')) {
        const source = surface.querySelector(
          '[data-slide-source]',
        );
        if (!source || clean(source.textContent).length === 0) {
          const title = clean(surface.querySelector('[data-slide-title]')?.textContent ?? '(무제)');
          flag('source-required', `"${title}" — 데이터를 보였으면 출처를 채운다`);
        }
      }

      // img-alt — a photograph the audience is asked to read is content, and
      // content has a text channel (Editorial: graphics are the secondary
      // channel). ImageSlide reports its own breach via data-image-alt-missing;
      // a raw <img> with no alt attribute at all is the same breach unmarked.
      // alt="" on a raw img is an explicit decorative declaration and passes.
      for (const box of surface.querySelectorAll('[data-image-alt-missing="true"]')) {
        void box;
        flag('img-alt', 'ImageSlide에 alt가 없다 — 사진이 말하는 바를 텍스트로');
      }
      for (const img of surface.querySelectorAll('img')) {
        if (img.closest('[data-image-slide-box]')) continue;
        if (!img.hasAttribute('alt')) flag('img-alt', `raw <img>에 alt 속성 자체가 없다 (src: ${(img.getAttribute('src') ?? '').slice(0, 40)})`);
      }

      // img-unsized — an image without a reserved box reflows the slide when
      // it decodes, which breaks the same no-reflow contract Step holds for
      // reveals. ImageSlide reserves via aspect-ratio; a raw img needs
      // width+height attributes or a CSS aspect-ratio of its own.
      for (const img of surface.querySelectorAll('img')) {
        if (img.closest('[data-image-slide-box]')) continue;
        // The question is whether the AUTHOR reserved the box, not whether the
        // browser found a size — computed height on a replaced element reports
        // the used pixels after decode, which is exactly the reservation that
        // does not exist before it. Declared reservations only: width+height
        // attributes, an aspect-ratio, or an explicit height.
        const sized = (img.hasAttribute('width') && img.hasAttribute('height'))
          || getComputedStyle(img).aspectRatio !== 'auto'
          || img.style.height !== ''
          || img.style.aspectRatio !== '';
        if (!sized) flag('img-unsized', `크기 없는 <img> — 로드 순간 리플로한다 (src: ${(img.getAttribute('src') ?? '').slice(0, 40)})`);
      }

      // roadmap-flat-dates — dated phases surface as <time> elements through
      // Editorial's NarrativeTimeline; two or more of them all reading the same
      // date means the time axis carries no information.
      if (surface.hasAttribute('data-lds-roadmap-slide') || surface.querySelector('[data-lds-roadmap-slide]')) {
        const dates = [...surface.querySelectorAll('time')].map((node) => clean(node.textContent)).filter(Boolean);
        if (dates.length >= 2 && new Set(dates).size === 1) {
          flag('roadmap-flat-dates', `phase ${dates.length}개가 전부 "${dates[0]}" — 시간축이 정보를 나르지 않으면 일정이 아니라 의존 관계다`);
        }
      }

      // end-residue — the last slide holds the screen through Q&A; spend it on
      // the argument, not on gratitude.
      const message = surface.querySelector('[data-slide-message]');
      if (message && /^(감사|고맙|Thank)/i.test(clean(message.textContent))) {
        flag('end-residue', `"${clean(message.textContent)}" — 막지는 잔향(주장/행동)을 담는다`);
      }
    };

    const deck = document.querySelector('[data-lds-deck-viewer], [data-lds-presenter-view]');
    const surfacesNow = () => [...document.querySelectorAll('[data-lds-slide-surface]')]
      .filter((node) => !node.closest('[data-presenter-next-slide]'));

    if (!deck) {
      await imagesSettled();
      surfacesNow().forEach((surface) => auditSurface(surface, null));
      if (underFilled.length >= 3) issues.push({ rule: 'canvas-under-fill', position: 'deck', detail: `절반도 못 채운 콘텐츠 슬라이드 ${underFilled.length}장 — ${underFilled.join(', ')} — 병합하거나 더 찬 레이아웃으로` });
    if (statements > 2) issues.push({ rule: 'statement-budget', position: 'deck', detail: `StatementSlide ${statements}장 — 한두 번이 한계` });
      return { issues, visited: surfacesNow().length };
    }

    const progressOf = () => (
      document.querySelector('[data-deck-progress], [data-presenter-progress]')?.textContent ?? ''
    ).trim();
    const slideOf = () => progressOf().split('·')[0].trim();
    const press = async (key) => {
      deck.focus();
      deck.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      await wait(settleMs);
    };

    await press('Home');
    const visited = new Set();
    for (let advance = 0; advance < maxAdvances; advance += 1) {
      const here = slideOf();
      if (!visited.has(here)) {
        visited.add(here);
        await imagesSettled();
        surfacesNow().forEach((surface) => auditSurface(surface, here));
      }
      const before = progressOf();
      // eslint-disable-next-line no-await-in-loop
      await press('ArrowRight');
      if (progressOf() === before) break;
    }
    if (underFilled.length >= 3) issues.push({ rule: 'canvas-under-fill', position: 'deck', detail: `절반도 못 채운 콘텐츠 슬라이드 ${underFilled.length}장 — ${underFilled.join(', ')} — 병합하거나 더 찬 레이아웃으로` });
    if (statements > 2) issues.push({ rule: 'statement-budget', position: 'deck', detail: `StatementSlide ${statements}장 — 한두 번이 한계` });
    return { issues, visited: visited.size };
  }, { maxAdvances: 400, settleMs: 90 }).then((result) => ({ id, ...result }));
}

async function loadKnown() {
  try {
    const parsed = JSON.parse(await readFile(knownPath, 'utf8'));
    return new Set(parsed.failures.map((failure) => failure.id));
  } catch (error) {
    if (error.code === 'ENOENT') return new Set();
    throw error;
  }
}

async function main(origin) {
  const index = JSON.parse(await readFile(path.join(staticDir, 'index.json'), 'utf8'));
  const stories = Object.values(index.entries)
    .filter((entry) => entry.type === 'story')
    // The discipline binds decks; component stories may violate on purpose.
    .filter((entry) => entry.id.startsWith('decks-'))
    .filter((entry) => (entry.tags || []).includes('test'))
    .filter((entry) => requestedIds === null || requestedIds.has(entry.id))
    .map((entry) => entry.id)
    .sort();
  if (stories.length === 0) {
    console.log('No deck stories to audit.');
    return;
  }

  const known = await loadKnown();
  const results = [];
  let browser;
  try {
    browser = await chromium.launch();
    const queue = [...stories];
    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      try {
        for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
          results.push(await auditStory(page, origin, id));
        }
      } finally {
        await page.close();
      }
    });
    await Promise.all(workers);
  } finally {
    if (browser) await browser.close();
  }

  const offenders = results
    .filter((result) => result.issues.length > 0)
    .sort((a, b) => a.id.localeCompare(b.id));
  const describe = (result) => `- ${result.id}\n`
    + result.issues.map((issue) => `    [${issue.rule}] ${issue.position}: ${issue.detail}`).join('\n');

  if (updateKnown) {
    await writeFile(knownPath, `${JSON.stringify({
      schemaVersion: 1,
      note: 'Deck stories with content-discipline violations. A ratchet: check:deck-content fails on any unlisted violation, and also when a listed deck comes clean. Only ever remove entries.',
      count: offenders.length,
      failures: offenders.map((result) => ({
        id: result.id,
        rules: [...new Set(result.issues.map((issue) => issue.rule))],
      })),
    }, null, 2)}\n`, 'utf8');
    console.log(`Pinned ${offenders.length} known content violations in ${path.relative(root, knownPath)}.`);
    return;
  }

  const offenderIds = new Set(offenders.map((result) => result.id));
  const regressions = offenders.filter((result) => !known.has(result.id));
  const fixed = requestedIds !== null ? [] : [...known].filter((id) => !offenderIds.has(id)).sort();
  const slidesSeen = results.reduce((total, result) => total + result.visited, 0);

  console.log(
    `Audited ${results.length} deck stories (${slidesSeen} slide positions) for content discipline: `
    + `${results.length - offenders.length} clean, ${offenders.length} in violation `
    + `(${regressions.length} new, ${offenders.length - regressions.length} known).`
  );

  const problems = [];
  if (regressions.length > 0) {
    problems.push(
      'Decks breaking content discipline. Fix the content (the rules and their sources are at the '
      + 'top of this script), or pin deliberately with `npm run check:deck-content -- --update-known-failures`:\n'
      + regressions.map(describe).join('\n')
    );
  }
  if (fixed.length > 0) {
    problems.push(
      'These decks are pinned as known violations but now pass. Remove them from '
      + `${path.relative(root, knownPath)} so the ratchet keeps its teeth:\n`
      + fixed.map((id) => `- ${id}`).join('\n')
    );
  }
  if (problems.length > 0) throw new Error(problems.join('\n\n'));
}

const staticServer = await startStaticServer(staticDir);
try {
  await main(staticServer.origin);
} catch (error) {
  console.error(error.message ?? error);
  process.exitCode = 1;
} finally {
  await closeServer(staticServer.server);
}
