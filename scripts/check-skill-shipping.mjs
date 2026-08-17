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

if (problems.length > 0) {
  console.error(`Deck skill shipping check failed:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('Deck skill ships whole and single: 3 files under docs/agent-skills/lds-deck, one copy of the rules.');
