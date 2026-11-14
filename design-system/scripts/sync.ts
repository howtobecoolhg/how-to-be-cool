/**
 * Writes the token :root block into the guide so tokens.ts stays the source of truth.
 * Usage (from design-system/): npm run sync        -> updates guide.html and site/index.html
 *                               npm run sync -- --check   -> exits 1 if either file is out of date
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rootBlock } from "../src/css.ts";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const targets = ["guide.html", "site/index.html"];
const check = process.argv.includes("--check");

const START = "/* tokens:start";
const END = "/* tokens:end */";
// Before the first sync the block is the hand-written one that defines --paper.
const LEGACY = /:root\{\n  color-scheme: light;\n(?:.*\n)*?  --paper:[\s\S]*?\n\}\n/;

export function replaceBlock(html: string, block: string): string {
  const s = html.indexOf(START);
  if (s !== -1) {
    const e = html.indexOf(END, s);
    if (e === -1) throw new Error("tokens:start without tokens:end");
    return html.slice(0, s) + block + html.slice(e + END.length);
  }
  if (!LEGACY.test(html)) throw new Error("could not find the :root token block");
  return html.replace(LEGACY, block + "\n");
}

let stale = 0;
const block = rootBlock();
for (const rel of targets) {
  const path = join(repo, rel);
  const before = readFileSync(path, "utf8");
  const after = replaceBlock(before, block);
  if (before === after) {
    console.log(`up to date  ${rel}`);
    continue;
  }
  stale++;
  if (check) console.log(`STALE       ${rel}`);
  else {
    writeFileSync(path, after);
    console.log(`updated     ${rel}`);
  }
}
if (check && stale) process.exit(1);
