/** Emits dist/tokens.css, dist/htbc.css, dist/tokens.json and dist/specimen.html. Run after tsc. */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rootBlock } from "../src/css.ts";
import { tokens } from "../src/tokens.ts";
import { specimen } from "./specimen.ts";

const pkg = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(pkg, "dist");
mkdirSync(dist, { recursive: true });

const tokensCss = rootBlock() + "\n";
const componentsCss = readFileSync(join(pkg, "src", "components.css"), "utf8");
const all = tokensCss + "\n" + componentsCss;

writeFileSync(join(dist, "tokens.css"), tokensCss);
writeFileSync(join(dist, "htbc.css"), all);
writeFileSync(join(dist, "tokens.json"), JSON.stringify(tokens, null, 2) + "\n");
writeFileSync(join(dist, "specimen.html"), specimen(all));
console.log("built dist/tokens.css, dist/htbc.css, dist/tokens.json, dist/specimen.html");
