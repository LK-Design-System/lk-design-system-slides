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
    const issues = [];
    let statements = 0;

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
          '[data-stat-slide-source], [data-figure-slide-source], [data-compare-slide-source], '
          + '[data-roadmap-slide-source], [data-assessment-slide-source]',
        );
        if (!source || clean(source.textContent).length === 0) {
          const title = clean(surface.querySelector('[data-slide-title]')?.textContent ?? '(무제)');
          flag('source-required', `"${title}" — 데이터를 보였으면 출처를 채운다`);
        }
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
      surfacesNow().forEach((surface) => auditSurface(surface, null));
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
        surfacesNow().forEach((surface) => auditSurface(surface, here));
      }
      const before = progressOf();
      // eslint-disable-next-line no-await-in-loop
      await press('ArrowRight');
      if (progressOf() === before) break;
    }
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
