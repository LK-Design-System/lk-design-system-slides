import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

// Enforces the style-ownership contract that until now lived only in prose.
//
// The projection scale exists as one layer of indirection: components read
// `--slides-*` steps, and only `tokens/slides.css` decides which upstream ramp
// rung each step resolves to. A component that reaches past the slide layer
// and reads `--title1-size` directly gets a value that ignores the preset axis
// (keynote/briefing re-point the slide steps, not the upstream ramp) and
// silently breaks the projection floor. That mistake renders fine in every
// story — the value is a perfectly plausible size — which is exactly why it
// needs a static gate rather than a play assertion.
//
// Two rules, both scoped to what this repository ships (`src/` and `tokens/`;
// stories are deck-side demos and decks own their own markup):
//
//   1. Component sources must not reference an upstream ramp variable
//      (--display1-size, --body2-line, …). They read --slides-* instead.
//   2. `tokens/slides.css` may define only `--slides-*` variables at :root.
//      The one documented exception is the Editorial seam: `--editorial-*`
//      re-pointing is allowed only inside a selector scoped to the slide
//      surface, so the editorial package's own defaults survive off-slide.

const root = process.cwd();
const failures = [];

const RAMP_REFERENCE =
  /--(?:display|title|heading|headline|body|label|caption)\d-(?:size|line|spacing)\b/g;

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

// Rule 1 — components read the slide scale, never the upstream ramp.
for await (const file of walk(path.join(root, 'src'))) {
  const content = await readFile(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    for (const match of line.matchAll(RAMP_REFERENCE)) {
      failures.push(
        `${path.relative(root, file)}:${index + 1} references upstream ramp variable ` +
          `\`${match[0]}\` — components read \`--slides-*\` steps; only tokens/slides.css ` +
          `maps them to the ramp.`
      );
    }
  });
}

// Rule 2 — the tokens file defines only what this repository owns.
const tokensPath = path.join(root, 'tokens', 'slides.css');
const tokensContent = await readFile(tokensPath, 'utf8');
// Strip comments, then walk declaration blocks with their selectors.
const stripped = tokensContent.replace(/\/\*[\s\S]*?\*\//g, '');
const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
for (const [, rawSelector, body] of stripped.matchAll(blockPattern)) {
  const selector = rawSelector.trim();
  const onSurface = selector.includes('[data-lds-slide-surface]');
  for (const [, name] of body.matchAll(/(--[\w-]+)\s*:/g)) {
    if (name.startsWith('--slides-')) continue;
    if (name.startsWith('--editorial-') && onSurface) continue;
    failures.push(
      `tokens/slides.css defines \`${name}\` in \`${selector}\` — this repository owns ` +
        `\`--slides-*\` only (plus \`--editorial-*\` re-pointing scoped to the slide surface).`
    );
  }
}

if (failures.length > 0) {
  console.error(`Style ownership check failed (${failures.length} violation${failures.length === 1 ? '' : 's'}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Style ownership check passed: components stay on --slides-*, tokens define only owned prefixes.');
