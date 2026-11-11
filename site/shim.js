/* Stand-in for the claude.ai runtime, backed by Supabase.
   The guide page calls window.claude.use("db" | "user" | "assets"); this file answers those calls
   with a Supabase table (public.docs), Supabase Auth (email magic link) and Supabase Storage.
   Everyone can read. Only OWNER_EMAIL, signed in, can write (enforced by the database rules too). */
(function () {
  const cfg = window.HTBC_CONFIG || {};
  const ready = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const sb = ready ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const OWNER = String(cfg.OWNER_EMAIL || "").toLowerCase();

  // Photos: the original 124 ship with the site under photos/<id>.jpg; new uploads are full URLs.
  window.imgSrc = (v) => !v ? "" : (/^https?:\/\//.test(v) ? v : "photos/" + v + ".jpg");

  /* ---------- db ---------- */
  const caches = {};      // collection -> Map(id -> data)
  const listeners = {};   // collection -> Set(fn)
  const snap = (name) => {
    const docs = [...(caches[name] || new Map()).entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([id, data]) => ({ id, exists: true, data: () => data, metadata: { fromCache: false, hasPendingWrites: false } }));
    return { docs, size: docs.length, empty: !docs.length, metadata: { fromCache: false, hasPendingWrites: false }, docChanges: () => [] };
  };
  const emit = (name) => (listeners[name] || new Set()).forEach((fn) => { try { fn(snap(name)); } catch (e) { console.error(e); } });
  const err = (e) => ({ code: e?.code === "42501" ? "invalid_argument" : "unavailable", message: e?.message || String(e) });

  async function load(name) {
    const out = new Map();
    let from = 0;
    for (;;) {
      const { data, error } = await sb.from("docs").select("id,data").eq("collection", name).range(from, from + 999);
      if (error) throw error;
      data.forEach((r) => out.set(r.id, r.data || {}));
      if (data.length < 1000) break;
      from += 1000;
    }
    caches[name] = out;
  }
  function watch(name) {
    sb.channel("docs-" + name)
      .on("postgres_changes", { event: "*", schema: "public", table: "docs", filter: "collection=eq." + name }, (p) => {
        const c = caches[name] || (caches[name] = new Map());
        if (p.eventType === "DELETE") c.delete(p.old.id); else c.set(p.new.id, p.new.data || {});
        emit(name);
      })
      .subscribe();
  }
  async function write(name, id, data) {
    const { error } = await sb.from("docs").upsert({ collection: name, id, data, updated_at: new Date().toISOString() });
    if (error) throw err(error);
    (caches[name] || (caches[name] = new Map())).set(id, data);
    emit(name);
  }
  const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  function collection(name) {
    const docRef = (id = newId()) => ({
      id,
      path: name + "/" + id,
      async get() { const d = caches[name]?.get(id); return { id, exists: !!d, data: () => d, metadata: { fromCache: false } }; },
      set: (data) => write(name, id, JSON.parse(JSON.stringify(data))),
      async update(patch) {
        const cur = caches[name]?.get(id);
        if (!cur) throw { code: "invalid_argument", message: "Document does not exist" };
        return write(name, id, { ...cur, ...JSON.parse(JSON.stringify(patch)) });
      },
      async delete() {
        const { error } = await sb.from("docs").delete().eq("collection", name).eq("id", id);
        if (error) throw err(error);
        caches[name]?.delete(id); emit(name);
      },
    });
    const q = {
      path: name,
      doc: docRef,
      limit: () => q, orderBy: () => q, where: () => q,
      async add(data) { const r = docRef(); await r.set(data); return r; },
      async get() { if (!caches[name]) await load(name); return snap(name); },
      onSnapshot(next, onError) {
        (listeners[name] || (listeners[name] = new Set())).add(next);
        const first = !caches[name] && !listeners[name].started;
        listeners[name].started = true;
        if (first) {
          load(name).then(() => { emit(name); watch(name); }).catch((e) => onError && onError(err(e)));
        } else if (caches[name]) { setTimeout(() => next(snap(name)), 0); }
        return () => listeners[name].delete(next);
      },
    };
    return q;
  }
  const db = { collection, doc: (path) => { const [c, id] = path.split("/"); return collection(c).doc(id); } };

  /* ---------- user ---------- */
  let session = null;
  // With sign-ups turned off in Supabase, the only account that can sign in is the owner's.
  // The database rules check the email again on every write, so this only decides which buttons to show.
  const isOwner = () => !!session && (!OWNER || String(session.user?.email || "").toLowerCase() === OWNER);
  const user = {
    isOwner: async () => isOwner(),
    canEdit: async () => isOwner(),
    can: async () => isOwner(),
    id: async () => session?.user?.id || null,
    me: async () => ({ id: session?.user?.id || null, name: "", email: session?.user?.email || null }),
    profiles: async () => ({}),
  };

  /* ---------- assets ---------- */
  const assets = {
    async upload(file) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = newId() + "." + ext;
      const { error } = await sb.storage.from("photos").upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
      if (error) throw err(error);
      const url = sb.storage.from("photos").getPublicUrl(path).data.publicUrl;
      return { id: url, url, sizeBytes: file.size, contentType: file.type };
    },
    list: async () => ({ assets: [], usage: {} }),
    delete: async () => {},
  };

  /* ---------- sign-in strip in the footer area ---------- */
  function renderAuthBar() {
    if (!document.body) { document.addEventListener("DOMContentLoaded", renderAuthBar, { once: true }); return; }
    let bar = document.getElementById("authbar");
    if (!bar) { bar = document.createElement("div"); bar.id = "authbar"; document.body.appendChild(bar); }
    if (!sb) { bar.innerHTML = ""; return; }
    if (session) {
      bar.innerHTML = `<span>Signed in as ${session.user.email}${isOwner() ? "" : " (view only)"}</span> <button type="button" id="authOut">Sign out</button>`;
      bar.querySelector("#authOut").onclick = async () => { await sb.auth.signOut(); location.reload(); };
    } else {
      bar.innerHTML = `<form id="authForm"><label for="authEmail">Owner sign-in</label> <input id="authEmail" type="email" placeholder="your email" autocomplete="email" required> <button type="submit">Email me a link</button> <span id="authMsg"></span></form>`;
      bar.querySelector("#authForm").onsubmit = async (e) => {
        e.preventDefault();
        const email = bar.querySelector("#authEmail").value.trim();
        const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: false } });
        bar.querySelector("#authMsg").textContent = error ? "That didn't work: " + error.message : "Check your email for the sign-in link.";
      };
    }
  }

  let initialized = false;
  const sessionReady = sb ? sb.auth.getSession()
    .then(({ data }) => { session = data.session; })
    .catch((e) => console.error("sign-in check failed", e))
    .finally(() => { initialized = true; renderAuthBar(); }) : Promise.resolve();
  if (sb) sb.auth.onAuthStateChange((ev, s) => {
    if (!initialized) return;
    const was = isOwner(); session = s; renderAuthBar();
    if ((ev === "SIGNED_IN" || ev === "SIGNED_OUT") && was !== isOwner()) location.reload();
  });

  window.claude = {
    async use(name) {
      if (!sb) return null;
      await sessionReady;
      if (name === "db") return db;
      if (name === "user") return user;
      if (name === "assets") return isOwner() ? assets : null;
      return null;
    },
  };
})();
