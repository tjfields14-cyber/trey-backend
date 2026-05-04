# Chapterhouse — Supabase Connected

## 1) Setup
- Copy `.env.local.example` → `.env.local` and fill your Supabase URL + anon key.
- In Supabase → SQL Editor, run `supabase/schema.sql`.
- Insert your admin email into `public.admins`:
```sql
insert into public.admins(email) values ('YOUR_REAL_ADMIN@yourmail.com') on conflict do nothing;
```
- (Optional) set `NEXT_PUBLIC_TEST_MODE=true` to use password login during testing.

## 2) Run
```
npm install
npm run dev
```
Open http://localhost:3000

## 3) Pages
- `/books` — pulls from `book_catalog_stats`
- `/books/[id]` — shows details + reviews; submit review when logged in
- `/genres` — list; add/delete if logged in as admin
- `/admin/login` — email magic link by default (password when test mode true)
- `/admin` — shows admin gate

## 4) Cleanup endpoint
Set `SUPABASE_SERVICE_KEY` and `TEST_CLEANUP_TOKEN`, then call:
```bash
curl -X POST "https://YOUR-APP.vercel.app/api/test/cleanup"   -H "x-cleanup-token: YOUR_TEST_CLEANUP_TOKEN"
```

## 5) Storage buckets (for uploads)
Create two buckets in Supabase → Storage:
- `covers` (Public: read allowed)
- `epubs` (Public: read allowed)

**Policies (example):** allow `authenticated` to `insert`/`update` and `*` to `select`.
In the UI, set the bucket Public, then add an Object Policy like:
```sql
-- Example storage policy for bucket 'covers'
create policy "Public can read covers" on storage.objects
for select using ( bucket_id = 'covers' );

create policy "Admins can upload covers" on storage.objects
for insert to authenticated
with check ( bucket_id = 'covers' );
```
(Repeat for `epubs` replacing the bucket name.)

## Review Moderation + Exports (SBS)
1) **Run moderation SQL** in Supabase → SQL Editor:
   ```sql
   -- supabase/moderation.sql
   alter table public.reviews
     add column if not exists status text default 'pending' check (status in ('pending','approved','rejected')),
     add column if not exists flagged boolean default false;
   create or replace view public.reviews_public as
   select id, book_id, rating, comment, created_at from public.reviews where status='approved';
   ```
2) **Moderate reviews** at `/admin/reviews` (approve/reject/flag).
3) **Public book page** now pulls approved-only reviews from `reviews_public`.
4) **Export emails (profiles)** at `/api/export/emails`.
5) **Export emails (auth/admin)** via curl:
   ```bash
   curl -H "x-admin-export-token: YOUR_TEST_CLEANUP_TOKEN" \
    -L "https://YOUR-APP.vercel.app/api/export/emails-admin" -o chapterhouse-auth-users.csv
   ```
6) **Export reviews** at `/api/export/reviews`.

### Genre Management (already included)
- `/genres` lets admins add/delete genre categories. These flow into book uploads and filters.


---

# One-File SBS (Fresh Setup)

## A) Supabase
1. Create project → copy **URL** and **anon key**.
2. SQL Editor → run: `supabase/schema.sql`
3. SQL Editor → run: `supabase/moderation.sql`
4. SQL Editor → run: `supabase/seed.sql` (genres + one demo book)
5. Storage → Create buckets:
   - `covers` (Public ON)
   - `epubs` (Public ON)

## B) Env Vars (local .env.local)
Copy `.env.local.example` → `.env.local` and fill:
```
NEXT_PUBLIC_SUPABASE_URL=YOUR_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON
NEXT_PUBLIC_TEST_MODE=true
NEXT_PUBLIC_TEST_EMAIL=chapterhouse.test+public@yourmail.com
# server-only (for admin export + cleanup)
SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY
TEST_CLEANUP_TOKEN=a-long-random-string
```

## C) Run locally
```
npm install
npm run dev
```
Open http://localhost:3000

## D) Admin
- `/admin/login` → sign in (password if TEST_MODE=true; magic link otherwise)
- `/genres` → manage categories
- `/admin/upload` → upload cover + EPUB
- `/admin/books` → edit/delete
- `/admin/reviews` → approve/reject/flag

## E) Exports & Cleanup
- `/api/export/emails` → profiles CSV
- `/api/export/reviews` → reviews CSV
- `/api/export/emails-admin` → auth users CSV (send header `x-admin-export-token: YOUR_TEST_CLEANUP_TOKEN`)
- Cleanup:
```bash
curl -X POST "https://YOUR-APP.vercel.app/api/test/cleanup"   -H "x-cleanup-token: YOUR_TEST_CLEANUP_TOKEN"
```

## F) Deploy (Vercel)
- Import repo → add the same env vars → Deploy.

