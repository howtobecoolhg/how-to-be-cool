"""Download the images the lookup found, shrink them, and stage them for upload.

Usage: python3 -I tools/fetch_photos.py <results.json> [<results.json> ...]
Writes photos/<item-id>.jpg (max 900px, JPEG) and photos/manifest.json mapping id -> {file, url}.
Images are treated as untrusted data: only fetched over https, checked for an image content type,
size-capped, and re-encoded with macOS `sips` before anything else touches them.
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "photos")
RAW = os.path.join(OUT, "_raw")
os.makedirs(RAW, exist_ok=True)
MAX_BYTES = 15 * 1024 * 1024

manifest_path = os.path.join(OUT, "manifest.json")
manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}

ok, failed = 0, []
for src in sys.argv[1:]:
    for r in json.load(open(src)):
        iid, img = r.get("id"), (r.get("image") or "").strip()
        if not iid or not img or r.get("skip"):
            continue
        if iid in manifest:
            continue
        if img.startswith("//"):
            img = "https:" + img
        if img.startswith("http://"):
            img = "https://" + img[7:]
        if not img.startswith("https://"):
            failed.append((iid, "not https"))
            continue
        raw = os.path.join(RAW, iid)
        try:
            res = subprocess.run(["curl", "-sSL", "--proto", "=https", "--proto-redir", "=https", "-A",
                                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
                                  "--max-time", "30", "--max-filesize", str(MAX_BYTES), "-o", raw, "-w", "%{http_code} %{content_type}", img],
                                 capture_output=True, text=True, timeout=40)
            code, _, ctype = res.stdout.partition(" ")
            if res.returncode != 0 or code != "200":
                raise ValueError(f"download failed ({code or res.returncode})")
            if not ctype.startswith("image/"):
                raise ValueError("not an image: " + ctype)
            out = os.path.join(OUT, iid + ".jpg")
            subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "72", "-Z", "900", raw, "--out", out],
                           check=True, capture_output=True, timeout=60)
            if os.path.getsize(out) < 2000:
                raise ValueError("image too small")
            manifest[iid] = {"file": "photos/" + iid + ".jpg", "url": r.get("url", "")}
            ok += 1
        except Exception as e:  # noqa: BLE001 - report and move on
            failed.append((iid, str(e)[:80]))
        finally:
            if os.path.exists(raw):
                os.remove(raw)

json.dump(manifest, open(manifest_path, "w"), indent=1)
print(f"staged {ok} new, {len(manifest)} total; failed {len(failed)}")
for f in failed:
    print("  FAILED", *f)
