import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

// Shared by capture-visual-smoke.mjs and check-story-play.mjs. Both need to
// serve `storybook-static` over http rather than file:// so that the preview's
// module graph and channel behave the way they do in a real browser session.

export function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.woff2')) return 'font/woff2';
  return 'application/octet-stream';
}

export function startStaticServer(staticDir) {
  const server = createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');
      const safePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '') || 'index.html';
      const filePath = path.resolve(staticDir, safePath);
      if (!filePath.startsWith(staticDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'content-type': contentType(filePath) });
      createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

export async function closeServer(server) {
  if (!server) return;
  await new Promise((resolve) => server.close(resolve));
}

/*
 * One seam that turns every runtime gate into a consumer tool
 * (COMPLETENESS_AUDIT G1).
 *
 * The gates measure a RENDERED deck, not a source tree, so nothing about them
 * requires the Storybook to be local — only the origin they fetch from. With
 * `LDS_SLIDES_ORIGIN` set, they skip the static server and audit whatever is at
 * that URL: a colleague's deployed Pages site, a preview build, a consumer
 * repository's own Storybook. `bin/lds-slides-check.mjs` is a thin wrapper over
 * exactly that.
 *
 * The alternative was a CLI that reimplemented the rules, which is how a rule
 * and its copy start disagreeing — the thing this repository spends its
 * duplication budget avoiding everywhere else.
 */
export async function openStorybook(staticDir) {
  const external = process.env.LDS_SLIDES_ORIGIN;
  if (external) {
    return { server: null, origin: external.replace(/\/+$/, ''), external: true };
  }
  return { ...await startStaticServer(staticDir), external: false };
}

export async function loadStoryIndex(origin, staticDir) {
  if (process.env.LDS_SLIDES_ORIGIN) {
    const response = await fetch(`${origin}/index.json`);
    if (!response.ok) {
      throw new Error(
        `${origin}/index.json is not reachable (${response.status}). `
        + 'Point LDS_SLIDES_ORIGIN at the root of a built Storybook.',
      );
    }
    return response.json();
  }
  const { readFile } = await import('node:fs/promises');
  return JSON.parse(await readFile(path.join(staticDir, 'index.json'), 'utf8'));
}
