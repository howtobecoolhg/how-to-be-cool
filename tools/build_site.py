"""Build the public website from guide.html.

Usage: python3 -I tools/build_site.py
Writes site/index.html and copies photos into site/photos/<asset-id>.jpg.
guide.html stays the single source for the design; this step only swaps the claude.ai pieces
(database, photos, sign-in, the "ask Claude to publish" list sharing) for their website versions.
"""
import json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "guide.html")).read()


def swap(text, old, new, count=1):
    assert old in text, f"build_site: pattern not found: {old[:70]}"
    return text.replace(old, new, count)


page = src
# Images: claude.ai serves assets at /_blob/<id>; the site uses photos/<id>.jpg or a full Supabase URL.
page = re.sub(r'/_blob/\$\{esc\((\w+\.img)\)\}', r'${esc(imgSrc(\1))}', page)
assert "/_blob/" not in page, "build_site: an image path was not converted"

# Lists: on the website every list is already public at its own link.
page = re.sub(
    r'Make a list for someone, like gift ideas for a friend\'s kid or your Austin favorites for a visitor\.[^<]*',
    "Make a list for someone, like gift ideas for a friend's kid or your Austin favorites for a visitor. "
    "Each list has its own link you can send.",
    page)
start = page.index('<section class="box"><h2>Share it')
end = page.index("</section>", start) + len("</section>")
page = page[:start] + '''<section class="box"><h2>Share it</h2><div class="bd" style="display:grid;gap:8px">
        <div>Send this link. It opens just this list:</div>
        <div style="background:var(--blush);border:1.5px dashed var(--ink);padding:6px 10px;font-weight:600;overflow-wrap:anywhere" id="askText">${esc(location.origin+location.pathname+"#list-"+l.id)}</div>
        <div class="row"><button class="pill small" type="button" id="copyAsk">Copy link</button></div>
      </div></section>''' + page[end:]
page = swap(page, 'const ask=`Publish my list "${l.name}" as a page I can share`;',
            'const ask=location.origin+location.pathname+"#list-"+l.id;')
page = swap(page, '''  const cu=$("#copyUrl"); if (cu) cu.onclick=()=>copy(l.sharedUrl,cu);\n''', "")
page = swap(page, '''<span>Delete this list?${l.sharedUrl?" Its shared page stays up until you ask Claude to take it down.":""}</span>''',
            '''<span>Delete this list? Its link will stop working.</span>''')
page = swap(page, '''const s=shareState(l), n=entriesOf(l).length;''', '''const n=entriesOf(l).length;''')
page = swap(page, ''' <span class="badge ${s.cls}">${s.word}</span></div></a>''', '''</div></a>''')

page = swap(page, "Open this page on claude.ai while signed in to see your guide.", "This page couldn't load its database script. Check your connection and reload.")
page = swap(page, "Sign in to claude.ai to see this guide.", "The guide's database isn't connected yet (see SETUP.md).")

# Sign-in strip styling (the strip itself is drawn by shim.js).
page = swap(page, ".foot{", "#authbar{max-width:1100px;margin:0 auto 28px;padding:0 max(16px,env(safe-area-inset-left,0px));font:500 11px var(--ui);color:var(--muted);text-align:center}\n"
            "#authbar input{border:1.5px solid var(--ink);background:#fff5fb;padding:3px 8px;font:inherit;color:var(--ink)}\n"
            "#authbar button{border:1.5px solid var(--ink);border-radius:999px;background:transparent;padding:3px 10px;font:inherit;color:var(--ink);cursor:pointer}\n"
            "#authbar label{text-transform:uppercase;letter-spacing:.08em}\n.foot{")

head = """<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Things to do, eat, buy and make.">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0}img{max-width:100%}[hidden]{display:none!important}</style>
<script src="config.js?v=__STAMP__"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
<script src="shim.js?v=__STAMP__"></script>
</head><body>
"""
import time
out = (head + page + "\n</body></html>\n").replace("__STAMP__", str(int(time.time())))
os.makedirs(os.path.join(ROOT, "site", "photos"), exist_ok=True)
open(os.path.join(ROOT, "site", "index.html"), "w").write(out)

m = json.load(open(os.path.join(ROOT, "photos", "manifest.json")))
n = 0
for iid, v in m.items():
    if v.get("asset"):
        dst = os.path.join(ROOT, "site", "photos", v["asset"] + ".jpg")
        if not os.path.exists(dst):
            shutil.copyfile(os.path.join(ROOT, v["file"]), dst)
        n += 1
open(os.path.join(ROOT, "site", "favicon.svg"), "w").write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#111" stroke="#111" stroke-width="2.4" stroke-linejoin="round" '
    'd="M4 3.5l4.6 4.6C9.7 7.7 10.8 7.5 12 7.5s2.3.2 3.4.6L20 3.5v9.2c0 4.9-3.4 7.8-8 7.8s-8-2.9-8-7.8z"/></svg>')
print(f"built site/index.html ({len(out)//1024} KB), {n} photos in site/photos")
