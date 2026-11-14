/** A one-page specimen sheet of the tokens and components, rendered with the components themselves. */
import { badge, box, button, card, chip, color, displaySize, esc, field, fontSize, fontStylesheet, raw, softSearch, space } from "../src/index.ts";

const swatch = (name: string, value: string, note: string): string => `
  <div class="sw"><div class="chipc" style="background:${esc(value)}"></div>
    <div><b>--${esc(name)}</b><small>${esc(value)}<br>${esc(note)}</small></div></div>`;

const notes: Partial<Record<keyof typeof color, string>> = {
  paper: "Page background",
  paper2: "Hover, selected",
  ink: "Text, rules, fills",
  headline: "Display headlines only",
  muted: "Secondary text",
  field: "Inside form fields",
};

export function specimen(css: string): string {
  const swatches = (Object.keys(notes) as Array<keyof typeof color>)
    .map((k) => swatch(k.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), color[k], notes[k] ?? ""))
    .join("");

  const type = [
    `<div class="hero-title" style="margin:0">Cool Club</div><small>Display / hero · Bowlby One · ${esc(displaySize.hero)}</small>`,
    ...(["xl", "lg", "md", "sm"] as const).map(
      (k) => `<div class="display" style="font-size:var(--display-${k})">Things to do</div><small>display-${k} · ${esc(displaySize[k])}</small>`,
    ),
    ...(Object.entries(fontSize) as Array<[string, number]>)
      .reverse()
      .map(([k, v]) => `<div style="font-size:${v}px">Places to eat, gifts, wishes and outfits</div><small>text-${k} · IBM Plex Mono · ${v}px</small>`),
  ]
    .map((r) => `<div class="trow">${r}</div>`)
    .join("");

  const spacing = (Object.entries(space) as Array<[string, number]>)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `<div class="sp"><span style="width:${v}px"></span><small>space-${k} · ${v}px</small></div>`)
    .join("");

  const buttons = [
    button({ label: "+ Add", variant: "primary" }),
    button({ label: "Browse" }),
    button({ label: "Feed", pressed: true }),
    button({ label: "Eat", size: "sm", count: 42 }),
    button({ label: "Lists", size: "sm", href: "#lists" }),
    button({ label: "Disabled", disabled: true }),
    chip({ label: "Brooklyn", count: 12 }),
  ].join(" ");

  const inputs = [
    field({ id: "s-name", label: "Name", placeholder: "Lucali" }),
    field({ id: "s-cat", label: "Category", kind: "select", options: ["Eat", "Do", "Gifts", "Wishes"], value: "Eat" }),
    field({ id: "s-notes", label: "Notes", kind: "textarea", placeholder: "Get the calzone", hint: "Only you can see notes." }),
    raw(`<div class="field"><label for="s-soft">Soft search</label>${softSearch({ id: "s-soft", placeholder: "search the guide" })}</div>`),
  ].join("");

  const cards = [
    card({ title: "Pizza in Carroll Gardens", meta: "Eat · Brooklyn" }),
    card({ title: "Tiny museum day", meta: "Do · Manhattan", tone: "paper" }),
    card({ title: "Be cool, stay curious", meta: "Hayden", variant: "quote" }),
  ].join("");

  const badges = [badge("Want to"), badge("Done", "done"), badge("Maybe", "maybe"), badge("Nope", "nope")].join(" ");

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cool Club Specimen</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="${fontStylesheet}">
<style>
${css}
main{max-width:var(--max-width);margin:0 auto;padding:var(--space-10) var(--gutter) var(--space-11);display:grid;gap:var(--space-9)}
small{display:block;color:var(--muted);font-size:var(--text-label)}
.grid{display:grid;gap:var(--space-6);grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.sw{display:flex;gap:var(--space-5);align-items:center}
.chipc{width:56px;height:56px;border:var(--border-rule) solid var(--ink);flex:none}
.trow{padding:var(--space-4) 0;border-bottom:var(--border-hair) solid var(--ink);overflow-wrap:anywhere}
.trow:last-child{border-bottom:0}
.sp{display:flex;align-items:center;gap:var(--space-6);padding:3px 0}
.sp span{display:block;height:14px;background:var(--ink)}
.cards{display:grid;gap:var(--space-8);grid-template-columns:repeat(auto-fill,minmax(220px,1fr));align-items:start}
.row{display:flex;gap:var(--space-3);flex-wrap:wrap;align-items:center}
.stack{display:grid;gap:var(--space-7);max-width:420px}
</style></head><body><main>
<div><div class="hero-title">How to be cool</div><p style="margin:0">Design system specimen. Pink newsprint, black ink, one loud green.</p></div>
${box({ title: "Color", sub: "tokens.color", body: raw(`<div class="grid">${swatches}</div>`) })}
${box({ title: "Type", sub: "Bowlby One + IBM Plex Mono", body: raw(type) })}
${box({ title: "Spacing", sub: "tokens.space", body: raw(spacing) })}
${box({ title: "Button", sub: "button() · chip()", body: raw(`<div class="row">${buttons}</div>`) })}
${box({ title: "Input", sub: "field() · softSearch()", body: raw(`<div class="stack">${inputs}</div>`) })}
${box({ title: "Card", sub: "card() · box()", body: raw(`<div class="cards">${cards}</div>`) })}
${box({ title: "Badge", sub: "badge()", body: raw(`<div class="row">${badges}</div>`) })}
</main></body></html>
`;
}
