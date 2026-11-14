import { attrs, content, cx, esc, raw, type Attrs, type Content, type Html } from "../html.ts";

export type ButtonVariant = "outline" | "primary" | "selected";
export type ButtonSize = "md" | "sm";

export interface ButtonProps {
  label: Content;
  /** outline: the standard pill. primary: the boxy + Add button with a heavy bottom edge. selected: a filled pill. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** For toggle pills (tabs, filters). Sets aria-pressed and the filled look. */
  pressed?: boolean;
  /** Small count after the label, like the number of items in a category. */
  count?: number;
  /** Renders an <a> instead of a <button>. */
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  attrs?: Attrs;
}

/** Pill button. Renders the guide's `.pill` markup. */
export function button(p: ButtonProps): Html {
  const variant = p.variant ?? "outline";
  const cls = cx(
    "pill",
    p.size === "sm" && "small",
    variant === "primary" && "lime",
    (variant === "selected" || p.pressed) && "on",
    p.className,
  );
  const inner = content(p.label) + (p.count === undefined ? "" : ` <span class="n">${esc(p.count)}</span>`);
  if (p.href !== undefined) {
    return raw(`<a class="${cls}" href="${esc(p.href)}"${attrs(p.attrs)}>${inner}</a>`);
  }
  return raw(
    `<button class="${cls}"${attrs({
      type: p.type ?? "button",
      "aria-pressed": p.pressed === undefined ? undefined : String(p.pressed),
      disabled: p.disabled,
      ...p.attrs,
    })}>${inner}</button>`,
  );
}

/** Small filter chip, like the Type and City chips on Browse. */
export function chip(p: { label: Content; count?: number; attrs?: Attrs }): Html {
  const n = p.count === undefined ? "" : ` <span class="n">${esc(p.count)}</span>`;
  return raw(`<button class="chip"${attrs({ type: "button", ...p.attrs })}>${content(p.label)}${n}</button>`);
}
