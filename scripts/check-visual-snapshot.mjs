/**
 * Visual regression, the cheap net.
 *
 * The measuring gates each know what they are looking for — overflow, chrome
 * intrusion, figure fill. A snapshot knows nothing and therefore catches the
 * rest: an arrowhead that lost its flare, a seam where two shapes meet, a rank
 * that quietly moved. This session found all three of those with a human eye
 * only (docs/COMPLETENESS_AUDIT.md G2), which is the argument for the net.
 *
 * What it is NOT: a judgement. A baseline blesses whatever was committed, so a
 * slide that was already wrong stays green until someone looks. That is why
 * this lands alongside check:figure-fill rather than instead of it — a
 * measuring gate says "this is wrong", a snapshot says "this changed".
 *
 * Subjects are the layouts whose composition carries a contract, one story
 * each, plus one page from each real deck genre. Adding more is cheap; the
 * cost is on the update side, so the list stays at the layouts a change would
 * actually disturb.
 *
 * Comparison follows the sibling repo's settled approach (pixelmatch,
 * threshold 0.1, includeAA false): text antialiasing differs across platforms
 * even when glyphs are identical, so an exact-byte compare would make the
 * ratchet fail on a different OS. `--update` rewrites the baselines; review
 * the diff images under .visual-diff/ before you do.
 */
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { closeServer, startStaticServer } from './_storybook-static.mjs';

const root = process.cwd();
const staticDir = path.join(root, 'storybook-static');
const baselineDir = path.join(root, 'visual-baseline');
const diffDir = path.join(root, '.visual-diff');
const update = process.argv.includes('--update');

// Composition-bearing layouts + one page per deck genre. `advance` walks a deck
// story to the page that carries the subject.
const SUBJECTS = [
  { name: 'title-slide', id: 'slides-title-slide--default' },
  { name: 'content-slide', id: 'slides-content-slide--default' },
  { name: 'split-slide', id: 'slides-split-slide--comparison' },
  { name: 'statement-slide', id: 'slides-statement-slide--default' },
  { name: 'stat-slide', id: 'slides-stat-slide--default' },
  { name: 'stat-slide-roomy', id: 'slides-stat-slide--count-adaptive-figures' },
  { name: 'code-slide', id: 'slides-code-slide--default' },
  { name: 'triptych-slide', id: 'slides-triptych-slide--default' },
  { name: 'quadrant-slide', id: 'slides-quadrant-slide--default' },
  // The brand appearance is the one place the ink indirection is visible at all
  // — if a re-point stops reaching a layout, this is the picture that changes.
  { name: 'brand-cover', id: 'slides-brand-appearance--brand-cover' },
  { name: 'trend-chart-slide', id: 'editorial-trend-chart--on-a-slide' },
  { name: 'mapping-diagram', id: 'editorial-mapping-diagram--default' },
  { name: 'figure-slide', id: 'slides-figure-slide--default' },
  { name: 'image-slide', id: 'slides-image-slide--contained' },
  { name: 'compare-slide', id: 'slides-compare-slide--default' },
  { name: 'roadmap-slide', id: 'slides-roadmap-slide--default' },
  { name: 'assessment-slide', id: 'slides-assessment-slide--default' },
  { name: 'agenda-slide', id: 'slides-agenda-slide--default' },
  { name: 'end-slide', id: 'slides-end-slide--default' },
  { name: 'exhibit-row-fourfold', id: 'editorial-exhibit-row--four-fold' },
  { name: 'week-span-rows', id: 'editorial-week-span-rows--default' },
  { name: 'deck-present-seam-diagram', id: 'decks-매체와-논증의-분리--deck', advance: 9 },
  // The only callout on a real (scaled) slide — the case component stories
  // cannot represent, and where the seat drifted from its anchor unseen.
  { name: 'deck-present-chart-callout', id: 'decks-스트리밍-이관-제안--deck', advance: 6 },
  { name: 'deck-read-exhibits', id: 'decks-주간-업무현황-파일럿--deck', advance: 3 },
];

const VIEWPORT = { width: 1280, height: 800 };

async function capture(page, origin, subject) {
  await page.goto(`${origin}/iframe.html?${new URLSearchParams({ id: subject.id, viewMode: 'story' })}`, { waitUntil: 'networkidle' });
  // Wait for the story to mount, not for a slide surface: half the subjects are
  // editorial components that never render one.
  await page.waitForFunction(
    () => (document.querySelector('#storybook-root') ?? document.body)?.children.length > 0,
    undefined,
    { timeout: 20000 },
  );
  await page.evaluate(() => document.fonts.ready);
  if (subject.advance) {
    const deck = page.locator('[data-lds-deck-viewer]');
    await deck.press('Home');
    await page.waitForTimeout(150);
    const current = () => page.evaluate(() => Number(((document.querySelector('[data-deck-progress]')?.textContent ?? '').match(/(\d+)\s*\//) ?? [])[1]));
    for (let guard = 0; guard < 120 && await current() !== subject.advance; guard += 1) {
      await page.locator('[data-deck-next]').click();
      await page.waitForTimeout(70);
    }
  }
  // Fonts settle, then one more frame: a baseline captured mid-layout is a
  // baseline that fails tomorrow for no reason.
  await page.waitForTimeout(400);
  return page.screenshot();
}

async function main(origin) {
  await mkdir(baselineDir, { recursive: true });
  await rm(diffDir, { recursive: true, force: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });
  const failures = [];
  let written = 0;

  try {
    for (const subject of SUBJECTS) {
      const actualBuffer = await capture(page, origin, subject);
      const baselinePath = path.join(baselineDir, `${subject.name}.png`);
      if (update) {
        await writeFile(baselinePath, actualBuffer);
        written += 1;
        continue;
      }
      let baselineBuffer;
      try {
        baselineBuffer = await readFile(baselinePath);
      } catch {
        failures.push(`${subject.name}: missing baseline. Run \`npm run update:visual-snapshot\` and review the render before committing it.`);
        continue;
      }
      const actual = PNG.sync.read(actualBuffer);
      const baseline = PNG.sync.read(baselineBuffer);
      if (actual.width !== baseline.width || actual.height !== baseline.height) {
        failures.push(`${subject.name}: size changed (baseline ${baseline.width}x${baseline.height}, now ${actual.width}x${actual.height}).`);
        continue;
      }
      const diff = new PNG({ width: actual.width, height: actual.height });
      const differentPixels = pixelmatch(baseline.data, actual.data, diff.data, actual.width, actual.height, { threshold: 0.1, includeAA: false });
      const ratio = differentPixels / (actual.width * actual.height);
      // A handful of pixels is platform text rasterisation, not a change; the
      // sibling repo settled on the same order of magnitude.
      if (ratio > 0.001) {
        await mkdir(diffDir, { recursive: true });
        await writeFile(path.join(diffDir, `${subject.name}.png`), PNG.sync.write(diff));
        failures.push(`${subject.name}: ${differentPixels} pixels differ (${(ratio * 100).toFixed(2)}%) — see .visual-diff/${subject.name}.png`);
      }
    }
  } finally {
    await browser.close();
  }

  if (update) {
    console.log(`Wrote ${written} visual baselines to ${path.relative(root, baselineDir)}. Review the renders before committing.`);
    return;
  }
  if (failures.length > 0) {
    console.error(`Visual snapshots changed:\n- ${failures.join('\n- ')}\n\nIf the change is intended, run \`npm run update:visual-snapshot\`, LOOK at the new renders, and commit them with the change that caused it.`);
    process.exitCode = 1;
    return;
  }
  console.log(`Compared ${SUBJECTS.length} visual snapshots: all match their baselines.`);
}

const staticServer = await startStaticServer(staticDir);
try {
  await main(staticServer.origin);
} finally {
  await closeServer(staticServer.server);
}
