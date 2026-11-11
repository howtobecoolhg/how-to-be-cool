"""Build a standalone, shareable page for one How to Be Cool list.

Usage: python3 make_list_page.py <list.json> <out.html>
<list.json> is a list document as ArtifactData writes it ({"id","data":{...}} or the bare data).
The page has no capabilities and no data beyond this one list.
"""
import json, sys, html, urllib.parse

CATS = {
    "gift": ("Gift guide", "#ff6f8f", "#d0104c"), "wish": ("Wish list", "#ff9fd0", "#c2187a"),
    "do": ("Things to do", "#b79bff", "#7a4dff"), "make": ("Things to make", "#ffe066", "#f5a300"),
    "eat": ("Places to eat", "#ff7ab8", "#ff2f86"), "read": ("Books to read", "#7fe0c0", "#1f9e7a"),
    "watch": ("What to watch", "#6fe3e0", "#138a8a"), "music": ("Music to play", "#9fd3ff", "#3a7bd5"),
    "people": ("People to know", "#ffb08a", "#ff6a3d"), "words": ("Words to live by", "#c6f26b", "#56a300"),
}
e = lambda s: html.escape(str(s or ""), quote=True)


def link_for(en):
    if en.get("link"):
        return en["link"]
    q = en["title"] + (" " + en["city"] if en.get("city") else "")
    if en.get("cat") in ("eat", "do") and en.get("city"):
        return "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote(q)
    return "https://www.google.com/search?q=" + urllib.parse.quote(q)


def main(src, out):
    raw = json.load(open(src))
    l = raw.get("data", raw)
    entries = l.get("entries") or []
    cards = []
    for en in entries:
        label, c1, c2 = CATS.get(en.get("cat"), ("", "#b79bff", "#7a4dff"))
        meta = " · ".join(e(x) for x in [en.get("type"), en.get("city")] if x)
        is_map = "maps/search" in link_for(en)
        cards.append(f"""<article class="card">
  <div class="tile" style="--c1:{c1};--c2:{c2}"><span>{e(en['title'])}</span></div>
  <div class="body">
    <h2>{e(en['title'])}</h2>
    {f'<p class="meta">{meta}</p>' if meta else ''}
    {f'<p class="note">{e(en.get("note"))}</p>' if en.get('note') else ''}
    <a class="pill" href="{e(link_for(en))}" target="_blank" rel="noopener">{'Open link' if en.get('link') else ('Find on map' if is_map else 'Look it up')}</a>
  </div>
</article>""")
    for_line = f"for {e(l.get('forWho'))}" if l.get("forWho") else ""
    page = f"""<title>{e(l.get('name'))}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shrikhand&family=Quicksand:wght@500;600;700&family=Silkscreen&display=swap">
<style>
/* Layout: one shareable list from How to Be Cool. Pale lime tartan, a pink header card, list cards in a grid. */
:root{{color-scheme:light;--plaid:#e2f7a6;--ink:#1a1420;--muted:#6d5a72;--pink:#ff4fa3;--hot:#e0007a;--blush:#ffe1ef;
  --display:"Shrikhand","Cooper Black",Georgia,serif;--ui:"Quicksand","Trebuchet MS",Verdana,sans-serif;--pixel:"Silkscreen","Courier New",monospace}}
*{{box-sizing:border-box}}
body{{background-color:var(--plaid);color:var(--ink);font:500 15px/1.5 var(--ui);
  background-image:repeating-linear-gradient(90deg,transparent 0 46px,rgba(26,20,32,.35) 46px 50px,transparent 50px 54px,rgba(255,255,255,.75) 54px 56px,transparent 56px 96px),
  repeating-linear-gradient(0deg,transparent 0 46px,rgba(26,20,32,.3) 46px 50px,transparent 50px 54px,rgba(255,255,255,.65) 54px 56px,transparent 56px 96px),
  repeating-linear-gradient(90deg,transparent 0 22px,rgba(40,80,200,.35) 22px 23px,transparent 23px 96px),
  repeating-linear-gradient(0deg,transparent 0 22px,rgba(40,80,200,.3) 22px 23px,transparent 23px 96px)}}
main{{max-width:980px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 48px;display:grid;gap:22px}}
.head{{background:#fff;border:3px solid var(--ink);box-shadow:8px 8px 0 var(--pink);padding:22px 22px 18px}}
.kicker{{font-family:var(--pixel);font-size:11px;letter-spacing:.5px;background:var(--plaid);border:2px solid var(--ink);display:inline-block;padding:1px 8px;transform:rotate(-2deg)}}
h1{{font:400 clamp(30px,6vw,46px)/1.05 var(--display);margin:12px 0 4px;color:var(--hot);text-wrap:balance}}
.for{{font-weight:700;margin:0}}
.intro{{margin:12px 0 0;font:400 19px/1.35 var(--display);max-width:60ch}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px}}
.card{{background:#fff;border:2px solid var(--ink);box-shadow:4px 4px 0 var(--pink);display:flex;flex-direction:column;min-width:0}}
.tile{{aspect-ratio:16/10;max-width:100%;display:grid;align-items:end;padding:12px;color:#fff;border-bottom:2px solid var(--ink);
  background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.55) 0 18%,transparent 19%),repeating-linear-gradient(90deg,rgba(255,255,255,.18) 0 3px,transparent 3px 14px),linear-gradient(160deg,var(--c1),var(--c2))}}
.tile span{{font:400 22px/1.05 var(--display);text-shadow:2px 2px 0 rgba(26,20,32,.6);overflow-wrap:anywhere}}
.body{{padding:12px 14px 14px;display:grid;gap:6px;align-content:start;flex:1}}
.body h2{{margin:0;font:700 16px/1.25 var(--ui)}}
.meta{{margin:0;color:var(--muted);font-size:13px;font-weight:600}}
.note{{margin:0;background:var(--blush);border-left:4px solid var(--pink);padding:6px 10px;font-weight:600}}
.pill{{justify-self:start;margin-top:4px;border:2px solid var(--ink);border-radius:999px;padding:4px 14px;font:700 12px var(--ui);color:var(--ink);text-decoration:none;
  background:linear-gradient(180deg,#fff 0%,#ffd6ea 50%,#ffb3d6 51%,#ffd0e6 100%);box-shadow:2px 2px 0 var(--ink)}}
.pill:focus-visible{{outline:3px solid #c9a7ff;outline-offset:2px}}
.foot{{text-align:center;font-family:var(--pixel);font-size:10px;background:#fff;border:2px solid var(--ink);justify-self:center;padding:3px 10px}}
</style>
<main>
  <header class="head">
    <span class="kicker">from how to be cool</span>
    <h1>{e(l.get('name'))}</h1>
    {f'<p class="for">{for_line}</p>' if for_line else ''}
    {f'<p class="intro">"{e(l.get("intro"))}"</p>' if l.get('intro') else ''}
  </header>
  <section class="grid" aria-label="The list">
    {''.join(cards) or '<p class="head">Nothing on this list yet.</p>'}
  </section>
  <p class="foot">{len(entries)} pick{'s' if len(entries) != 1 else ''} · made with love</p>
</main>
"""
    open(out, "w").write(page)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
