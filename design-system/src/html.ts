/** Escape text for HTML, same rules as the guide's own esc(). */
export const esc = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

/** Join class names, skipping empty ones. */
export const cx = (...names: Array<string | false | null | undefined>): string => names.filter(Boolean).join(" ");

export type Attrs = Record<string, string | number | boolean | null | undefined>;

/** Render extra attributes. `true` writes a bare attribute; false, null and undefined are skipped. */
export const attrs = (a: Attrs = {}): string =>
  Object.entries(a)
    .filter(([, v]) => v !== false && v !== null && v !== undefined)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
    .join("");

/**
 * Pre-rendered HTML that should not be escaped again (for example a component nested in another).
 * Plain strings passed to components are always escaped.
 */
export class Html {
  readonly html: string;
  constructor(html: string) {
    this.html = html;
  }
  toString(): string {
    return this.html;
  }
}
export const raw = (html: string): Html => new Html(html);
export type Content = string | number | Html | null | undefined;
export const content = (c: Content): string => (c instanceof Html ? c.html : esc(c));
