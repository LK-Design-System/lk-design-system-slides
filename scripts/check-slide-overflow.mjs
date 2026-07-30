import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { closeServer, startStaticServer } from './_storybook-static.mjs';

// Fails the build when a slide loses content off the bottom of its canvas.
//
// The canvas is a fixed logical size with `overflow: hidden`, so an over-full
// slide does not grow and does not scroll — it CLIPS, silently, and the deck
// looks fine to everyone except the room that never sees the last bullet. That
// is the one failure mode a play assertion per story will not catch, because
// each story asserts its own contract and none of them asserts "and it fits".
//
// Two things fail a run:
//   1. A slide surface whose content is taller than the canvas.
//   2. A `Fit` that hit the projection floor and still overflows — Fit absorbs
//      what scaling can absorb and reports what it cannot, and this is the
//      reader of that report.
//
// Known failures are pinned in slide-overflow-known-failures.json on the same
// ratchet terms as the play gate: an unlisted overflow fails the run, and so
// does a listed slide that now fits, so the list can only ever shrink.

const root = process.cwd();
const staticDir = path.join(root, 'storybook-static');
const knownPath = path.join(root, 'slide-overflow-known-failures.json');
const updateKnown = process.argv.includes('--update-known-failures');
const onlyArguments = process.argv.filter((argument) => argument.startsWith('--only='));
const concurrency = Math.max(1, Number(process.env.SLIDE_OVERFLOW_CONCURRENCY || 4));
const renderTimeoutMs = Number(process.env.SLIDE_OVERFLOW_TIMEOUT_MS || 30000);
// A canvas is measured in layout pixels, so a sub-pixel difference is rounding,
// not lost content. One pixel of slack keeps the gate about content, not maths.
const SLACK_PX = 1;

const requestedIds = onlyArguments.length === 0
  ? null
  : new Set(onlyArguments[0].slice('--only='.length).split(',').map((id) => id.trim()).filter(Boolean));

function storyUrl(origin, id) {
  return `${origin}/iframe.html?${new URLSearchParams({ id, viewMode: 'story' }).toString()}`;
}

async function measureStory(page, origin, id) {
  await page.goto(storyUrl(origin, id), { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForFunction(
      () => document.querySelector('[data-lds-slide-surface]') !== null,
      undefined,
      { timeout: renderTimeoutMs },
    );
  } catch {
    // A story with no slide surface (a token table, a docs-only page) is not a
    // slide and has nothing to overflow.
    return { id, surfaces: [], fits: [] };
  }
  // Fit measures on a ResizeObserver pass; give it one settle before trusting
  // the numbers, or every Fit reads as overflowing on first paint.
  await page.waitForTimeout(400);
  return page.evaluate(async ({ slack, maxAdvances, settleMs }) => {
    const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

    const measure = (position) => {
      const surfaces = [...document.querySelectorAll('[data-lds-slide-surface]')]
        // A presenter view renders the NEXT slide as an inert preview. It is a
        // copy of a slide measured in its own right, so counting it here would
        // report the same overflow twice and blame the wrong view.
        .filter((node) => !node.closest('[data-presenter-next-slide]'))
        .map((node, order) => ({
          order,
          position,
          client: node.clientHeight,
          scroll: node.scrollHeight,
          label: (node.querySelector('[data-slide-title], [data-slide-statement], [data-slide-message]')
            ?.textContent ?? '').trim().slice(0, 40),
        }))
        .filter((surface) => surface.scroll > surface.client + slack);
      const fits = [...document.querySelectorAll('[data-lds-fit][data-fit-overflow="true"]')]
        .map((node) => ({ position, scale: node.getAttribute('data-fit-scale') }));
      return { surfaces, fits };
    };

    // A deck mounts one slide at a time, so measuring what is on screen only
    // ever judges slide one — the fourteen behind it were never looked at. The
    // gate therefore drives the deck the way a presenter does, through the same
    // keyboard affordance, and measures every position it stops at. Steps are
    // spent before slides, which is why this counts positions reported by the
    // deck rather than counting key presses.
    const deck = document.querySelector('[data-lds-deck-viewer], [data-lds-presenter-view]');
    if (!deck) return measure(null);

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
    const surfaces = [];
    const fits = [];
    const visited = new Set();
    for (let advance = 0; advance < maxAdvances; advance += 1) {
      const here = slideOf();
      if (!visited.has(here)) {
        visited.add(here);
        const seen = measure(here);
        surfaces.push(...seen.surfaces);
        fits.push(...seen.fits);
      }
      const before = progressOf();
      // eslint-disable-next-line no-await-in-loop
      await press('ArrowRight');
      // The deck clamps at the end rather than wrapping, so a press that
      // changes nothing means there is nothing left to measure.
      if (progressOf() === before) break;
    }
    return { surfaces, fits, visited: visited.size };
  }, { slack: SLACK_PX, maxAdvances: 400, settleMs: 90 }).then((result) => ({ id, ...result }));
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
    // Storybook resolves `!test` by REMOVING `test` from the index rather
    // than writing `!test`, so the opt-out is the absence of `test`.
    .filter((entry) => (entry.tags || []).includes('test'))
    .filter((entry) => requestedIds === null || requestedIds.has(entry.id))
    .map((entry) => entry.id)
    .sort();
  if (stories.length === 0) throw new Error('No stories to measure. Was storybook-static built?');

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
          results.push(await measureStory(page, origin, id));
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
    .filter((result) => result.surfaces.length > 0 || result.fits.length > 0)
    .sort((a, b) => a.id.localeCompare(b.id));

  const describe = (result) => {
    const lines = result.surfaces.map((surface) => {
      const where = surface.label ? ` ("${surface.label}")` : '';
      const at = surface.position ? `slide ${surface.position}` : `slide ${surface.order + 1}`;
      return `    ${at}${where}: ${surface.scroll}px of content in a ${surface.client}px canvas`
        + ` — ${surface.scroll - surface.client}px clipped`;
    });
    for (const fit of result.fits) {
      const at = fit.position ? ` at slide ${fit.position}` : '';
      lines.push(`    Fit hit the projection floor (${fit.scale}×) and still overflows${at}`);
    }
    return `- ${result.id}\n${lines.join('\n')}`;
  };

  if (updateKnown) {
    await writeFile(knownPath, `${JSON.stringify({
      schemaVersion: 1,
      note: 'Stories with a slide whose content is clipped by the canvas. A ratchet: check:slide-overflow fails on any unlisted overflow, and also when a listed story starts fitting. Only ever remove entries.',
      count: offenders.length,
      failures: offenders.map((result) => ({
        id: result.id,
        clipped: result.surfaces.map((surface) => surface.scroll - surface.client),
      })),
    }, null, 2)}\n`, 'utf8');
    console.log(`Pinned ${offenders.length} known overflows in ${path.relative(root, knownPath)}.`);
    return;
  }

  const offenderIds = new Set(offenders.map((result) => result.id));
  const regressions = offenders.filter((result) => !known.has(result.id));
  const fixed = requestedIds !== null ? [] : [...known].filter((id) => !offenderIds.has(id)).sort();

  // Deck stories contribute one measurement per slide, not per story, so the
  // slide count is the number that says whether coverage is real.
  const slidesSeen = results.reduce((total, result) => total + (result.visited ?? 1), 0);
  console.log(
    `Measured ${results.length} stories (${slidesSeen} slide positions) for canvas overflow: `
    + `${results.length - offenders.length} fit, ${offenders.length} overflow `
    + `(${regressions.length} new, ${offenders.length - regressions.length} known).`
  );

  const problems = [];
  if (regressions.length > 0) {
    problems.push(
      'Slides losing content off the canvas. Cut the content, split the slide, or wrap the body in '
      + '`<Fit>`; pin deliberately with `npm run check:slide-overflow -- --update-known-failures`:\n'
      + regressions.map(describe).join('\n')
    );
  }
  if (fixed.length > 0) {
    problems.push(
      'These stories are pinned as known overflows but now fit. Remove them from '
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
