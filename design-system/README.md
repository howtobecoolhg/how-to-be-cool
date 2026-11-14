# How To Be Cool Club design system

Tokens, CSS and HTML components for the guide, written in TypeScript. Everything here was taken from
what the site already looks like (pink newsprint paper, black ink, one green for display headlines,
Bowlby One + IBM Plex Mono, 1.5px ink rules, pill buttons, hard offset shadows), so adopting it
changes nothing visually.

## What's in it

| File | What it is |
| --- | --- |
| `src/tokens.ts` | The source of truth: color, type, spacing, radius, borders, shadows, layout, breakpoints. |
| `src/css.ts` | Turns the tokens into CSS custom properties (`--paper`, `--ink`, `--space-4`, ...). |
| `src/components/*.ts` | `button`, `chip`, `field`, `softSearch`, `card`, `box`, `badge`. Each returns escaped HTML with the guide's existing class names, so it drops into the page's template strings. |
| `src/components.css` | The styles for those components, written against the tokens. |
| `scripts/sync.ts` | Writes the token `:root` block into `guide.html` and `site/index.html`. |
| `scripts/build.ts` | Emits `dist/` (JS + types, `tokens.css`, `htbc.css`, `tokens.json`, `specimen.html`). |

## Commands (from this folder, Node 22.18+)

```sh
npm install
npm run sync        # after editing src/tokens.ts: updates guide.html and site/index.html
npm test            # component output + checks the guide is in sync and every var() it uses exists
npm run typecheck
npm run build       # dist/, including dist/specimen.html to eyeball everything
```

## Using it

```ts
import { button, field, card, badge, color } from "@htbc/design-system";

const html = `
  ${button({ label: "+ Add", variant: "primary" })}
  ${field({ id: "eTitle", label: "Name", value: item.title })}
  ${card({ title: item.title, meta: "Eat · Brooklyn", image: photoUrl })}
  ${badge("Done", "done")}`;
```

Plain strings are always escaped. Wrap pre-rendered HTML in `raw()` to nest components.

Because the components are just class names plus CSS variables, a PHP page can use `dist/htbc.css`
and write the same markup (`<button class="pill lime">`, `<div class="field">`, ...).

## Rules of the look

- Paper is pink (`--paper`), everything else is ink (`--ink`). Green (`--headline`) is only for
  Bowlby One display lines, never for text or buttons.
- Mono for all UI text. Labels, pills and box headings are uppercase with tracking.
- Borders are 1.5px ink. Pills are fully round; the primary `+ Add` button is square with a 4px bottom edge.
- Elevation is a hard offset ink shadow (`--shadow-pop`, `--shadow-window`), never a blur.
