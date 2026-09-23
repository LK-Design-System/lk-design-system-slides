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
// Six rules, all scoped to what this repository ships (`src/` and `tokens/`;
// stories are deck-side demos and decks own their own markup):
//
//   1. Component sources must not reference an upstream ramp variable
//      (--display1-size, --body2-line, …). They read --slides-* instead.
//   2. `tokens/slides.css` may define only `--slides-*` variables at :root.
//      The one documented exception is the Editorial seam: `--editorial-*`
//      re-pointing is allowed only inside a selector scoped to the slide
//      surface, so the editorial package's own defaults survive off-slide.
//   3. No colour literals in components, except as a var() fallback.
//   4. Every variable a component reads is defined somewhere (tokens,
//      vendored upstream CSS, or a custom property a component sets).
//   5. `tokens/editorial.css` defines only `--editorial-*`.
//   6. Header and sparse-family layouts read `--slides-ink-*`, never a
//      label/primary token directly.

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
  const lines = content.split(/\r?\n/);
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

// Rule 3 — no colour literals in components. A hex or rgb() in a component
// is a colour decision made outside the token layer: it cannot follow a theme
// or the brand surface, and nothing upstream can correct it. The only place a
// literal may appear is as the fallback argument of a var() — the value is
// still owned by the token, the literal only covers a missing stylesheet.
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g;
const componentFiles = [];
for await (const file of walk(path.join(root, 'src'))) {
  if (file.endsWith('.jsx') || file.endsWith('.js')) componentFiles.push(file);
}
for (const file of componentFiles) {
  const lines = (await readFile(file, 'utf8')).split(/\r?\n/);
  lines.forEach((line, index) => {
    const code = line.replace(/\/\/.*$/, '');
    if (/^\s*\*/.test(code)) return; // block-comment body
    for (const match of code.matchAll(COLOR_LITERAL)) {
      const before = code.slice(0, match.index);
      if (/var\(--[\w-]+,\s*$/.test(before)) continue;
      failures.push(
        `${path.relative(root, file)}:${index + 1} uses colour literal \`${match[0]}\` — ` +
          'read a semantic token; a literal is allowed only as a var() fallback.'
      );
    }
  });
}

// Rule 4 — every variable a component reads must be defined somewhere. A
// typo or an invented token (`--radius-2`) resolves to its fallback forever,
// so the component looks fine and the token it claims to follow never
// reaches it. Defined = this repository's tokens, the vendored upstream
// stylesheets, or a custom property the components set themselves.
const OPTIONAL_KNOBS = new Map([
  // Deliberately undefined: an override knob whose absence means "derive".
  ['--slides-fit-floor', 'Fit derives its floor from the ramp unless a deck pins one'],
]);
const defined = new Set();
const collectDefinitions = (text) => {
  for (const [, name] of text.matchAll(/(--[\w-]+)\s*:/g)) defined.add(name);
  for (const [, name] of text.matchAll(/['"](--[\w-]+)['"]\s*:/g)) defined.add(name);
};
async function collectCss(directory) {
  try {
    for await (const file of walk(directory)) {
      if (file.endsWith('.css')) collectDefinitions(await readFile(file, 'utf8'));
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
await collectCss(path.join(root, 'tokens'));
for (const pkg of ['lds-core', 'lds-theme', 'lds-product']) {
  await collectCss(path.join(root, 'node_modules', '@lk-design-system', pkg));
}
for (const file of componentFiles) collectDefinitions(await readFile(file, 'utf8'));
if (defined.size > 0) {
  for (const file of componentFiles) {
    const lines = (await readFile(file, 'utf8')).split(/\r?\n/);
    lines.forEach((line, index) => {
      const code = line.replace(/\/\/.*$/, '');
      for (const [, name] of code.matchAll(/var\((--[\w-]+)/g)) {
        if (defined.has(name) || OPTIONAL_KNOBS.has(name)) continue;
        failures.push(
          `${path.relative(root, file)}:${index + 1} reads \`${name}\`, which no stylesheet defines — ` +
            'it will always resolve to its fallback.'
        );
      }
    });
  }
}

// Rule 5 — tokens/editorial.css owns --editorial-* and nothing else.
const editorialStripped = (await readFile(path.join(root, 'tokens', 'editorial.css'), 'utf8'))
  .replace(/\/\*[\s\S]*?\*\//g, '');
for (const [, rawSelector, body] of editorialStripped.matchAll(blockPattern)) {
  for (const [, name] of body.matchAll(/(--[\w-]+)\s*:/g)) {
    if (name.startsWith('--editorial-')) continue;
    failures.push(
      `tokens/editorial.css defines \`${name}\` in \`${rawSelector.trim()}\` — the editorial layer owns \`--editorial-*\` only.`
    );
  }
}

// Rule 6 — header and sparse-family type reads the ink indirection. These are
// the layouts a brand surface re-points; one line reading a label or primary
// token directly stays on the white-surface value over navy (the half-flipped
// header the brand appearance produced).
const INK_LAYOUTS = ['ContentSlide', 'TitleSlide', 'SectionSlide', 'StatementSlide', 'EndSlide', 'AgendaSlide', 'SlideEyebrow'];
for (const name of INK_LAYOUTS) {
  const file = path.join(root, 'src', 'components', 'slides', `${name}.jsx`);
  const lines = (await readFile(file, 'utf8')).split(/\r?\n/);
  lines.forEach((line, index) => {
    const code = line.replace(/\/\/.*$/, '');
    for (const match of code.matchAll(/--color-semantic-(?:label|primary)-[\w-]+/g)) {
      failures.push(
        `${path.relative(root, file)}:${index + 1} reads \`${match[0]}\` — header and sparse layouts read ` +
          '`--slides-ink-*` so a re-pointed surface carries them.'
      );
    }
  });
}

if (failures.length > 0) {
  console.error(`Style ownership check failed (${failures.length} violation${failures.length === 1 ? '' : 's'}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Style ownership check passed: components stay on --slides-*, read only defined tokens, use no colour literals; header ink is indirect; tokens define only owned prefixes.');
