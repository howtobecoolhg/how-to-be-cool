import { attrs, content, cx, esc, raw, type Attrs, type Content, type Html } from "../html.ts";

export interface CardProps {
  title: Content;
  /** Small muted line under the title, like "Eat · Brooklyn". */
  meta?: Content;
  /** Photo URL. Without one the tile shows the title in big display type. */
  image?: string;
  imageAlt?: string;
  /** Ink tile (default) or paper tile when there is no image. */
  tone?: "ink" | "paper";
  /** "quote" is the black words card with a byline in meta. */
  variant?: "default" | "quote";
  /** Renders an <a>. Otherwise a <button> (cards open a window in the guide). */
  href?: string;
  className?: string;
  attrs?: Attrs;
}

/** Feed card: framed tile with a photo or big display title, then a meta strip. Renders `.card`. */
export function card(p: CardProps): Html {
  const tag = p.href === undefined ? "button" : "a";
  const a = attrs({ href: p.href, type: tag === "button" ? "button" : undefined, ...p.attrs });

  if (p.variant === "quote") {
    const by = p.meta === undefined ? "" : `<br><small>- ${content(p.meta)}</small>`;
    return raw(`<${tag} class="${cx("card quote", p.className)}"${a}>"${content(p.title)}"${by}</${tag}>`);
  }

  const tile =
    p.image !== undefined
      ? `<div class="thumb"><img src="${esc(p.image)}" alt="${esc(p.imageAlt ?? "")}" loading="lazy"></div>`
      : `<div class="${cx("thumb", "text", p.tone === "paper" && "paper")}"><div class="big">${content(p.title)}</div></div>`;
  const title = p.image !== undefined ? `<b>${content(p.title)}</b>` : "";
  const meta = p.meta === undefined ? "" : `<small>${content(p.meta)}</small>`;
  return raw(
    `<${tag} class="${cx("card", p.className)}"${a}>${tile}<div class="meta">${title}${meta}</div></${tag}>`,
  );
}

export interface BoxProps {
  title: Content;
  /** Muted text on the right of the heading strip, like a count. */
  sub?: Content;
  body: Content;
  className?: string;
}

/** Framed panel with a tiny uppercase heading strip. Renders `section.box`. */
export function box(p: BoxProps): Html {
  const sub = p.sub === undefined ? "" : `<span class="sub">${content(p.sub)}</span>`;
  return raw(
    `<section class="${cx("box", p.className)}"><h2>${content(p.title)}${sub}</h2><div class="bd">${content(p.body)}</div></section>`,
  );
}
