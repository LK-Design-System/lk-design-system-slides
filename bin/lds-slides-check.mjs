#!/usr/bin/env node
/**
 * lds-slides-check — the repository's runtime gates, pointed at someone else's
 * deck (COMPLETENESS_AUDIT G1).
 *
 * Until now the discipline shipped as prose and the enforcement stayed home:
 * a consumer got the components, the catalogue and the rules, and then checked
 * them by hand. The gates never needed the source tree — they measure a
 * RENDERED deck — so the only thing standing between them and a consumer was
 * the assumption that the Storybook is local. `LDS_SLIDES_ORIGIN` removes it,
 * and this command is the wrapper.
 *
 *   npx lds-slides-check https://acme.github.io/decks
 *   npx lds-slides-check http://localhost:6006 --only=overflow,content
 *
 * The URL is the ROOT of a built Storybook (the one with index.json), not a
 * story URL. Playwright's Chromium does the rendering and is an optional
 * dependency: this tool is useless without a browser, and a consumer who only
 * wants the components should not pay 300MB for one.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const scripts = path.join(here, '..', 'scripts');

const GATES = [
  { key: 'overflow', script: 'check-slide-overflow.mjs', title: '슬라이드가 캔버스를 넘지 않는가' },
  { key: 'content', script: 'check-deck-content.mjs', title: '내용 규율 (제목·주장·불릿·출처)' },
  { key: 'figure', script: 'check-figure-fill.mjs', title: '도판 폭·글자 배율·콜아웃' },
  { key: 'print', script: 'check-print-sheet.mjs', title: '인쇄 시트 (PDF 산출 전 검사)' },
];

const args = process.argv.slice(2);
const origin = args.find((argument) => /^https?:\/\//.test(argument));
const onlyArgument = args.find((argument) => argument.startsWith('--only='));
const only = onlyArgument ? onlyArgument.split('=')[1].split(',').map((key) => key.trim()) : null;

if (!origin || args.includes('--help') || args.includes('-h')) {
  console.log(`lds-slides-check — LDS Slides 게이트를 배포된 Storybook에 실행한다

  npx lds-slides-check <storybook-url> [--only=${GATES.map((gate) => gate.key).join(',')}]

URL은 스토리 주소가 아니라 빌드된 Storybook의 루트다 (index.json이 있는 곳).

게이트:
${GATES.map((gate) => `  ${gate.key.padEnd(9)} ${gate.title}`).join('\n')}`);
  process.exit(origin ? 0 : 1);
}

try {
  require.resolve('@playwright/test');
} catch {
  console.error(
    'Playwright가 필요하다 — 이 도구는 렌더된 덱을 재기 때문이다.\n'
    + '  npm i -D @playwright/test && npx playwright install chromium',
  );
  process.exit(1);
}

const selected = GATES.filter((gate) => !only || only.includes(gate.key));
if (selected.length === 0) {
  console.error(`--only에 해당하는 게이트가 없다. 가능한 값: ${GATES.map((gate) => gate.key).join(', ')}`);
  process.exit(1);
}

console.log(`Auditing ${origin} — ${selected.length} gate(s).\n`);

let failed = 0;
for (const gate of selected) {
  // Sequential on purpose: each gate drives a browser, and a consumer running
  // this on a laptop should not have four Chromiums competing for it.
  // eslint-disable-next-line no-await-in-loop
  const code = await new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(scripts, gate.script)], {
      stdio: 'inherit',
      env: { ...process.env, LDS_SLIDES_ORIGIN: origin },
    });
    child.on('close', resolve);
  });
  if (code !== 0) failed += 1;
  console.log('');
}

if (failed > 0) {
  console.error(`${failed} gate(s) failed.`);
  process.exit(1);
}
console.log('All gates passed.');
