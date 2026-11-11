-- How to Be Cool: database setup. Paste into Supabase > SQL Editor and click Run (once).
-- Before running, replace OWNER_EMAIL_HERE (all four places) with the email you'll sign in with.

create table if not exists public.docs (
  collection text not null,               -- items, outfits, lists, categories
  id         text not null,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

alter table public.docs enable row level security;

-- Everyone can read the guide, except things marked private, which only the owner can see.
drop policy if exists "public read" on public.docs;
create policy "public read" on public.docs for select using (
  coalesce(data ->> 'private', 'false') <> 'true'
  or (auth.jwt() ->> 'email') = 'OWNER_EMAIL_HERE'
);

-- Only the owner can add, change or delete.
drop policy if exists "owner writes" on public.docs;
create policy "owner writes" on public.docs for all
  using ((auth.jwt() ->> 'email') = 'OWNER_EMAIL_HERE')
  with check ((auth.jwt() ->> 'email') = 'OWNER_EMAIL_HERE');

-- Live updates across your devices.
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- Photo storage for new uploads: public to view, owner-only to upload.
insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
  on conflict (id) do nothing;
drop policy if exists "photos public read" on storage.objects;
create policy "photos public read" on storage.objects for select using (bucket_id = 'photos');
drop policy if exists "photos owner write" on storage.objects;
create policy "photos owner write" on storage.objects for insert
  with check (bucket_id = 'photos' and (auth.jwt() ->> 'email') = 'OWNER_EMAIL_HERE');
