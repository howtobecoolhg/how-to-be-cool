import { test } from "node:test";
import assert from "node:assert/strict";
import { badge, box, button, card, chip, field, raw } from "../src/index.ts";

test("button renders the guide's pill classes", () => {
  assert.equal(String(button({ label: "Browse" })), '<button class="pill" type="button">Browse</button>');
  assert.equal(
    String(button({ label: "+ Add", variant: "primary", size: "sm" })),
    '<button class="pill small lime" type="button">+ Add</button>',
  );
  assert.equal(
    String(button({ label: "Feed", pressed: true, count: 3 })),
    '<button class="pill on" type="button" aria-pressed="true">Feed <span class="n">3</span></button>',
  );
  assert.equal(String(button({ label: "Lists", href: "#lists" })), '<a class="pill" href="#lists">Lists</a>');
});

test("text is escaped, raw() is not", () => {
  assert.equal(String(button({ label: '<b>"hi"</b>' })), '<button class="pill" type="button">&lt;b&gt;&quot;hi&quot;&lt;/b&gt;</button>');
  assert.equal(String(box({ title: "T", body: raw("<p>ok</p>") })), '<section class="box"><h2>T</h2><div class="bd"><p>ok</p></div></section>');
});

test("field renders label, control and hint", () => {
  assert.equal(
    String(field({ id: "eTitle", label: "Name", value: "Lucali" })),
    '<div class="field"><label for="eTitle">Name</label><input id="eTitle" name="eTitle" type="text" value="Lucali"></div>',
  );
  const sel = String(field({ id: "c", label: "Cat", kind: "select", options: ["Eat", { value: "do", label: "Do" }], value: "do" }));
  assert.match(sel, /<option value="Eat">Eat<\/option><option value="do" selected>Do<\/option>/);
  const ta = String(field({ id: "n", label: "Notes", kind: "textarea", hint: "Private" }));
  assert.match(ta, /aria-describedby="n-hint"/);
  assert.match(ta, /<small class="hint" id="n-hint">Private<\/small>/);
});

test("card variants", () => {
  assert.equal(
    String(card({ title: "Lucali", meta: "Eat · Brooklyn", image: "a.jpg" })),
    '<button class="card" type="button"><div class="thumb"><img src="a.jpg" alt="" loading="lazy"></div><div class="meta"><b>Lucali</b><small>Eat · Brooklyn</small></div></button>',
  );
  assert.match(String(card({ title: "Museum", tone: "paper" })), /class="thumb text paper"><div class="big">Museum<\/div>/);
  assert.equal(String(card({ title: "Be cool", meta: "H", variant: "quote", href: "#q" })), '<a class="card quote" href="#q">"Be cool"<br><small>- H</small></a>');
});

test("badge and chip", () => {
  assert.equal(String(badge("Done", "done")), '<span class="badge done">Done</span>');
  assert.equal(String(badge("Want")), '<span class="badge">Want</span>');
  assert.equal(String(chip({ label: "NYC", count: 2 })), '<button class="chip" type="button">NYC <span class="n">2</span></button>');
});
