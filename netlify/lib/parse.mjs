// Reads a web page's preview details: Open Graph / Twitter tags plus schema.org JSON-LD.
// Pure function (no network) so it can be tested on its own.

const decode = (s) => String(s || "")
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\s+/g, " ").trim();

function metaTags(html) {
  const out = {};
  const re = /<meta\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const key = (tag.match(/\b(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i) || [])[1];
    const val = (tag.match(/\bcontent\s*=\s*"([^"]*)"/i) || tag.match(/\bcontent\s*=\s*'([^']*)'/i) || [])[1];
    if (key && val != null && !(key.toLowerCase() in out)) out[key.toLowerCase()] = decode(val);
  }
  return out;
}

function jsonLd(html) {
  const nodes = [];
  const re = /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  const walk = (x) => {
    if (!x || typeof x !== "object") return;
    if (Array.isArray(x)) return x.forEach(walk);
    if (x["@type"]) nodes.push(x);
    if (x["@graph"]) walk(x["@graph"]);
  };
  while ((m = re.exec(html))) {
    try { walk(JSON.parse(m[1].trim())); } catch (e) { /* skip broken blocks */ }
  }
  return nodes;
}

const types = (n) => [].concat(n["@type"] || []).map((t) => String(t).toLowerCase());
const first = (v) => (Array.isArray(v) ? v[0] : v);
const imgOf = (v) => { v = first(v); return typeof v === "string" ? v : (v && (v.url || v.contentUrl)) || ""; };

const EAT = ["restaurant", "foodestablishment", "cafeorcoffeeshop", "bakery", "barorpub", "fastfoodrestaurant", "icecreamshop", "winery", "brewery", "distillery"];
const DO = ["localbusiness", "store", "clothingstore", "bookstore", "museum", "touristattraction", "event", "park", "artgallery", "movietheater", "nightclub", "amusementpark", "sportsactivitylocation", "healthandbeautybusiness", "dayspa", "musicvenue"];
const TYPE_WORDS = { bakery: "bakery", cafeorcoffeeshop: "coffee", barorpub: "bar", icecreamshop: "ice cream", winery: "wine bar", brewery: "bar",
  clothingstore: "clothes", bookstore: "bookstore", museum: "exhibit", artgallery: "exhibit", movietheater: "movie", nightclub: "nightlife", park: "outdoors", event: "event", dayspa: "wellness" };

export function parsePage(html, pageUrl) {
  html = String(html || "").slice(0, 2_000_000);
  const meta = metaTags(html);
  const ld = jsonLd(html);
  const titleTag = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);

  const pick = (...keys) => { for (const k of keys) if (meta[k]) return meta[k]; return ""; };
  const node = ld.find((n) => types(n).some((t) => EAT.includes(t) || DO.includes(t) || ["product", "book", "movie", "tvseries", "musicalbum", "musicrecording", "musicgroup"].includes(t))) || null;
  const nt = node ? types(node) : [];

  let title = (node && decode(node.name)) || pick("og:title", "twitter:title") || titleTag;
  const site = pick("og:site_name", "application-name");
  // Drop " | Site Name" style suffixes.
  if (site && title.length > site.length + 3) title = title.replace(new RegExp(`\\s*[|\\-–—·:]\\s*${site.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i"), "");
  title = title.replace(/\s*[|–—]\s*(Home|Official Site|Official Website)\s*$/i, "").trim();
  // Long "Name | Site: Section" titles: keep the first part, minus trailing ISBN-style numbers.
  if (title.length > 40 && / \| /.test(title)) title = title.split(" | ")[0];
  title = title.replace(/:\s*\d{10,13}\s*$/, "").trim();
  // On a homepage, or when the title is generic, the site's own name is the better name.
  let isHome = false;
  try { isHome = /^\/?(index\.html?)?$/i.test(new URL(pageUrl).pathname); } catch (e) {}
  if (site && (isHome || /^(welcome|home|homepage|untitled)$/i.test(title) || title.length < 3)) title = site;
  // SHOUTED names read better in Title Case.
  if (title === title.toUpperCase() && /[A-Z]{3}/.test(title)) title = title.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());

  let image = pick("og:image:secure_url", "og:image", "og:image:url", "twitter:image", "twitter:image:src") || (node && imgOf(node.image)) || "";
  if (!image) image = (html.match(/<link[^>]+rel\s*=\s*["']image_src["'][^>]*href\s*=\s*["']([^"']+)/i) || [])[1] || "";
  if (!image) {
    // Last resort: the first big-looking photo on the page.
    const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
    for (const tag of imgs) {
      const src = (tag.match(/\b(?:data-src|src)\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
      const w = +((tag.match(/\bwidth\s*=\s*["']?(\d+)/i) || [])[1] || 0);
      if (!src || src.startsWith("data:") || /logo|icon|sprite|avatar|badge|pixel|spacer|\.svg|\.gif/i.test(src + tag)) continue;
      if (w && w < 300) continue;
      image = src; break;
    }
  }
  try { if (image) image = new URL(image, pageUrl).href; } catch (e) { image = ""; }

  const description = (node && decode(node.description)) || pick("og:description", "twitter:description", "description");

  let cat = "", type = "", city = "";
  const ogType = (meta["og:type"] || "").toLowerCase();
  if (nt.some((t) => EAT.includes(t))) {
    cat = "eat";
    const cuisine = first(node.servesCuisine);
    type = (cuisine && String(cuisine).toLowerCase()) || TYPE_WORDS[nt.find((t) => TYPE_WORDS[t])] || "restaurant";
  } else if (nt.includes("book") || ogType.startsWith("book")) { cat = "read"; type = "book"; }
  else if (nt.some((t) => ["movie", "tvseries"].includes(t)) || ogType.startsWith("video.")) { cat = "watch"; type = nt.includes("tvseries") || ogType === "video.tv_show" ? "show" : "movie"; }
  else if (nt.some((t) => t.startsWith("music")) || ogType.startsWith("music.")) { cat = "music"; type = "music"; }
  else if (nt.includes("product") || ogType === "product" || ogType === "og:product" || meta["product:price:amount"]) { cat = "wish"; }
  else if (nt.some((t) => DO.includes(t))) { cat = "do"; type = TYPE_WORDS[nt.find((t) => TYPE_WORDS[t])] || ""; }

  // No structured details: look for telltale words.
  const text = `${title} ${site} ${description}`.toLowerCase();
  const isbn = node && (node.isbn || (node.workExample && first(node.workExample).isbn));
  if ((cat === "wish" || !cat) && (isbn || /\b(isbn|hardcover|paperback|a novel)\b/.test(text) || /\/books?\//i.test(pageUrl))) { cat = "read"; type = "book"; }
  const FOOD = [["pizzeria", "pizza"], ["pizza", "pizza"], ["bakery", "bakery"], ["cookie", "bakery"], ["bagel", "bagels"], ["coffee", "coffee"], ["café", "coffee"], ["cafe", "coffee"],
    ["taqueria", "mexican"], ["taco", "mexican"], ["sushi", "sushi"], ["ramen", "ramen"], ["burger", "burger"], ["bbq", "bbq"], ["barbecue", "bbq"], ["diner", "diner"],
    ["deli", "deli"], ["wine bar", "wine bar"], ["cocktail", "bar"], ["tavern", "bar"], ["gastroteca", "italian"], ["trattoria", "italian"], ["osteria", "italian"],
    ["restaurant", "restaurant"], ["brunch", "breakfast"], ["reservations", "restaurant"], ["menu", "restaurant"]];
  const CUISINE = ["thai", "italian", "mexican", "chinese", "japanese", "korean", "indian", "greek", "french", "vietnamese", "taiwanese", "israeli", "persian", "cuban", "mediterranean", "middle eastern"];
  if (!cat || cat === "do") {
    const hit = FOOD.find(([w]) => new RegExp(`\\b${w}`).test(text));
    if (hit) {
      cat = "eat";
      if (!type) type = CUISINE.find((c) => new RegExp(`\\b${c}\\b`).test(text)) || hit[1];
    }
  }

  const addr = node && first(node.address);
  if (addr && typeof addr === "object") city = decode(addr.addressLocality || "");
  else if (node && node.location && first(node.location).address) city = decode(first(first(node.location).address).addressLocality || "");

  let price = "";
  const offer = node && first(node.offers);
  const amount = (offer && (offer.price || offer.lowPrice)) || meta["product:price:amount"] || meta["og:price:amount"];
  const cur = (offer && offer.priceCurrency) || meta["product:price:currency"] || meta["og:price:currency"] || "";
  if (amount) price = (/^usd$/i.test(cur) || !cur ? "$" : cur + " ") + String(amount).replace(/\.00$/, "");

  return { title: title.slice(0, 140), description: description.slice(0, 400), image, site, cat, type, city, price };
}
