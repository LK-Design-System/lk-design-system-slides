/**
 * Deck image assets, measured (COMPLETENESS_AUDIT E2).
 *
 * The repository's entire image corpus was one placeholder SVG, so nothing had
 * ever tested the rules a real photo brings with it. Those rules are cheap to
 * state and were about to be learned the expensive way — the first field report
 * with six phone photos in it would have shipped a 40MB deck, or a 400px image
 * blown up across an 1100px exhibit.
 *
 * Three rules, each about a failure the author cannot see in Storybook on a
 * fast machine with a warm cache:
 *
 *   1. RESOLUTION FLOOR. A raster asset must be at least 2× the widest box it
 *      can be handed, because the canvas is 1280 design px and gets scaled UP
 *      on a projector. An ImageSlide photo can span the full content width
 *      (~1100), an ExhibitRow thumbnail about a third of it. Below the floor
 *      the projector magnifies the pixels, not the picture.
 *   2. WEIGHT CEILING. Per-asset and per-deck. A deck is emailed; the
 *      per-asset cap keeps one photo from dominating, and the deck cap is what
 *      an inbox actually accepts.
 *   3. NO STRAY ASSETS. Every file under a deck's assets/ is imported by a
 *      deck. An orphan is either a forgotten swap or a leak — and it ships,
 *      because the bundler is not the one deciding what belongs.
 *
 * SVG is exempt from the resolution floor (it has no resolution) but not from
 * the weight ceiling: an exported illustration with a thousand paths is heavy
 * in exactly the way a photo is.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const decksDir = path.join(root, 'stories', 'decks');
// 2× the widest box an asset can be handed on a 1280px canvas.
const MIN_RASTER_WIDTH = 2200;
const MAX_ASSET_BYTES = 2 * 1024 * 1024;
const MAX_DECK_BYTES = 8 * 1024 * 1024;
const RASTER = /\.(png|jpe?g|webp|avif)$/i;
const ASSET = /\.(png|jpe?g|webp|avif|svg|gif)$/i;

// PNG and JPEG dimensions from the header — no image library for a check that
// only needs two numbers.
function rasterSize(buffer) {
  if (buffer.length > 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      // SOF0..SOF15, excluding the DHT/DAC/DRI markers in that range.
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  return null;
}

async function walk(directory) {
  const found = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await walk(full));
    else found.push(full);
  }
  return found;
}

const deckSources = (await walk(decksDir)).filter((file) => file.endsWith('.jsx'));
const assets = (await walk(decksDir)).filter((file) => ASSET.test(file));
const sourceText = (await Promise.all(deckSources.map((file) => readFile(file, 'utf8')))).join('\n');

const problems = [];
let deckBytes = 0;

for (const asset of assets) {
  const relative = path.relative(root, asset).replace(/\\/g, '/');
  const info = await stat(asset);
  deckBytes += info.size;
  const name = path.basename(asset);

  if (!sourceText.includes(name)) {
    problems.push(`${relative} — 어느 덱도 import하지 않는다 (교체 후 남은 것이거나 유출). 지우거나 쓰거나.`);
  }
  if (info.size > MAX_ASSET_BYTES) {
    problems.push(`${relative} — ${(info.size / 1024 / 1024).toFixed(1)}MB, 자산 상한 ${MAX_ASSET_BYTES / 1024 / 1024}MB 초과.`);
  }
  if (RASTER.test(asset)) {
    const size = rasterSize(await readFile(asset));
    if (!size) {
      problems.push(`${relative} — 크기를 읽을 수 없다 (PNG/JPEG 헤더 아님).`);
    } else if (size.width < MIN_RASTER_WIDTH) {
      problems.push(
        `${relative} — 가로 ${size.width}px. 1280 캔버스가 투사에서 확대되므로 `
        + `가장 넓은 상자의 2배(${MIN_RASTER_WIDTH}px)가 하한이다.`,
      );
    }
  }
}

if (deckBytes > MAX_DECK_BYTES) {
  problems.push(`덱 자산 합계 ${(deckBytes / 1024 / 1024).toFixed(1)}MB — 회람 상한 ${MAX_DECK_BYTES / 1024 / 1024}MB 초과.`);
}

console.log(
  `Audited ${assets.length} deck asset(s), ${(deckBytes / 1024).toFixed(0)}KB total: `
  + `${problems.length === 0 ? 'all within contract' : `${problems.length} problem(s)`}.`,
);
if (problems.length > 0) {
  console.error(`Deck asset contract:\n- ${problems.join('\n- ')}`);
  process.exitCode = 1;
}
