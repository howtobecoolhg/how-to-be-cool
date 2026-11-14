import { attrs, content, cx, esc, raw, type Attrs, type Content, type Html } from "../html.ts";

interface Base {
  id: string;
  label: Content;
  name?: string;
  required?: boolean;
  hint?: Content;
  className?: string;
  attrs?: Attrs;
}

export interface TextFieldProps extends Base {
  kind?: "text";
  type?: "text" | "email" | "url" | "search" | "number" | "date" | "tel";
  value?: string | number;
  placeholder?: string;
  /** Id of a <datalist> with suggestions. */
  list?: string;
}

export interface TextAreaProps extends Base {
  kind: "textarea";
  value?: string;
  placeholder?: string;
  rows?: number;
}

export interface SelectProps extends Base {
  kind: "select";
  options: ReadonlyArray<string | { value: string; label: string }>;
  value?: string;
}

export type FieldProps = TextFieldProps | TextAreaProps | SelectProps;

function control(p: FieldProps): string {
  const common = {
    id: p.id,
    name: p.name ?? p.id,
    required: p.required,
    "aria-describedby": p.hint === undefined ? undefined : `${p.id}-hint`,
    ...p.attrs,
  };
  if (p.kind === "textarea") {
    return `<textarea${attrs({ ...common, placeholder: p.placeholder, rows: p.rows })}>${esc(p.value)}</textarea>`;
  }
  if (p.kind === "select") {
    const opts = p.options
      .map((o) => (typeof o === "string" ? { value: o, label: o } : o))
      .map((o) => `<option${attrs({ value: o.value, selected: o.value === p.value })}>${esc(o.label)}</option>`)
      .join("");
    return `<select${attrs(common)}>${opts}</select>`;
  }
  return `<input${attrs({ ...common, type: p.type ?? "text", value: p.value, placeholder: p.placeholder, list: p.list })}>`;
}

/** A labelled form field: uppercase mono label over a square, ink-bordered control. Renders `.field`. */
export function field(p: FieldProps): Html {
  const hint = p.hint === undefined ? "" : `<small class="hint" id="${esc(p.id)}-hint">${content(p.hint)}</small>`;
  return raw(
    `<div class="${cx("field", p.className)}"><label for="${esc(p.id)}">${content(p.label)}</label>${control(p)}${hint}</div>`,
  );
}

/** The rounded soft search box used on the home page. */
export function softSearch(p: { id: string; placeholder?: string; value?: string; attrs?: Attrs }): Html {
  return raw(
    `<input class="softsearch"${attrs({ id: p.id, type: "search", placeholder: p.placeholder, value: p.value, ...p.attrs })}>`,
  );
}
