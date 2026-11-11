"""Turn the exported guide data (site/export/<collection>/<id>.json) into site/supabase/import.sql.

Usage: python3 -I tools/make_import.py
Re-export first (ArtifactData list with out_dir=site/export) if the claude.ai guide has changed.
"""
import glob, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rows = []
for col in ("items", "outfits", "lists", "categories"):
    for f in sorted(glob.glob(os.path.join(ROOT, "site", "export", col, "*.json"))):
        d = json.load(open(f))
        d.pop("id", None)
        j = json.dumps(d, ensure_ascii=False)
        assert "$j$" not in j
        rows.append(f"('{col}', '{os.path.basename(f)[:-5]}', $j${j}$j$::jsonb)")
sql = ("-- How to Be Cool: your data. Paste into Supabase > SQL Editor and Run, after schema.sql.\n"
       "-- Safe to re-run: existing rows are replaced with these versions.\n"
       "insert into public.docs (collection, id, data) values\n" + ",\n".join(rows) +
       "\non conflict (collection, id) do update set data = excluded.data, updated_at = now();\n")
open(os.path.join(ROOT, "site", "supabase", "import.sql"), "w").write(sql)
print(f"{len(rows)} rows -> site/supabase/import.sql")
