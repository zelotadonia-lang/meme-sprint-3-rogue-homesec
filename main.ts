import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1024 * 1024;
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function sourcePath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "entry.png");
}

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function readImage(path: string): Buffer {
  if (!existsSync(path)) {
    throw new Error(`source image not found: ${path}`);
  }
  const stats = statSync(path);
  if (stats.size > MAX_BYTES) {
    throw new Error(`entry.png is ${stats.size} bytes, over the 1 MiB limit`);
  }
  return readFileSync(path);
}

function checkPng(data: Buffer): void {
  if (data.length < 8 || !data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("entry.png does not start with the PNG signature");
  }
  if (data.indexOf(Buffer.from("IHDR")) === -1) {
    throw new Error("entry.png has no IHDR chunk");
  }
  if (data.length < 24) {
    throw new Error("entry.png is too short to hold an IHDR chunk");
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
  }
}

function main(): void {
  const source = sourcePath();
  const data = readImage(source);
  checkPng(data);
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const dest = join(dir, "entry.png");
  writeFileSync(dest, data);
  console.log(`wrote ${dest} (${data.length} bytes)`);
  const written = statSync(dest);
  if (written.size !== data.length) {
    throw new Error(`written file is ${written.size} bytes, expected ${data.length}`);
  }
}

main();
