// /api/unfurl?url=...        -> JSON preview details for a web page
// /api/unfurl?url=...&img=1  -> the image itself, so the page can save it to your photo storage
// Only works for the signed-in owner: every request must carry their Supabase sign-in token.
import { parsePage } from "../lib/parse.mjs";

const SUPABASE_URL = "https://dtdyytsihugonklhjody.supabase.co";
const SUPABASE_KEY = "sb_publishable_cxaL0feQdIXyjaHToLZUeQ_AuhGDU07"; // public key; the token check below is what matters
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function safeTarget(raw) {
  let u;
  try { u = new URL(raw); } catch (e) { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const h = u.hostname.toLowerCase();
  // Never fetch private or internal addresses.
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || /^\[|^\d+\.\d+\.\d+\.\d+$/.test(h)) return null;
  return u;
}

async function signedIn(req) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${token}` } });
  return r.ok;
}

async function fetchCapped(url, maxBytes, accept) {
  const r = await fetch(url, { headers: { "user-agent": UA, accept, "accept-language": "en-US,en;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(12000) });
  const final = safeTarget(r.url);
  if (!final) throw new Error("redirected somewhere not allowed");
  const reader = r.body.getReader();
  const chunks = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) { reader.cancel(); break; }
    chunks.push(value);
  }
  return { res: r, finalUrl: r.url, body: Buffer.concat(chunks.map((c) => Buffer.from(c))) };
}

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const target = safeTarget(q.get("url") || "");
  if (!target) return json({ error: "That doesn't look like a web link." }, 400);
  if (!(await signedIn(req))) return json({ error: "Sign in to use this." }, 401);

  try {
    if (q.get("img")) {
      const { res, body } = await fetchCapped(target.href, 12_000_000, "image/avif,image/webp,image/*,*/*;q=0.8");
      const type = (res.headers.get("content-type") || "").split(";")[0];
      if (!res.ok || !type.startsWith("image/")) return json({ error: "Couldn't get that image." }, 502);
      return new Response(body, { headers: { "content-type": type, "cache-control": "no-store" } });
    }
    const { res, finalUrl, body } = await fetchCapped(target.href, 2_000_000, "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8");
    if (!res.ok) return json({ error: `That page answered with an error (${res.status}).` }, 502);
    const info = parsePage(body.toString("utf8"), finalUrl);
    return json({ ...info, url: finalUrl });
  } catch (e) {
    return json({ error: "Couldn't read that page. Some sites block this." }, 502);
  }
};

export const config = { path: "/api/unfurl" };
