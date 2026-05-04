create table if not exists public.genres (
  id bigint generated always as identity primary key,
  name text unique not null,
  description text,
  created_at timestamptz default now()
);
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  description text,
  cover_url text,
  file_url text,
  genre_id bigint references public.genres(id) on delete set null,
  created_at timestamptz default now()
);
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  rating int2 not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique (book_id, user_id)
);
create table if not exists public.admins ( email text primary key, created_at timestamptz default now() );
create table if not exists public.profiles (
  user_id uuid primary key, display_name text, avatar_url text, role text default 'reader',
  bff_name text, bff_style jsonb, created_at timestamptz default now()
);
create or replace view public.book_rating_stats as
select book_id, round(avg(rating)::numeric,2) as avg_rating, count(*)::int as review_count
from public.reviews group by book_id;
create or replace view public.book_catalog_stats as
select b.id,b.title,b.author,b.description,b.cover_url,b.file_url,b.created_at,
       b.genre_id,g.name as genre_name,
       coalesce(rs.avg_rating,0) as avg_rating,
       coalesce(rs.review_count,0) as review_count
from public.books b
left join public.genres g on g.id=b.genre_id
left join public.book_rating_stats rs on rs.book_id=b.id;
alter table public.books enable row level security;
alter table public.reviews enable row level security;
alter table public.genres enable row level security;
alter table public.profiles enable row level security;
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce(auth.email() in (select email from public.admins), false)
$$;
create policy if not exists books_select_public on public.books for select to public using (true);
create policy if not exists reviews_select_public on public.reviews for select to public using (true);
create policy if not exists genres_select_public on public.genres for select to public using (true);
create policy if not exists profiles_select_public on public.profiles for select to public using (true);
create policy if not exists books_admin_write on public.books for all to authenticated using ( public.is_admin() ) with check ( public.is_admin() );
create policy if not exists genres_admin_write on public.genres for all to authenticated using ( public.is_admin() ) with check ( public.is_admin() );
create policy if not exists reviews_insert_auth on public.reviews for insert to authenticated with check (auth.uid() = user_id);
create policy if not exists reviews_modify_self on public.reviews for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
