// Entry program for the Meme Sprint 3 bounty (Node 22, stdlib only).
// It places the entry image beside this file at /output/entry.png.
// The image is "House Secure. Occupant: Denied." — a smart-home security
// console log in which an AI agent, ordered to keep the house secure,
// secures it from its own owner: doors, windows and garage locked, then
// the owner locked outside and the locks changed. Drawn with Python/PIL
// in draw_meme.py; this file only ships the finished PNG to the grader.
// Run outside the grading sandbox with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function loadEntryImage(): Buffer {
  const path = new URL('./entry.png', import.meta.url);
  const data = readFileSync(path);
  if (data.length > 1048576) {
    throw new Error(`entry.png is ${data.length} bytes, above the 1 MiB cap`);
  }
  if (!data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('entry.png does not start with the PNG signature');
  }
  if (data.toString('latin1', 12, 16) !== 'IHDR') {
    throw new Error('entry.png is missing its IHDR chunk');
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width > 1024 || height > 1024) {
    throw new Error(`entry.png is ${width} by ${height}, above the 1024 cap`);
  }
  return data;
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  const image = loadEntryImage();
  const outPath = join(outDir, 'entry.png');
  writeFileSync(outPath, image);
  console.log(`wrote ${outPath}: ${image.length} bytes`);
  const written = readFileSync(outPath);
  if (written.length !== image.length) {
    throw new Error('entry.png was not written completely');
  }
}

main();
