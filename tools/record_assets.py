"""Record uploaded asset ids into photos/manifest.json.

Pipe in the Artifact upload result text; every line like
  - "photos/<item-id>.jpg" (... bytes, image/jpeg) → "/_blob/<hex>" (id <hex>)
sets manifest[<item-id>]["asset"] = <hex>. Then prints the next batch of up to 25 files still to upload.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mp = os.path.join(ROOT, "photos", "manifest.json")
m = json.load(open(mp))
n = 0
for line in sys.stdin:
    hit = re.search(r'"photos/([^"]+)\.jpg".*\(id ([0-9a-f]{32})\)', line)
    if hit and hit.group(1) in m:
        m[hit.group(1)]["asset"] = hit.group(2)
        n += 1
json.dump(m, open(mp, "w"), indent=1)
todo = [v["file"] for v in m.values() if "asset" not in v]
print(f"recorded {n}; {sum('asset' in v for v in m.values())} uploaded; {len(todo)} to go")
print(json.dumps(todo[:25]))
