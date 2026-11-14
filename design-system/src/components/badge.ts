import { content, cx, raw, type Content, type Html } from "../html.ts";

export type BadgeTone = "default" | "done" | "maybe" | "nope";

/** Tiny uppercase status pill. done = filled, maybe = dashed, nope = struck through. Renders `.badge`. */
export function badge(label: Content, tone: BadgeTone = "default"): Html {
  return raw(`<span class="${cx("badge", tone !== "default" && tone)}">${content(label)}</span>`);
}
