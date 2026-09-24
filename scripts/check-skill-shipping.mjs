/**
 * The deck skill ships to consumers, and it must ship WHOLE and SINGLE.
 *
 * Whole: `files` carries `docs`, so everything under docs/agent-skills reaches
 * an installed package — but only if it is actually there. A skill whose
 * references are missing from the tarball is worse than no skill: the consumer
 * agent loads a workflow that points at rules it cannot read.
 *
 * Single: the repo-side skill (.claude/skills/lds-deck) and the shipped one
 * read the SAME two reference files. A copy under .claude would drift the
 * moment one side is edited — the same reason catalogue.json is generated from
 * source rather than hand-written.
 */
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const shipped = path.join(root, 'docs', 'agent-skills', 'lds-deck');
const repoSkill = path.join(root, '.claude', 'skills', 'lds-deck');
const problems = [];

const exists = async (target) => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};

const REQUIRED = [
  path.join(shipped, 'SKILL.md'),
  path.join(shipped, 'references', 'content-rules.md'),
  path.join(shipped, 'references', 'components.md'),
];
for (const file of REQUIRED) {
  if (!(await exists(file))) problems.push(`missing: ${path.relative(root, file)}`);
}

// The published surface is what `files` declares; docs must stay in it or the
// skill silently stops shipping.
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (!(pkg.files ?? []).includes('docs')) {
  problems.push('package.json files must include "docs" — the skill ships inside it.');
}

// No second copy of the rules.
if (await exists(path.join(repoSkill, 'references'))) {
  problems.push('.claude/skills/lds-deck/references exists — the rules must have exactly one copy, under docs/agent-skills/lds-deck/references.');
}

// Both skills must declare the same trigger name, or a consumer copying the
// directory ends up with a skill the agent never fires.
for (const file of [path.join(shipped, 'SKILL.md'), path.join(repoSkill, 'SKILL.md')]) {
  if (!(await exists(file))) continue;
  const front = (await readFile(file, 'utf8')).split('---')[1] ?? '';
  if (!/^\s*name:\s*lds-deck\s*$/m.test(front)) {
    problems.push(`${path.relative(root, file)}: frontmatter name must be lds-deck.`);
  }
}

// The repo skill must reach the shared references, and every link it declares
// must resolve — a rotted link is a rule nobody reads.
const repoSkillFile = path.join(repoSkill, 'SKILL.md');
if (await exists(repoSkillFile)) {
  const source = await readFile(repoSkillFile, 'utf8');
  const links = [...source.matchAll(/\]\((\.\.[^)]+\.md)\)/g)].map((match) => match[1]);
  if (links.length === 0) {
    problems.push('.claude/skills/lds-deck/SKILL.md must link the shared references, not carry its own.');
  }
  for (const link of new Set(links)) {
    if (!(await exists(path.resolve(repoSkill, link)))) {
      problems.push(`.claude/skills/lds-deck/SKILL.md: broken reference link ${link}`);
    }
  }
}

// CURRENT, not only whole and single. The skill teaches by example, and its
// JSX examples restate prop names the components own — an example with a
// renamed or retired prop keeps teaching it to every consumer agent (the
// `label=` examples outlived the aria-label rename that way). Every
// catalogue component written as JSX in a shipped doc may use only the
// props the catalogue lists for it (own + inherited), never a deprecated one.
const catalogue = JSON.parse(await readFile(path.join(root, 'catalogue.json'), 'utf8'));
const entries = [
  ...catalogue.layouts, ...catalogue.primitives, ...catalogue.deck, ...(catalogue.editorial ?? []),
];
const allowedFor = new Map(entries.map((entry) => {
  const own = entry.props.filter((prop) => !prop.deprecated).map((prop) => prop.name);
  const deprecated = entry.props.filter((prop) => prop.deprecated).map((prop) => prop.name);
  // `forwardsTo` means ...rest reaches an upstream component whose props this
  // catalogue cannot list — unknown names are allowed there, deprecated ones
  // still are not.
  return [entry.name, { allowed: new Set([...own, ...(entry.inherits?.props ?? [])]), deprecated: new Set(deprecated), open: Boolean(entry.forwardsTo) }];
}));
const ALWAYS = new Set(['key', 'children', 'style', 'className', 'id', 'ref']);
const TAUGHT = [
  path.join(shipped, 'SKILL.md'),
  path.join(shipped, 'references', 'components.md'),
  path.join(shipped, 'references', 'content-rules.md'),
  path.join(root, 'docs', 'AGENT_SKILL_REFERENCE.md'),
];

// Attribute names of one JSX opening tag, top level only — an attribute of a
// nested element inside `{...}` belongs to that element, not this one.
function topLevelAttributes(tag) {
  const names = [];
  let depth = 0;
  let quote = null;
  for (let i = 0; i < tag.length; i += 1) {
    const c = tag[i];
    if (quote) { if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth += 1;
    else if (c === '}') depth -= 1;
    else if (depth === 0 && /\s/.test(c)) {
      const match = /^([A-Za-z_][\w-]*)(?=\s*=|\s|\/|>|$)/.exec(tag.slice(i + 1));
      if (match) names.push(match[1]);
    }
  }
  return names;
}

function openingTags(source, name) {
  const tags = [];
  const pattern = new RegExp(`<${name}\\b`, 'g');
  let match;
  while ((match = pattern.exec(source))) {
    let depth = 0;
    let quote = null;
    let end = match.index + match[0].length;
    for (; end < source.length; end += 1) {
      const c = source[end];
      if (quote) { if (c === quote) quote = null; continue; }
      if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
      if (c === '{') depth += 1;
      else if (c === '}') depth -= 1;
      else if (c === '>' && depth === 0) break;
    }
    tags.push(source.slice(match.index + match[0].length, end));
  }
  return tags;
}

for (const file of TAUGHT) {
  if (!(await exists(file))) continue;
  const text = await readFile(file, 'utf8');
  const code = [...text.matchAll(/```(?:jsx|tsx|js)?\r?\n([\s\S]*?)```/g)].map((block) => block[1]).join('\n');
  for (const [name, { allowed, deprecated, open }] of allowedFor) {
    for (const tag of openingTags(code, name)) {
      for (const attribute of topLevelAttributes(tag)) {
        if (ALWAYS.has(attribute) || attribute.startsWith('data-') || attribute.startsWith('aria-')) continue;
        if (deprecated.has(attribute)) {
          problems.push(`${path.relative(root, file)}: <${name} ${attribute}=…> teaches a deprecated prop.`);
        } else if (!allowed.has(attribute) && !open) {
          problems.push(`${path.relative(root, file)}: <${name} ${attribute}=…> — ${name} has no such prop in catalogue.json.`);
        }
      }
    }
  }
}

// The thresholds the prose teaches are the gates' thresholds. The docs keep
// the numbers because a rule with its reason reads better than a pointer,
// so the numbers are held to the one module the gates read.
const { CONTENT, FIGURE } = await import('./_thresholds.mjs');
const THRESHOLD_PROSE = [
  ...TAUGHT,
  path.join(root, 'README.md'),
];
const expectEach = (text, file, pattern, expected, what) => {
  for (const match of text.matchAll(pattern)) {
    if (Number(match[1]) !== expected) {
      problems.push(`${path.relative(root, file)}: "${match[0]}" — ${what} is ${expected} in scripts/_thresholds.mjs.`);
    }
  }
};
for (const file of THRESHOLD_PROSE) {
  if (!(await exists(file))) continue;
  const text = await readFile(file, 'utf8');
  expectEach(text, file, /\*\*(\d+)자 안\*\*/g, CONTENT.governingChars, 'the governing cap');
  expectEach(text, file, /1문장 ≤(\d+)자/g, CONTENT.governingChars, 'the governing cap');
  expectEach(text, file, /한 문장·(\d+)자/g, CONTENT.governingChars, 'the governing cap');
  expectEach(text, file, /불릿 상한[^\d\n]{0,4}(\d+)/g, CONTENT.bullets, 'the bullet cap');
  expectEach(text, file, /불릿 ≤(\d+)/g, CONTENT.bullets, 'the bullet cap');
  expectEach(text, file, /본문 ≤(\d+)자/g, CONTENT.bodyCap.present, 'the present body cap');
  expectEach(text, file, /StatementSlide[^\n]{0,20}?(?:최대|≤)\s?(\d+)/g, CONTENT.statementBudget, 'the statement budget');
  expectEach(text, file, /부여 폭의 (\d+)%/g, Math.round(FIGURE.minimumFill * 100), 'the figure fill floor');
}

if (problems.length > 0) {
  console.error(`Deck skill shipping check failed:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('Deck skill ships whole, single and current: 3 files under docs/agent-skills/lds-deck, one copy of the rules, examples use catalogue props, taught thresholds match the gates.');
