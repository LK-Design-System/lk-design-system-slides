/**
 * The print sheet, measured.
 *
 * An export path is only as good as the sheet it prints, and the sheet is
 * exactly the thing nobody looks at — you look at the PDF, once, and then trust
 * it forever. So the four properties that make a page a page are measured on
 * every deck in the repository:
 *
 *   1. PAGE PER SLIDE — the sheet mounts every slide, not the one DeckViewer
 *      would have shown. A deck of 16 prints 16.
 *   2. UNSCALED CANVAS — each surface draws at exactly 1280×720 CSS px. Any
 *      other number means the fitting transform survived into print, and the
 *      PDF is a resampled screenshot of a screen rather than paper.
 *   3. NO CHROME — no buttons, progress bar or notes toggle anywhere on the
 *      sheet. Presenter affordances on paper are a bug that ships silently.
 *   4. NOTHING SPILLS — content stays inside its page box. The screen deck is
 *      already guarded by check:slide-overflow, but the sheet reveals steps
 *      that the screen shows one at a time, so a slide can be within budget on
 *      screen and over it on paper. This is the one failure mode the export
 *      introduces by itself, and the reason this gate is not redundant.
 *   5. THE SHEET SITS AT THE PAGE ORIGIN — no ancestor offsets it, and the
 *      document is exactly pages × page height tall. A component cannot fix an
 *      ancestor's padding, so this is the one requirement DeckPrintSheet states
 *      and this gate enforces. It is not hypothetical: this repository's own
 *      Storybook decorator padded the page by 32px and a 4-slide deck exported
 *      as 6 pages, each slide sliced across a sheet boundary.
 *
 * Measured under PRINT media emulation, not screen. The whole subject is what
 * the printer is handed, and `@media print` rules — including the ones the
 * sheet ships — do not exist on screen.
 *
 * Deliberately not measured: the PDF bytes. Chromium's print pipeline is not
 * ours to assert on, and `scripts/export-pdf.mjs` already fails loudly if the
 * sheet has no pages. What this gate owns is the DOM the printer is handed.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { closeServer, loadStoryIndex, openStorybook } from './_storybook-static.mjs';

const root = process.cwd();
const staticDir = path.join(root, 'storybook-static');
const CANVAS = { width: 1280, height: 720 };
// Sub-pixel tolerance: a surface sized by aspect-ratio can land a hair off an
// integer height without any scaling being involved.
const SIZE_TOLERANCE = 1.5;

async function auditDeck(page, origin, id) {
  // The screen deck first: it decides whether this story is a deck at all (the
  // Decks section also holds single-slide demos) and states the slide count the
  // sheet must agree with — the sheet must match the deck, not itself.
  const screenUrl = `${origin}/iframe.html?${new URLSearchParams({ id, viewMode: 'story' })}`;
  await page.goto(screenUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => (document.querySelector('#storybook-root') ?? document.body)?.children.length > 0,
    undefined,
    { timeout: 20000 },
  );
  const onScreen = await page.evaluate(() => {
    if (!document.querySelector('[data-lds-deck-viewer]')) return null;
    const progress = document.querySelector('[data-deck-progress]')?.textContent ?? '';
    return Number((progress.match(/\/\s*(\d+)/) ?? [])[1]) || 0;
  });
  if (onScreen === null) return { id, skipped: true, pages: 0, findings: [] };

  const url = `${origin}/iframe.html?${new URLSearchParams({ id, viewMode: 'story', 'lds-print': '1' })}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-lds-print-sheet]', { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(300);

  const printed = await page.evaluate(({ canvas, tolerance }) => {
    const sheet = document.querySelector('[data-lds-print-sheet]');
    const pages = [...sheet.querySelectorAll('[data-lds-print-page]')];
    const findings = [];
    const sheetTop = sheet.getBoundingClientRect().top + window.scrollY;
    if (Math.abs(sheetTop) > tolerance) {
      findings.push(
        `the sheet starts ${Math.round(sheetTop)}px below the page origin — an ancestor pads it, `
        + 'so every slide is sliced across a sheet boundary. Mount the print sheet at the page root.',
      );
    }
    const expectedHeight = pages.length * canvas.height;
    const documentHeight = document.documentElement.scrollHeight;
    if (Math.abs(documentHeight - expectedHeight) > tolerance) {
      findings.push(
        `the document is ${documentHeight}px tall for ${pages.length} pages `
        + `(expected ${expectedHeight}px) — the extra space becomes blank sheets`,
      );
    }
    if (document.querySelector('[data-deck-chrome], [data-deck-next], [data-deck-progress-track]')) {
      findings.push('presenter chrome reached the print sheet');
    }
    pages.forEach((pageEl, order) => {
      const surface = pageEl.querySelector('[data-lds-slide-surface]');
      if (!surface) {
        findings.push(`page ${order + 1} has no slide surface`);
        return;
      }
      const box = surface.getBoundingClientRect();
      if (Math.abs(box.width - canvas.width) > tolerance || Math.abs(box.height - canvas.height) > tolerance) {
        findings.push(
          `page ${order + 1} draws ${Math.round(box.width)}×${Math.round(box.height)} px, `
          + `not the ${canvas.width}×${canvas.height} canvas — the fitting transform survived into print`,
        );
      }
      // Painted spill past the page box. Text ranges and replaced elements
      // only: a container stretches to its region however little it draws.
      let bottom = null;
      const walker = document.createTreeWalker(surface, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      for (let node = walker.currentNode; node; node = walker.nextNode()) {
        let rect = null;
        if (node.nodeType === 1) {
          if (/^(svg|IMG|CANVAS|VIDEO)$/i.test(node.tagName)) rect = node.getBoundingClientRect();
        } else if (node.textContent.trim()) {
          const range = document.createRange();
          range.selectNodeContents(node);
          rect = range.getBoundingClientRect();
        }
        if (rect && rect.height > 0) bottom = bottom === null ? rect.bottom : Math.max(bottom, rect.bottom);
      }
      if (bottom !== null && bottom - box.bottom > tolerance) {
        findings.push(
          `page ${order + 1} spills ${Math.round(bottom - box.bottom)}px past the page — `
          + 'steps that reveal one at a time on screen all print at once',
        );
      }
    });
    return { pageCount: pages.length, declared: Number(sheet.getAttribute('data-print-page-count')), findings };
  }, { canvas: CANVAS, tolerance: SIZE_TOLERANCE });

  const findings = [...printed.findings];
  if (printed.pageCount !== printed.declared) {
    findings.push(`sheet declares ${printed.declared} pages but rendered ${printed.pageCount}`);
  }
  if (onScreen > 0 && printed.pageCount !== onScreen) {
    findings.push(`deck has ${onScreen} slides on screen but printed ${printed.pageCount} pages`);
  }
  return { id, pages: printed.pageCount, findings };
}

async function main(origin) {
  const index = await loadStoryIndex(origin, staticDir);
  const decks = Object.values(index.entries)
    .filter((entry) => entry.type === 'story' && entry.id.startsWith('decks-'))
    .map((entry) => entry.id)
    .sort();

  const results = [];
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: CANVAS.width, height: 900 } });
    for (const id of decks) {
      // eslint-disable-next-line no-await-in-loop
      results.push(await auditDeck(page, origin, id));
    }
  } finally {
    await browser.close();
  }

  const audited = results.filter((result) => !result.skipped);
  const broken = audited.filter((result) => result.findings.length > 0);
  const totalPages = audited.reduce((sum, result) => sum + result.pages, 0);
  console.log(
    `Audited ${audited.length} deck print sheets (${totalPages} pages): `
    + `${audited.length - broken.length} clean, ${broken.length} in violation`
    + `${results.length - audited.length > 0 ? `; skipped ${results.length - audited.length} non-deck stories` : ''}.`,
  );
  if (broken.length > 0) {
    console.error(
      'Print sheets that would export a wrong PDF:\n'
      + broken.map((result) => `- ${result.id}\n${result.findings.map((finding) => `    ${finding}`).join('\n')}`).join('\n'),
    );
    process.exitCode = 1;
  }
}

const staticServer = await openStorybook(staticDir);
try {
  await main(staticServer.origin);
} finally {
  await closeServer(staticServer.server);
}
process.exit(process.exitCode ?? 0);
