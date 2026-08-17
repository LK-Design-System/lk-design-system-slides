/**
 * Horizontal under-fill, mechanised — and the cure's own side effect.
 *
 * TWO rules live here because the second exists to bound the first. Under-fill
 * (rule 1) has an honest fix — lay the exhibit out wider — and a dishonest one:
 * stretch a fixed viewBox to width:100% and let the SVG magnify. That passes
 * rule 1 while multiplying everything inside it, TEXT INCLUDED. Measured on the
 * seam diagram: a label specced at --slides-fine-size (18px) painted at 35px,
 * larger than that slide's own governing claim (24px) — the figure's incidental
 * labels became the biggest type on the page, on the very slide arguing that
 * distance belongs to the medium. So rule 2: SVG text inside an exhibit must
 * render at the size the medium specced for it. Pure geometry (chart curves,
 * pictograms) still scales through its viewBox; type does not.
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
import { closeServer, loadStoryIndex, openStorybook } from './_storybook-static.mjs';

const root = process.cwd();
const staticDir = path.join(root, 'storybook-static');
const knownPath = path.join(root, 'figure-fill-known-failures.json');
const updateKnown = process.argv.includes('--update-known-failures');
const reportOnly = process.argv.includes('--report');
const MINIMUM_FILL = 0.70;
// How far an exhibit's SVG text may drift from its specced size before it is a
// rank inversion. 12% absorbs subpixel CTM noise; the defect that prompted the
// rule sat at +97%.
const TEXT_SCALE_TOLERANCE = 0.12;
// How far a callout may sit from the point it annotates, in canvas px. The
// component seats it a 14px gap away; 48 leaves room for composition without
// admitting a note that has come unmoored (the drift it was written for
// measured over 100).
const MAX_CALLOUT_GAP = 48;
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
  return page.evaluate(async ({
    maxAdvances, settleMs, minimum, tolerance, maxCalloutGap,
  }) => {
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

    // Rank inversion: an exhibit's SVG text drawn away from its specced size.
    // The comparison is against the SURFACE scale, not 1 — the canvas as a
    // whole is scaled to fit its container, and that is the medium's own doing;
    // what is forbidden is a figure scaling further on top of it.
    const textScaleDrift = (region, tolerance) => {
      const surface = region.closest('[data-lds-slide-surface]');
      const surfaceScale = surface ? surface.getBoundingClientRect().width / 1280 : 1;
      if (!(surfaceScale > 0)) return null;
      let worst = null;
      for (const text of region.querySelectorAll('svg text')) {
        if (!text.textContent.trim()) continue;
        const ctm = text.getScreenCTM();
        if (!ctm) continue;
        const relative = Math.hypot(ctm.a, ctm.b) / surfaceScale;
        if (Math.abs(relative - 1) <= tolerance) continue;
        if (!worst || Math.abs(relative - 1) > Math.abs(worst.relative - 1)) {
          worst = {
            relative,
            spec: Number.parseFloat(getComputedStyle(text).fontSize),
            sample: text.textContent.replace(/\s+/g, ' ').trim().slice(0, 24),
          };
        }
      }
      return worst;
    };

    // A callout that lost its anchor. Callouts are placed from measured rects,
    // and the component stories that assert them render UNSCALED — so a seat
    // computed in screen px and written back in canvas px looked perfect in
    // Storybook and drifted ~100px away from its data point on a real slide,
    // where the surface is scaled by a transform. Only a scaled surface can
    // catch that class, which is why it is measured here and not in a play.
    const calloutDrift = (region, maxGap) => {
      const surface = region.closest('[data-lds-slide-surface]');
      const scale = surface ? surface.getBoundingClientRect().width / 1280 : 1;
      if (!(scale > 0)) return null;
      let worst = null;
      for (const callout of region.querySelectorAll('[data-annotation-kind="anchored"]')) {
        if (!callout.id) continue;
        const target = region.querySelector(`[aria-details="${CSS.escape(callout.id)}"]`);
        if (!target) continue;
        const anchor = target.getBoundingClientRect();
        const box = callout.getBoundingClientRect();
        const ax = anchor.left + anchor.width / 2;
        const ay = anchor.top + anchor.height / 2;
        const dx = Math.max(box.left - ax, 0, ax - box.right);
        const dy = Math.max(box.top - ay, 0, ay - box.bottom);
        const gap = Math.hypot(dx, dy) / scale;
        if (gap > maxGap && (!worst || gap > worst.gap)) {
          worst = { gap, sample: (callout.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 24) };
        }
      }
      return worst;
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
        const title = (surface.querySelector('[data-slide-title]')?.textContent ?? '(무제)').replace(/\s+/g, ' ').trim();
        const span = paintedSpan(region);
        if (span) {
          const fill = (span.right - span.left) / box.width;
          if (fill < minimum) {
            findings.push({
              rule: 'under-fill',
              position: position ?? 'slide',
              title,
              fill: Math.round(fill * 1000) / 10,
            });
          }
        }
        const stray = calloutDrift(region, maxCalloutGap);
        if (stray) {
          findings.push({
            rule: 'callout-drift',
            position: position ?? 'slide',
            title,
            sample: stray.sample,
            gap: Math.round(stray.gap),
          });
        }
        const drift = textScaleDrift(region, tolerance);
        if (drift) {
          findings.push({
            rule: 'text-scale',
            position: position ?? 'slide',
            title,
            sample: drift.sample,
            spec: drift.spec,
            painted: Math.round(drift.spec * drift.relative * 10) / 10,
            scale: Math.round(drift.relative * 100) / 100,
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
  }, {
    maxAdvances: 400,
    settleMs: 90,
    minimum: MINIMUM_FILL,
    tolerance: TEXT_SCALE_TOLERANCE,
    maxCalloutGap: MAX_CALLOUT_GAP,
  }).then((result) => ({ id, ...result }));
}

// Pins are keyed by (story, rule), not by story: a story pinned for one rule
// must not silently absorb a violation of the other — the lesson the deck
// content ratchet already learned.
const pinKey = (id, rule) => `${id}::${rule}`;

async function loadKnown() {
  try {
    const parsed = JSON.parse(await readFile(knownPath, 'utf8'));
    return new Set(parsed.failures.flatMap((failure) => (
      [...new Set((failure.findings ?? []).map((finding) => finding.rule ?? 'under-fill'))]
        .map((rule) => pinKey(failure.id, rule))
    )));
  } catch (error) {
    if (error.code === 'ENOENT') return new Set();
    throw error;
  }
}

async function main(origin) {
  const index = await loadStoryIndex(origin, staticDir);
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
  const describeFinding = (finding) => {
    if (finding.rule === 'text-scale') {
      return `    ${finding.position}: "${finding.title}" — 도판 글자가 지정 ${finding.spec}px인데 ${finding.painted}px로 찍힌다 `
        + `(×${finding.scale}, 예: "${finding.sample}")`;
    }
    if (finding.rule === 'callout-drift') {
      return `    ${finding.position}: "${finding.title}" — 콜아웃이 자기 앵커에서 ${finding.gap}px 떨어져 있다 `
        + `(상한 ${MAX_CALLOUT_GAP}px, 예: "${finding.sample}")`;
    }
    return `    ${finding.position}: "${finding.title}" — 도판이 부여 폭의 ${finding.fill}%만 그린다 (하한 ${MINIMUM_FILL * 100}%)`;
  };
  const describe = (result) => `- ${result.id}\n${result.findings.map(describeFinding).join('\n')}`;
  const rulesOf = (result) => new Set(result.findings.map((finding) => finding.rule ?? 'under-fill'));

  if (reportOnly) {
    console.log(`Measured ${results.length} stories for figure fill and text scale; ${offenders.length} offending.`);
    if (offenders.length > 0) console.log(offenders.map(describe).join('\n'));
    return;
  }

  if (updateKnown) {
    await writeFile(knownPath, `${JSON.stringify({
      schemaVersion: 2,
      note: 'FigureSlide exhibits that break one of two rules: `under-fill` (drawing less than 70% of the granted width) or `text-scale` (SVG text painted away from its specced size — a figure magnifying past the medium type ramp). A ratchet keyed by (story, rule): check:figure-fill fails on any unpinned violation, and also when a pin stops firing. Only ever remove entries.',
      count: offenders.length,
      failures: offenders.map((result) => ({ id: result.id, findings: result.findings })),
    }, null, 2)}\n`, 'utf8');
    console.log(`Pinned ${offenders.length} known figure-fill failures in ${path.relative(root, knownPath)}.`);
    return;
  }

  const livePins = new Set(offenders.flatMap((result) => [...rulesOf(result)].map((rule) => pinKey(result.id, rule))));
  const regressions = offenders
    .map((result) => ({
      ...result,
      findings: result.findings.filter((finding) => !known.has(pinKey(result.id, finding.rule ?? 'under-fill'))),
    }))
    .filter((result) => result.findings.length > 0);
  const fixed = [...known].filter((key) => !livePins.has(key)).sort();

  console.log(
    `Measured ${results.length} stories for figure horizontal fill and text scale: `
    + `${results.length - offenders.length} clean, ${offenders.length} offending `
    + `(${regressions.length} new, ${livePins.size - regressions.length} pinned).`,
  );

  const problems = [];
  const newUnderFill = regressions.filter((result) => result.findings.some((finding) => (finding.rule ?? 'under-fill') === 'under-fill'));
  const newTextScale = regressions.filter((result) => result.findings.some((finding) => finding.rule === 'text-scale'));
  const pinHint = 'Pin deliberately with `npm run check:figure-fill -- --update-known-failures`.';
  if (newUnderFill.length > 0) {
    problems.push(
      'Exhibits that do not fill their width. The medium hands a figure the content width — an exhibit that keeps a fixed width leaves dead space beside it. '
      + `Widen the LAYOUT (more room per cell, not a bigger viewBox — that trips the next rule). ${pinHint}\n`
      + newUnderFill.map(describe).join('\n'),
    );
  }
  const newDrift = regressions.filter((result) => result.findings.some((finding) => finding.rule === 'callout-drift'));
  if (newDrift.length > 0) {
    problems.push(
      'Callouts that came unmoored from their anchors. A callout is placed from measured rects, so any confusion between screen px and canvas px shows up only where the surface is scaled — which is every real slide, and no component story. '
      + `Check the coordinate space the seat is written in. ${pinHint}\n`
      + newDrift.map(describe).join('\n'),
    );
  }
  if (newTextScale.length > 0) {
    problems.push(
      'Figure text painted away from its specced size. A viewBox stretched to fill the width magnifies the type inside it, so the figure overrides the ramp the medium owns — measured once at ×1.97, where 18px labels outshouted a 24px governing claim. '
      + `Fill by laying the exhibit out wider and let its text ride the ramp; keep viewBox scaling for pure geometry. ${pinHint}\n`
      + newTextScale.map(describe).join('\n'),
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

const staticServer = await openStorybook(staticDir);
try {
  await main(staticServer.origin);
} finally {
  await closeServer(staticServer.server);
}
// The server keeps the loop alive on some Node versions; exit on the code main set.
process.exit(process.exitCode ?? 0);
