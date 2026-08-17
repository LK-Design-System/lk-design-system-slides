/**
 * Deck → PDF.
 *
 * The last mile (COMPLETENESS_AUDIT A1): until this existed, a finished deck
 * could only leave Storybook as PNG captures. Every peer system exports PDF
 * (reveal via the browser dialog, Slidev via Playwright, Marp via CLI) and this
 * one exported nothing — the single unanimous gap in the feature matrix.
 *
 * It is deliberately NOT a second renderer. It opens the deck's own print sheet
 * (`?lds-print=1`, see DeckPrintSheet) and asks Chromium to print it. The page
 * box is the logical canvas exactly — 1280×720 CSS px — so a design pixel is a
 * print pixel and nothing is resampled; text stays selectable because it is
 * text, not an image (Slidev's and Marp's PPTX are image-based, which is the
 * trap this avoids).
 *
 * Usage:
 *   node scripts/export-pdf.mjs <story-id> [out.pdf] [--pages=2-5] [--keep-edges]
 *   node scripts/export-pdf.mjs --list
 *
 * Needs a built Storybook (`npm run build:storybook`) — the same static bundle
 * the gates serve, so what ships is what prints.
 */
import { readFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { closeServer, startStaticServer } from './_storybook-static.mjs';

const root = process.cwd();
const staticDir = path.join(root, 'storybook-static');
const CANVAS = { width: 1280, height: 720 };

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const positional = args.filter((arg) => !arg.startsWith('--'));
const pageRange = (args.find((arg) => arg.startsWith('--pages=')) ?? '').split('=')[1] ?? '';

async function deckStories() {
  const index = JSON.parse(await readFile(path.join(staticDir, 'index.json'), 'utf8'));
  return Object.values(index.entries)
    .filter((entry) => entry.type === 'story' && entry.id.startsWith('decks-'))
    .map((entry) => ({ id: entry.id, title: entry.title, name: entry.name }));
}

async function main() {
  try {
    await stat(path.join(staticDir, 'index.json'));
  } catch {
    console.error('No storybook-static/index.json — run `npm run build:storybook` first.');
    process.exitCode = 1;
    return;
  }

  const decks = await deckStories();
  if (flags.has('--list') || positional.length === 0) {
    console.log('Deck stories available for export:');
    for (const deck of decks) console.log(`  ${deck.id}\n      ${deck.title} · ${deck.name}`);
    console.log('\nnode scripts/export-pdf.mjs <story-id> [out.pdf] [--pages=2-5]');
    return;
  }

  const [storyId, outArg] = positional;
  const outPath = path.resolve(root, outArg ?? path.join('out', `${storyId}.pdf`));
  await mkdir(path.dirname(outPath), { recursive: true });

  const server = await startStaticServer(staticDir);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: CANVAS.width, height: CANVAS.height } });
    const url = `${server.origin}/iframe.html?${new URLSearchParams({
      id: storyId, viewMode: 'story', 'lds-print': '1',
    })}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    // The sheet declares its own page count; waiting on it is how we know the
    // deck mounted rather than an error boundary.
    await page.waitForSelector('[data-lds-print-sheet]', { timeout: 20000 });
    const pageCount = Number(await page.getAttribute('[data-lds-print-sheet]', 'data-print-page-count'));
    if (!(pageCount > 0)) {
      throw new Error(`"${storyId}" rendered a print sheet with no pages — is it a deck story?`);
    }
    // Fonts before layout: a PDF printed with fallback metrics has different
    // line breaks than the deck the author approved.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.pdf({
      path: outPath,
      width: `${CANVAS.width}px`,
      height: `${CANVAS.height}px`,
      printBackground: true,
      margin: {
        top: '0', right: '0', bottom: '0', left: '0',
      },
      ...(pageRange ? { pageRanges: pageRange } : {}),
    });
    const written = await stat(outPath);
    console.log(
      `Exported ${pageRange ? `pages ${pageRange} of ` : ''}${pageCount} slides → `
      + `${path.relative(root, outPath)} (${Math.round(written.size / 1024)} KB, `
      + `${CANVAS.width}×${CANVAS.height} px pages).`,
    );
  } finally {
    await browser.close();
    await closeServer(server.server);
  }
}

await main();
process.exit(process.exitCode ?? 0);
