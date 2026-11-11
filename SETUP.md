# Putting How to Be Cool on the web

Everything in this folder is ready. These are the steps only you can do (they involve your accounts).
Total time: about 30 minutes. All three services are free at this size; the domain is about $12/year.

When a step says **send to Claude**, paste it into this chat and I'll take it from there.

---

## 1. Supabase (your database, photos and sign-in)

1. Go to **supabase.com**, sign up, and click **New project**.
   - Name: `how-to-be-cool`
   - Database password: anything strong (save it in your password manager; you won't need it day to day)
   - Region: **East US** (or whatever's closest)
2. Wait about a minute for the project to finish setting up.
3. Open **SQL Editor** (left sidebar) → **New query**.
   - Open `site/supabase/schema.sql` from this folder, copy all of it, and paste it in.
   - Replace `OWNER_EMAIL_HERE` (it appears 4 times) with the email you'll sign in with.
   - Click **Run**. You should see "Success. No rows returned."
4. New query again → paste all of `site/supabase/import.sql` → **Run**. This loads your 342 items, 18 outfits and your list.
5. Create your login: **Authentication → Users → Add user → Send invitation**, using that same email.
   Accept the invite from your inbox.
6. Lock it down: **Authentication → Sign In / Providers** → turn **off** "Allow new users to sign up".
7. **Send to Claude:** from **Project Settings → API**, the **Project URL** and the **anon public** key.
   (Both are safe to share. They only allow what the database rules allow: everyone reads, only you write.
   Do **not** send the `service_role` key.)

## 2. GitHub (where the site's files live)

1. Sign up at **github.com** if you don't have an account.
2. Click **New repository**: name it `how-to-be-cool`, **Public**, no README. Create it.
3. **Send to Claude:** the repository's address, like `https://github.com/yourname/how-to-be-cool`.
4. I'll prepare the first upload. Then you run one command in Terminal that I give you, which signs you in to GitHub once.

## 3. Netlify (puts the site on the internet)

1. Go to **netlify.com**, sign up **with your GitHub account**.
2. **Add new site → Import an existing project → GitHub** → pick `how-to-be-cool`.
3. Settings: **Base directory:** leave empty · **Build command:** leave empty · **Publish directory:** `site`
4. Click **Deploy**. In about a minute you get an address like `how-to-be-cool-123.netlify.app`.
5. **Send to Claude:** that address. I'll add it to Supabase's sign-in settings so your email link works.

## 4. Your own domain (optional, ~$12/year)

1. In Netlify: **Domain management → Add a domain → Buy a domain** (or connect one you already own).
2. Netlify sets it up automatically, including the secure https certificate.
3. **Send to Claude:** the domain, so I can add it to the sign-in settings too.

---

## After it's live

- **Visitors** see everything, read-only. There's no "+ Add" button and no editing for them.
- **You** sign in at the bottom of any page ("Owner sign-in" → your email → click the link in your inbox).
  You then get **+ Add**, editing, photo uploads and lists, the same as now.
- **Sharing a list:** open it under **Lists to share** and copy its link.
- **Changes with Claude:** open a session in this folder and ask, same as always. I edit `guide.html`,
  run `tools/build_site.py`, and push to GitHub; Netlify publishes it within a minute.
