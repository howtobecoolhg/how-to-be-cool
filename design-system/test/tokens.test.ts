import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cssVariables, rootBlock } from "../src/index.ts";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("guide.html and site/index.html carry the current token block (run npm run sync)", () => {
  for (const f of ["guide.html", "site/index.html"]) {
    assert.ok(readFileSync(join(repo, f), "utf8").includes(rootBlock()), `${f} is out of date`);
  }
});

test("every var() the guide reads is defined by the tokens", () => {
  const defined = new Set(cssVariables().map(([n]) => n));
  const html = readFileSync(join(repo, "guide.html"), "utf8");
  // --c1/--c2 are per-tile inline variables, not tokens.
  const used = new Set([...html.matchAll(/var\(--([a-z0-9-]+)/g)].map((m) => m[1]!).filter((n) => n !== "c1" && n !== "c2"));
  const missing = [...used].filter((n) => !defined.has(n));
  assert.deepEqual(missing, []);
});

test("variable names are unique", () => {
  const names = cssVariables().map(([n]) => n);
  assert.equal(new Set(names).size, names.length);
});
