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
const componentsDir = path.join(root, 'src', 'components', 'slides');
const indexPath = path.join(root, 'src', 'index.js');
const cataloguePath = path.join(root, 'catalogue.json');

// The doctrine a deck author has to hold, in the order it applies. Mirrors the
// README's contracts; kept here so the machine-readable file is self-contained.
const RULES = [
  'Pick the layout whose shape matches the content, then fill its props. Layouts own composition; a deck owns wording and order.',
  'One claim per slide. If a slide needs two claims it is two slides.',
  'Emphasis is spent once per slide. StatSlide grants the first figure that asks and demotes the rest; a slide that spends emphasis on a figure drops its accented eyebrow.',
  'Titles end in a noun; the sentence belongs in `governing` (ContentSlide) or `statement` (StatementSlide).',
  'Never write an upstream ramp variable (--display1-size and friends) into a component or a deck. Read the --slides-* steps; check:style-ownership enforces it.',
  'Every px in this package is a design pixel measured against a 1280px logical canvas. The canvas is fitted to its container, so authored composition is delivered composition.',
  'Content that overruns the canvas is clipped, not scrolled. Cut it, split the slide, or wrap the body in Fit — check:slide-overflow fails the build either way.',
  'Steps reveal on the presenter cue and must not reflow: a pending Step keeps its box. Outside a deck every Step renders revealed.',
  'Speaker notes ride on the slide element as `notes` and never reach the canvas the room sees.',
];

const KINDS = [
  [/Slide$|^SlideSurface$/, 'layout'],
  [/^(DeckViewer|PresenterView)$/, 'deck'],
  [/^(Step|Fit)$/, 'primitive'],
];
const kindOf = (name) => (KINDS.find(([pattern]) => pattern.test(name)) ?? [null, 'primitive'])[1];

// The exported surface is the catalogue's boundary — an internal helper that
// happens to live in the folder is not something a deck may reach for.
async function exportedNames() {
  const source = await readFile(indexPath, 'utf8');
  return [...source.matchAll(/export \{ (\w+) \} from '\.\/components\/slides\/(\w+)\.jsx'/g)]
    .map(([, name, file]) => ({ name, file }));
}

// The first paragraph of the docstring, minus the "LDS Slides — Name" heading:
// one prose statement of what the thing is for. Later paragraphs are rationale
// for whoever edits the component, not for whoever composes a deck.
function useFor(source, name) {
  const doc = source.match(/\/\*\*([\s\S]*?)\*\//);
  if (!doc) return '';
  const body = doc[1]
    .split('\n')
    .map((line) => line.replace(/^\s*\*ss?/, '').replace(/^\s*\*/, '').trim())
    .join('\n');
  const withoutHeading = body.replace(new RegExp(`^\\s*LDS Slides\\s*—\\s*${name}\\s*`), '').trim();
  const [first] = withoutHeading.split(/\n\s*\n/);
  return (first || '').replace(/\s+/g, ' ').trim();
}

// Props come from the destructured signature, so the list cannot drift from
// what the component actually accepts.
function propsOf(source, name) {
  const signature = source.match(new RegExp(`export function ${name}\\s*\\(\\s*\\{([\\s\\S]*?)\\}\\s*\\)\\s*\\{`));
  if (!signature) return [];
  return signature[1]
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, '').trim())
    .filter((line) => line && !line.startsWith('//'))
    .join(' ')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => !entry.startsWith('...'))
    .map((entry) => {
      const [rawName, ...rest] = entry.split('=');
      const propName = rawName.trim();
      const fallback = rest.join('=').trim();
      return fallback ? { name: propName, default: fallback } : { name: propName };
    })
    .filter((prop) => /^[a-zA-Z]\w*$/.test(prop.name))
    .filter((prop) => !['style'].includes(prop.name));
}

// Data attributes are the contract play assertions and gates hook onto, so they
// are part of the public surface whether or not anyone documents them.
function dataAttributes(source) {
  return [...new Set([...source.matchAll(/\bdata-([a-z][a-z0-9-]*)\b/g)].map(([, attribute]) => `data-${attribute}`))]
    .sort();
}

const exports_ = await exportedNames();
const entries = [];
for (const { name, file } of exports_) {
  const source = await readFile(path.join(componentsDir, `${file}.jsx`), 'utf8');
  entries.push({
    name,
    kind: kindOf(name),
    useFor: useFor(source, name),
    props: propsOf(source, name),
    dataAttributes: dataAttributes(source),
  });
}

const catalogue = {
  $comment: 'Generated by scripts/generate-catalogue.mjs from src/. Do not edit by hand.',
  package: JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).name,
  rules: RULES,
  tokens: {
    canvas: ['--slides-canvas-width', '--slides-canvas-max-width', '--slides-aspect', '--slides-safe-x', '--slides-safe-y'],
    ramp: ['--slides-display-*', '--slides-title-*', '--slides-body-*', '--slides-caption-*', '--slides-fine-*'],
    presets: ['keynote (:root default)', 'briefing (data-slides-preset)'],
    editorialSeam: ['--editorial-value-*', '--editorial-claim-*', '--editorial-note-*', '--editorial-note-body-*', '--editorial-caption-*'],
  },
  layouts: entries.filter((entry) => entry.kind === 'layout'),
  primitives: entries.filter((entry) => entry.kind === 'primitive'),
  deck: entries.filter((entry) => entry.kind === 'deck'),
};

const serialised = `${JSON.stringify(catalogue, null, 2)}\n`;

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = await readFile(cataloguePath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (current !== serialised) {
    console.error(
      'catalogue.json is stale — regenerate it with `npm run generate:catalogue` and commit the diff.\n'
      + 'It is generated from the component docstrings and signatures, so a stale file means the '
      + 'catalogue and the code disagree about what a deck may use.'
    );
    process.exitCode = 1;
  } else {
    console.log(
      `✓ catalogue: ${catalogue.layouts.length} layouts, ${catalogue.primitives.length} primitives, `
      + `${catalogue.deck.length} deck components — matches source.`
    );
  }
} else {
  await writeFile(cataloguePath, serialised, 'utf8');
  console.log(
    `Generated catalogue.json: ${catalogue.layouts.length} layouts, ${catalogue.primitives.length} primitives, `
    + `${catalogue.deck.length} deck components.`
  );
}
