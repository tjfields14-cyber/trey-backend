-- Add moderation fields to reviews
alter table public.reviews
  add column if not exists status text default 'pending' check (status in ('pending','approved','rejected')),
  add column if not exists flagged boolean default false;

-- Public-only approved reviews view
create or replace view public.reviews_public as
select id, book_id, rating, comment, created_at
from public.reviews
where status = 'approved';
