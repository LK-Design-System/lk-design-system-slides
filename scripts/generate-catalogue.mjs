import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Emits catalogue.json: every export of this package, what it is for, and the
// props it takes — machine-readable, so a deck author (human or agent) reads a
// contract instead of prose.
//
// GENERATED FROM SOURCE, never hand-written. tahta ships the same idea as a
// hand-maintained layouts.json; a hand-maintained catalogue is a second copy of
// the truth, and second copies drift. Here the docstring above a component IS
// its catalogue entry, so the two cannot disagree — `check:catalogue` fails the
// build if the committed file no longer matches what the source says.
//
//   npm run generate:catalogue   # rewrite
//   npm run check:catalogue      # fail if stale

const root = process.cwd();
const componentsRoot = path.join(root, 'src', 'components');
const slidesTokensPath = path.join(root, 'tokens', 'slides.css');
const indexPath = path.join(root, 'src', 'index.js');
const cataloguePath = path.join(root, 'catalogue.json');

// The doctrine a deck author has to hold, in the order it applies. Mirrors the
// README's contracts; kept here so the machine-readable file is self-contained.
const RULES = [
  'Pick the layout whose shape matches the content, then fill its props. Layouts own composition; a deck owns wording and order.',
  'One claim per slide. If a slide needs two claims it is two slides.',
  'Emphasis is spent once per slide. The first item that asks gets it and the rest are demoted; a slide that spends emphasis (Stat, Figure, Compare, Roadmap, Triptych, Quadrant) drops its accented eyebrow. Every emphasised element carries data-emphasis="true".',
  'Titles end in a noun; the sentence belongs in `governing` (ContentSlide) or `statement` (StatementSlide).',
  'Never write an upstream ramp variable (--display1-size and friends), a colour literal, or an undefined token into a component. Read the --slides-* steps and semantic tokens; check:style-ownership enforces it.',
  'Prop vocabulary is shared: `label` is text the room sees and `aria-label` an accessible name only; `unit` is a value\'s unit; `emphasis` is a boolean. Props marked deprecated here still work but are not for new decks.',
  'appearance="brand" is for cover, section, statement and end slides. A content layout refuses it and reports data-slides-appearance-refused.',
  'Layouts that compose ContentSlide or SlideSurface accept their header and chrome props too — listed per entry under `inherits`.',
  'Every px in this package is a design pixel measured against a 1280px logical canvas. The canvas is fitted to its container, so authored composition is delivered composition.',
  'Content that overruns the canvas is clipped, not scrolled. Cut it, split the slide, or wrap the body in Fit — check:slide-overflow fails the build either way.',
  'Steps reveal on the presenter cue and must not reflow: a pending Step keeps its box. Outside a deck every Step renders revealed.',
  'Speaker notes ride on the slide element as `notes` and never reach the canvas the room sees.',
  'A slide that shows data names its source; a deck spends StatementSlide at most twice; an EndSlide message carries the argument’s residue, not thanks. check:deck-content enforces all three, with thresholds cited at the top of that script.',
];

const KINDS = [
  [/Slide$|^SlideSurface$/, 'layout'],
  [/^(DeckViewer|PresenterView|DeckPrintSheet)$/, 'deck'],
  [/^(Step|Fit)$/, 'primitive'],
];
// Editorial components are their own kind: they ride on any slide (or any
// page) rather than being a slide. They used to be missing from the file
// entirely — the scan only read components/slides/, so thirteen exports the
// package ships had no catalogue entry while the catalogue called itself the
// machine contract.
const kindOf = (name, dir) => (dir === 'editorial'
  ? 'editorial'
  : (KINDS.find(([pattern]) => pattern.test(name)) ?? [null, 'primitive'])[1]);

// The exported surface is the catalogue's boundary — an internal helper that
// happens to live in the folder is not something a deck may reach for.
async function exportedNames() {
  const source = await readFile(indexPath, 'utf8');
  return [...source.matchAll(/export \{ (\w+) \} from '\.\/components\/(slides|editorial)\/(\w+)\.jsx'/g)]
    .map(([, name, dir, file]) => ({ name, dir, file }));
}

// The first paragraph of the docstring, minus the "LDS Slides|Editorial — Name" heading:
// one prose statement of what the thing is for. Later paragraphs are rationale
// for whoever edits the component, not for whoever composes a deck.
function useFor(source, name) {
  const doc = source.match(/\/\*\*([\s\S]*?)\*\//);
  if (!doc) return '';
  const body = doc[1]
    .split('\n')
    .map((line) => line.replace(/^\s*\*ss?/, '').replace(/^\s*\*/, '').trim())
    .join('\n');
  const withoutHeading = body.replace(new RegExp(`^\\s*LDS (?:Slides|Editorial)\\s*—\\s*${name}\\s*`), '').trim();
  const [first] = withoutHeading.split(/\n\s*\n/);
  return (first || '').replace(/\s+/g, ' ').trim();
}

// Props come from the destructured signature, so the list cannot drift from
// what the component actually accepts.
function propsOf(source, name) {
  const signature = source.match(new RegExp(`export function ${name}\\s*\\(\\s*\\{([\\s\\S]*?)\\}\\s*\\)\\s*\\{`));
  if (!signature) return [];
  return signature[1]
    .split(/\r?\n/)
    .map((line) => line.replace(/\/\/.*$/, '').trim())
    .filter((line) => line && !line.startsWith('//'))
    .join(' ')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => !entry.startsWith('...'))
    .map((entry) => {
      const [rawName, ...rest] = entry.split('=');
      // `key: local` renames — `'aria-label': ariaLabel`, `label: legacyLabel`.
      // The public name is the key; a `legacy…` local marks an alias kept for
      // old decks. These used to fail the name filter and vanish.
      const [key, local] = rawName.split(':').map((part) => part.trim().replace(/^['"]|['"]$/g, ''));
      const fallback = rest.join('=').trim();
      const prop = { name: key };
      if (fallback) prop.default = fallback;
      if (local && /^legacy/.test(local)) prop.deprecated = true;
      return prop;
    })
    .filter((prop) => /^[a-zA-Z][\w-]*$/.test(prop.name))
    .filter((prop) => !['style'].includes(prop.name));
}

// Props a layout accepts through `...rest` because it composes ContentSlide
// or SlideSurface. The catalogue used to list only the destructured
// signature, so QuadrantSlide appeared to take no title and StatSlide no
// governing — an agent reading the catalogue would compose a worse slide
// than the component allows.
function inheritedProps(source, ownProps, bases) {
  if (!/\.\.\.rest\b/.test(source)) return undefined;
  const own = new Set(ownProps.map((prop) => prop.name));
  const skip = new Set(['children', 'style']);
  const from = [];
  if (/<ContentSlide\b/.test(source)) from.push('ContentSlide', 'SlideSurface');
  else if (/<SlideSurface\b/.test(source)) from.push('SlideSurface');
  if (from.length === 0) return undefined;
  const props = [];
  for (const base of from) {
    for (const prop of bases[base]) {
      if (own.has(prop.name) || skip.has(prop.name) || prop.deprecated) continue;
      own.add(prop.name);
      props.push(prop.name);
    }
  }
  return props.length ? { from, props } : undefined;
}

// The type ramp as the tokens file defines it — every `--slides-<rung>-size`
// at the top level, not a hand-kept list (which had frozen at five rungs
// while the file grew to ten).
async function rampRungs() {
  const css = (await readFile(slidesTokensPath, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
  return [...new Set([...css.matchAll(/--slides-([a-z-]+)-size\s*:/g)].map(([, rung]) => `--slides-${rung}-*`))];
}

// Data attributes are the contract play assertions and gates hook onto, so they
// are part of the public surface whether or not anyone documents them.
function dataAttributes(source) {
  return [...new Set([...source.matchAll(/\bdata-([a-z][a-z0-9-]*)\b/g)].map(([, attribute]) => `data-${attribute}`))]
    .sort();
}

const exports_ = await exportedNames();
const entries = [];
const sourceOf = (dir, file) => readFile(path.join(componentsRoot, dir, `${file}.jsx`), 'utf8');
const bases = {
  ContentSlide: propsOf(await sourceOf('slides', 'ContentSlide'), 'ContentSlide'),
  SlideSurface: propsOf(await sourceOf('slides', 'SlideSurface'), 'SlideSurface'),
};
for (const { name, dir, file } of exports_) {
  const source = await sourceOf(dir, file);
  const props = propsOf(source, name);
  const entry = {
    name,
    kind: kindOf(name, dir),
    useFor: useFor(source, name),
    props,
  };
  // ContentSlide itself forwards ...rest to SlideSurface, so it inherits the
  // chrome props too (`notes` on a ContentSlide is correct usage).
  const inherits = name === 'SlideSurface' ? undefined : inheritedProps(source, props, bases);
  if (inherits) entry.inherits = inherits;
  // A component that spreads ...rest into an UPSTREAM component accepts that
  // component's props as well — TrendChart hands its axis props to Product's
  // LineChart. The catalogue cannot list another package's props, so it says
  // where they go instead of pretending the list is closed.
  const upstream = [...source.matchAll(/import \{([^}]+)\} from '(@lk-design-system\/[\w-]+)'/g)]
    .flatMap(([, names, pkgName]) => names.split(',').map((n) => [n.trim(), pkgName]));
  for (const [upstreamName, pkgName] of upstream) {
    if (new RegExp(`<${upstreamName}\\b[^>]*\\{\\.\\.\\.rest\\}`).test(source)) {
      entry.forwardsTo = `${pkgName} ${upstreamName}`;
      break;
    }
  }
  entry.dataAttributes = dataAttributes(source);
  entries.push(entry);
}

const catalogue = {
  $comment: 'Generated by scripts/generate-catalogue.mjs from src/. Do not edit by hand.',
  package: JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).name,
  rules: RULES,
  tokens: {
    canvas: ['--slides-canvas-width', '--slides-canvas-max-width', '--slides-aspect', '--slides-safe-x', '--slides-safe-y'],
    ramp: await rampRungs(),
    presets: ['keynote (:root default)', 'briefing (data-slides-preset)'],
    editorialSeam: ['--editorial-value-*', '--editorial-claim-*', '--editorial-note-*', '--editorial-note-body-*', '--editorial-caption-*'],
  },
  layouts: entries.filter((entry) => entry.kind === 'layout'),
  primitives: entries.filter((entry) => entry.kind === 'primitive'),
  deck: entries.filter((entry) => entry.kind === 'deck'),
  editorial: entries.filter((entry) => entry.kind === 'editorial'),
};

const serialised = `${JSON.stringify(catalogue, null, 2)}\n`;

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = await readFile(cataloguePath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  // Compare on content, not bytes. `core.autocrlf` rewrites the file to CRLF
  // on checkout, so a byte-exact comparison passes on the machine that wrote
  // it and fails on every Windows CI runner that checks it out — a gate that
  // only fires where nobody can reproduce it is worse than no gate.
  const sameContent = (a, b) => a.replace(/\r\n/g, '\n') === b.replace(/\r\n/g, '\n');

  if (!sameContent(current, serialised)) {
    console.error(
      'catalogue.json is stale — regenerate it with `npm run generate:catalogue` and commit the diff.\n'
      + 'It is generated from the component docstrings and signatures, so a stale file means the '
      + 'catalogue and the code disagree about what a deck may use.'
    );
    process.exitCode = 1;
  } else {
    console.log(
      `✓ catalogue: ${catalogue.layouts.length} layouts, ${catalogue.primitives.length} primitives, `
      + `${catalogue.deck.length} deck components, ${catalogue.editorial.length} editorial components — matches source.`
    );
  }
} else {
  await writeFile(cataloguePath, serialised, 'utf8');
  console.log(
    `Generated catalogue.json: ${catalogue.layouts.length} layouts, ${catalogue.primitives.length} primitives, `
    + `${catalogue.deck.length} deck components, ${catalogue.editorial.length} editorial components.`
  );
}
