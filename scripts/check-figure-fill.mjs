/**
 * Horizontal under-fill, mechanised.
 *
 * The gates measure the VERTICAL axis everywhere — overflow (content past the
 * canvas), canvas-under-fill (painted bottom too high), chrome-intrusion
 * (painted bottom inside the chrome band). Nothing measured the horizontal
 * one, so "the exhibit fills the content width" stayed prose: it was applied
 * by hand when the rule was written, and a diagram authored before it kept a
 * fixed `width="420"` inside an ~840px box for weeks. Half the region was dead
 * space, every gate was green, and a human eye was the only guard
 * (docs/COMPLETENESS_AUDIT.md G2).
 *
 * Scope is deliberately ONE layout: FigureSlide's exhibit. That is where the
 * contract is unambiguous — a chart or diagram is handed the content width and
 * scales through its viewBox. The neighbours are exempt on their own contracts,
 * not by oversight: ImageSlide (contained) is height-driven by design, so a
 * narrow photo is the contract working; tables and stat rows already resolve
 * their own full width through the medium policy. A gate that guessed at those
 * would spend its credibility on false positives.
 *
 * Measurement mirrors the vertical gates: PAINTED extent (text ranges and
 * replaced elements), never container boxes — a container stretches to its
 * region however little it draws, which is exactly the failure being caught.
 *
 * Threshold 0.70 of the granted width. Measured, not taste: the committed
 * corpus renders its figures at 92.5–100%, and the defect that prompted this
 * sat at ~50% (420px drawn inside an 840px body). 0.70 leaves room for an
 * exhibit whose intrinsic aspect ratio genuinely cannot fill the width while
 * still catching a fixed-width one.
 *
 * Deck stories are WALKED, one slide at a time, on the same affordance as the
 * other gates — a deck mounts one slide, so judging what is on screen would
 * judge the cover. Known failures ratchet in figure-fill-known-failures.json.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { closeServer, startStaticServer } from './_storybook-static.mjs';

const root = process.cwd();
const staticDir = path.join(root, 'storybook-static');
const knownPath = path.join(root, 'figure-fill-known-failures.json');
const updateKnown = process.argv.includes('--update-known-failures');
const reportOnly = process.argv.includes('--report');
const MINIMUM_FILL = 0.70;
const renderTimeoutMs = Number(process.env.FIGURE_FILL_TIMEOUT_MS || 8000);

function storyUrl(origin, id) {
  return `${origin}/iframe.html?${new URLSearchParams({ id, viewMode: 'story' }).toString()}`;
}

async function auditStory(page, origin, id) {
  await page.goto(storyUrl(origin, id), { waitUntil: 'domcontentloaded' });
  try {
    // Wait for the story to mount ANYTHING, not for a slide surface: most of
    // the catalogue is components, and waiting for a surface that will never
    // appear costs the full timeout per story (measured: the first cut spent
    // minutes stalling on editorial stories).
    await page.waitForFunction(
      () => (document.querySelector('#storybook-root') ?? document.body)?.children.length > 0,
      undefined,
      { timeout: renderTimeoutMs },
    );
  } catch {
    return { id, findings: [] };
  }
  // Nothing to measure unless a figure slide is on screen or a deck could walk
  // to one — the cheap check that keeps this gate proportional to its subject.
  const relevant = await page.evaluate(() => (
    document.querySelector('[data-lds-figure-slide], [data-lds-deck-viewer], [data-lds-presenter-view]') !== null
  ));
  if (!relevant) return { id, findings: [] };
  await page.waitForTimeout(250);
  return page.evaluate(async ({ maxAdvances, settleMs, minimum }) => {
    const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
    const imagesSettled = () => Promise.all([...document.images].map((img) => (
      img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; })
    )));

    // Painted horizontal extent: the leftmost and rightmost edge anything
    // actually draws. Container boxes are the wrong instrument here.
    const paintedSpan = (region) => {
      let left = null;
      let right = null;
      const walker = document.createTreeWalker(region, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      for (let node = walker.currentNode; node; node = walker.nextNode()) {
        let rect = null;
        if (node.nodeType === 1) {
          if (/^(svg|IMG|CANVAS|VIDEO)$/i.test(node.tagName)) rect = node.getBoundingClientRect();
        } else if (node.textContent.trim()) {
          const range = document.createRange();
          range.selectNodeContents(node);
          rect = range.getBoundingClientRect();
        }
        if (rect && rect.width > 0) {
          left = left === null ? rect.left : Math.min(left, rect.left);
          right = right === null ? rect.right : Math.max(right, rect.right);
        }
      }
      return left === null ? null : { left, right };
    };

    const findings = [];
    const auditSurfaces = (position) => {
      const surfaces = [...document.querySelectorAll('[data-lds-figure-slide]')]
        .filter((node) => !node.closest('[data-presenter-next-slide]'));
      for (const surface of surfaces) {
        // The exhibit's own box: AnnotatedFigure's body when the figure carries
        // annotations (the rail is a sibling and owns its own width), the
        // content region otherwise.
        const region = surface.querySelector('[data-annotated-figure-body]')
          ?? surface.querySelector('[data-slide-content]');
        if (!region) continue;
        const box = region.getBoundingClientRect();
        if (box.width <= 0) continue;
        const span = paintedSpan(region);
        if (!span) continue;
        const fill = (span.right - span.left) / box.width;
        if (fill < minimum) {
          const title = (surface.querySelector('[data-slide-title]')?.textContent ?? '(무제)').replace(/\s+/g, ' ').trim();
          findings.push({
            position: position ?? 'slide',
            title,
            fill: Math.round(fill * 1000) / 10,
          });
        }
      }
    };

    const deck = document.querySelector('[data-lds-deck-viewer], [data-lds-presenter-view]');
    if (!deck) {
      await imagesSettled();
      auditSurfaces(null);
      return { findings };
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
        auditSurfaces(here);
      }
      const before = progressOf();
      // eslint-disable-next-line no-await-in-loop
      await press('ArrowRight');
      if (progressOf() === before) break;
    }
    return { findings };
  }, { maxAdvances: 400, settleMs: 90, minimum: MINIMUM_FILL }).then((result) => ({ id, ...result }));
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
    .filter((entry) => (entry.tags || []).includes('test'))
    .map((entry) => entry.id)
    .sort();

  const known = await loadKnown();
  const results = [];
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    for (const id of stories) {
      // eslint-disable-next-line no-await-in-loop
      results.push(await auditStory(page, origin, id));
    }
  } finally {
    if (browser) await browser.close();
  }

  const offenders = results.filter((result) => result.findings.length > 0).sort((a, b) => a.id.localeCompare(b.id));
  const describe = (result) => `- ${result.id}\n`
    + result.findings.map((finding) => `    ${finding.position}: "${finding.title}" — 도판이 부여 폭의 ${finding.fill}%만 그린다 (하한 ${MINIMUM_FILL * 100}%)`).join('\n');

  if (reportOnly) {
    console.log(`Measured ${results.length} stories for figure fill; ${offenders.length} under ${MINIMUM_FILL * 100}%.`);
    if (offenders.length > 0) console.log(offenders.map(describe).join('\n'));
    return;
  }

  if (updateKnown) {
    await writeFile(knownPath, `${JSON.stringify({
      schemaVersion: 1,
      note: 'Stories whose FigureSlide exhibit draws less than 70% of its granted width. A ratchet: check:figure-fill fails on any unlisted story, and also when a listed story comes clean. Only ever remove entries.',
      count: offenders.length,
      failures: offenders.map((result) => ({ id: result.id, findings: result.findings })),
    }, null, 2)}\n`, 'utf8');
    console.log(`Pinned ${offenders.length} known figure-fill failures in ${path.relative(root, knownPath)}.`);
    return;
  }

  const offenderIds = new Set(offenders.map((result) => result.id));
  const regressions = offenders.filter((result) => !known.has(result.id));
  const fixed = [...known].filter((id) => !offenderIds.has(id)).sort();

  console.log(
    `Measured ${results.length} stories for figure horizontal fill: `
    + `${results.length - offenders.length} fill, ${offenders.length} under ${MINIMUM_FILL * 100}% `
    + `(${regressions.length} new, ${offenders.length - regressions.length} known).`,
  );

  const problems = [];
  if (regressions.length > 0) {
    problems.push(
      'Exhibits that do not fill their width. The medium hands a figure the content width and the viewBox owns the scale — a fixed width leaves dead space beside it. Fix the exhibit, or pin deliberately with `npm run check:figure-fill -- --update-known-failures`:\n'
      + regressions.map(describe).join('\n'),
    );
  }
  if (fixed.length > 0) {
    problems.push(`These pins no longer fire. Remove them from ${path.relative(root, knownPath)} so the ratchet keeps its teeth:\n- ${fixed.join('\n- ')}`);
  }
  if (problems.length > 0) {
    console.error(problems.join('\n\n'));
    process.exitCode = 1;
  }
}

const staticServer = await startStaticServer(staticDir);
try {
  await main(staticServer.origin);
} finally {
  await closeServer(staticServer.server);
}
// The server keeps the loop alive on some Node versions; exit on the code main set.
process.exit(process.exitCode ?? 0);
