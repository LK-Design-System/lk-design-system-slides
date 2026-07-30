import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { closeServer, startStaticServer } from '../scripts/_storybook-static.mjs';

// agent-tests-the-guide — the harness that tests the AUTHORING GUIDE, not the
// components. (Shape borrowed from tahta's qa harness, MIT; adapted to this
// repository's story-based decks and gate chain.)
//
// The deck skill, content-rules, and catalogue.json exist so that an agent
// given only a BRIEF — no visual direction, no structural hints — produces a
// disciplined deck. The highest-leverage question is not "is the guide well
// written?" but "what does an uninstructed agent actually do when it reads
// it?". This harness answers it: fire a headless `claude -p` at a real brief,
// let it author stories/decks/qa-<brief>.stories.jsx against the installed
// guide, then grade the result with the same gates a human-authored deck
// faces, render a contact sheet, and (optionally) run a rubric critique.
//
// THE GATES ARE A FLOOR, NOT VALIDATION. A green run means "not obviously
// broken". Every run prints a ▶ REVIEW path — the deck is not reviewed until
// someone has walked the contact sheet against qa/rubric.md.
//
//   node qa/run.mjs --list                 # show briefs
//   node qa/run.mjs --brief pipeline-briefing
//   node qa/run.mjs --brief pipeline-briefing --critique
//   node qa/run.mjs --skip-author --brief … # regrade an existing qa- deck
//   node qa/run.mjs --keep                  # keep the generated deck file
//
// Everything lands in qa/out/<brief>/ (gitignored): the deck source copy, the
// authoring log, gate results, contact sheet, report.md, critique.md.

// Spawning a Windows `.cmd` shim with shell:false throws EINVAL on current
// Node (the CVE-2024-27980 hardening), and shell:true joins arguments without
// quoting. So: shell on, every argument kept to a single shell-safe token, and
// anything complex — the prompt above all — travels over STDIN instead of argv.
const run = (command, args, { cwd, input, timeoutMs } = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd, shell: true, windowsHide: true });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const timer = timeoutMs
    ? setTimeout(() => { child.kill(); reject(Object.assign(new Error(`timed out after ${timeoutMs}ms`), { stdout, stderr })); }, timeoutMs)
    : null;
  child.on('error', reject);
  child.on('close', (code) => {
    if (timer) clearTimeout(timer);
    if (code === 0) resolve({ stdout, stderr });
    else reject(Object.assign(new Error(`${command} exited ${code}`), { stdout, stderr, code }));
  });
  if (input !== undefined) child.stdin.write(input);
  child.stdin.end();
});

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const briefsDir = path.join(root, 'qa', 'briefs');
const outRoot = path.join(root, 'qa', 'out');
const decksDir = path.join(root, 'stories', 'decks');

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag) => {
  const at = argv.indexOf(flag);
  return at >= 0 ? argv[at + 1] : undefined;
};

const npmCommand = 'npm';
const claudeCommand = 'claude';

async function briefIds() {
  return (await readdir(briefsDir)).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
}

if (has('--list')) {
  console.log((await briefIds()).join('\n'));
  process.exit(0);
}

const requested = valueOf('--brief');
const ids = requested ? [requested] : await briefIds();

// The logistics footer is the only thing added to the brief. It names the
// output file and points at the guide — testing whether the DOCS land, not
// whether skill auto-discovery fires in headless mode. It gives no structural
// or visual direction; if the deck comes out undisciplined, the guide (or the
// gates) failed, and that is exactly the signal this harness exists to catch.
const logistics = (id) => `

---

산출 규칙 (로지스틱스):
- 작성 전에 .claude/skills/lds-deck/SKILL.md 와 그 references/, 그리고 catalogue.json 을 읽는다.
- 덱은 stories/decks/qa-${id}.stories.jsx 한 파일로 작성한다. meta title 은 'Decks/QA ${id}' 로 한다.
- 다른 파일은 만들지도 수정하지도 않는다. 개요 확인 단계는 생략하고 바로 조립한다.`;

async function author(id, briefText, outDir) {
  const prompt = briefText + logistics(id);
  console.log(`[${id}] authoring (headless claude)…`);
  const started = Date.now();
  const model = valueOf('--model');
  const args = [
    '-p',
    '--permission-mode', 'acceptEdits',
    '--allowedTools', 'Write', 'Read', 'Glob', 'Grep',
    ...(model ? ['--model', model] : []),
  ];
  const { stdout } = await run(claudeCommand, args, { cwd: root, input: prompt, timeoutMs: 15 * 60 * 1000 });
  await writeFile(path.join(outDir, 'authoring.log'), stdout, 'utf8');
  console.log(`[${id}] authored in ${Math.round((Date.now() - started) / 1000)}s`);
}

async function runGate(script, only, outDir, label) {
  try {
    const { stdout } = await run(npmCommand, ['run', script, '--', `--only=${only}`], { cwd: root, timeoutMs: 10 * 60 * 1000 });
    const line = stdout.split('\n').reverse().find((l) => /Audited|Measured|Ran /.test(l)) ?? 'ok';
    return { label, ok: true, line: line.trim() };
  } catch (error) {
    const text = `${error.stdout ?? ''}\n${error.stderr ?? ''}`;
    await writeFile(path.join(outDir, `${script}.log`), text, 'utf8');
    const detail = text.split('\n').filter((l) => /^\s+\[|clipped|FAIL/.test(l)).slice(0, 12).join('\n');
    return { label, ok: false, line: detail || 'failed — see log' };
  }
}

// Contact sheet: one PNG per slide, each captured FULLY REVEALED. Walking
// backwards does that for free — stepping into an earlier slide arrives at its
// end — so the walk goes End → ArrowLeft, shooting on each slide change, and
// the files are numbered from the progress counter so they read in order.
async function contactSheet(storyId, origin, outDir) {
  const dir = path.join(outDir, 'slides');
  await mkdir(dir, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${origin}/iframe.html?${new URLSearchParams({ id: storyId, viewMode: 'story' })}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-lds-slide-surface]', { timeout: 30000 });
    await page.waitForTimeout(400);

    const press = async (key) => {
      await page.evaluate((k) => {
        const deck = document.querySelector('[data-lds-deck-viewer]');
        deck?.focus();
        deck?.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
      }, key);
      await page.waitForTimeout(120);
    };
    const slideAt = () => page.evaluate(() => (
      document.querySelector('[data-deck-progress]')?.textContent ?? ''
    ).trim().split('·')[0].trim());

    const shoot = async () => {
      const at = await slideAt();
      const number = at.split('/')[0].trim().padStart(2, '0');
      const surface = await page.$('[data-lds-slide-surface]');
      await surface?.screenshot({ path: path.join(dir, `${number}.png`) });
      return at;
    };

    await press('End');
    let previous = await shoot();
    for (let guard = 0; guard < 400; guard += 1) {
      await press('ArrowLeft');
      const here = await slideAt();
      if (here !== previous) {
        previous = await shoot();
      } else if (await page.evaluate(() => document.querySelector('[data-deck-prev]')?.disabled)) {
        break;
      }
    }
    return dir;
  } finally {
    await browser.close();
  }
}

async function critique(id, deckFile, sheetDir, outDir) {
  console.log(`[${id}] critiquing against qa/rubric.md…`);
  const prompt = `qa/rubric.md 의 루브릭으로 이 덱을 심사하라. 덱 소스는 ${path.relative(root, deckFile)},`
    + ` 슬라이드 렌더링(전부 공개 상태)은 ${path.relative(root, sheetDir)}/ 의 PNG들이다 — 반드시 전부 읽어라.`
    + ' 차원마다 1-5 점수와, 슬라이드 번호가 붙은 구체적 약점을 적어라. "더 좋아질 수 있다"류의 모호한 지적은 금지.'
    + ' 출력은 마크다운으로만.';
  const { stdout } = await run(claudeCommand, ['-p', '--allowedTools', 'Read', 'Glob'], { cwd: root, input: prompt, timeoutMs: 10 * 60 * 1000 });
  await writeFile(path.join(outDir, 'critique.md'), stdout, 'utf8');
}

for (const id of ids) {
  const briefPath = path.join(briefsDir, `${id}.md`);
  const briefText = await readFile(briefPath, 'utf8');
  const outDir = path.join(outRoot, id);
  await mkdir(outDir, { recursive: true });

  const deckFile = path.join(decksDir, `qa-${id}.stories.jsx`);
  if (!has('--skip-author')) {
    await rm(deckFile, { force: true });
    await author(id, briefText, outDir);
  }

  let deckSource;
  try {
    deckSource = await readFile(deckFile, 'utf8');
  } catch {
    console.error(`[${id}] FAIL — the agent produced no ${path.relative(root, deckFile)}. The guide did not land.`);
    process.exitCode = 1;
    continue;
  }
  await writeFile(path.join(outDir, `qa-${id}.stories.jsx`), deckSource, 'utf8');

  // Decisions report — what the agent reached for, parsed from the source.
  // A variety proxy, not a verdict; the verdict is the rubric's.
  const used = [...new Set([...deckSource.matchAll(/<([A-Z]\w+Slide|Step|Fit)\b/g)].map((m) => m[1]))];
  const notes = (deckSource.match(/notes=/g) ?? []).length;
  const slides = (deckSource.match(/<\w+Slide\b/g) ?? []).length;

  console.log(`[${id}] building storybook…`);
  await run(npmCommand, ['run', 'build:storybook'], { cwd: root, timeoutMs: 10 * 60 * 1000 });

  const index = JSON.parse(await readFile(path.join(root, 'storybook-static', 'index.json'), 'utf8'));
  const storyIds = Object.values(index.entries)
    .filter((entry) => entry.type === 'story' && entry.id.startsWith(`decks-qa-${id}`))
    .map((entry) => entry.id);
  if (storyIds.length === 0) {
    console.error(`[${id}] FAIL — the deck file exists but no decks-qa-${id}* story rendered into the index.`);
    process.exitCode = 1;
    continue;
  }

  const gates = [];
  for (const [script, label] of [
    ['check:story-play', 'renders (play)'],
    ['check:slide-overflow', 'fits the canvas'],
    ['check:deck-content', 'content discipline'],
  ]) {
    // eslint-disable-next-line no-await-in-loop
    gates.push(await runGate(script, storyIds.join(','), outDir, label));
  }

  const staticServer = await startStaticServer(path.join(root, 'storybook-static'));
  let sheetDir = null;
  try {
    sheetDir = await contactSheet(storyIds[0], staticServer.origin, outDir);
  } finally {
    await closeServer(staticServer.server);
  }

  const report = [
    `# QA run — ${id}`,
    '',
    `- deck: \`${path.relative(root, deckFile)}\` (${slides} slides, ${notes} with notes)`,
    `- vocabulary used: ${used.join(', ') || '(none)'}`,
    '',
    '## Gates (floor, not validation)',
    '',
    ...gates.map((gate) => `- ${gate.ok ? '✓' : '✗'} ${gate.label}: ${gate.line.split('\n')[0]}${gate.ok ? '' : `\n\n\`\`\`\n${gate.line}\n\`\`\``}`),
    '',
    '## ▶ REVIEW',
    '',
    `Walk \`${path.relative(root, sheetDir ?? outDir)}/\` against \`qa/rubric.md\` — argument, variety, fit, polish,`
    + ' each scored with slide-numbered weaknesses. The deck is not reviewed until this is done.',
    '',
  ].join('\n');
  await writeFile(path.join(outDir, 'report.md'), report, 'utf8');

  if (has('--critique') && sheetDir) await critique(id, deckFile, sheetDir, outDir);

  const failed = gates.filter((gate) => !gate.ok);
  console.log(`[${id}] ${failed.length === 0 ? 'gates green' : `${failed.length} gate(s) FAILED`} — report: ${path.relative(root, path.join(outDir, 'report.md'))}`);
  if (failed.length > 0) process.exitCode = 1;

  if (!has('--keep')) {
    await rm(deckFile, { force: true });
    console.log(`[${id}] generated deck removed (source copy kept in qa/out; pass --keep to leave it in stories/decks).`);
  }
}
