create table if not exists public.avatars (
  id bigint generated always as identity primary key,
  name text not null unique,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists public.writer_block_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  role text check (role in ('host','guest')) default 'guest',
  avatar_name text,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  avatar_name text,
  rating int2 check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.avatars enable row level security;
alter table public.writer_block_posts enable row level security;
alter table public.feedback enable row level security;

create policy if not exists avatars_select_public on public.avatars for select to public using (true);
create policy if not exists wbp_select_public on public.writer_block_posts for select to public using (true);
create policy if not exists feedback_select_public on public.feedback for select to public using (true);

create policy if not exists wbp_insert_auth on public.writer_block_posts for insert to authenticated with check (true);
create policy if not exists feedback_insert_auth on public.feedback for insert to authenticated with check (true);

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce(auth.email() in (select email from public.admins), false)
$$;

create policy if not exists wbp_admin_write on public.writer_block_posts for all to authenticated
using ( public.is_admin() ) with check ( public.is_admin() );
create policy if not exists feedback_admin_write on public.feedback for all to authenticated
using ( public.is_admin() ) with check ( public.is_admin() );

insert into public.avatars (name, image_url) values
  ('Nia','https://picsum.photos/seed/nia/200'),
  ('Kairo','https://picsum.photos/seed/kairo/200'),
  ('Sol','https://picsum.photos/seed/sol/200'),
  ('Mara','https://picsum.photos/seed/mara/200'),
  ('Jax','https://picsum.photos/seed/jax/200')
on conflict (name) do nothing;
