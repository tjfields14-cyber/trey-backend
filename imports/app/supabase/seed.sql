-- Seed genres
insert into public.genres (name) values
  ('Fantasy'),
  ('Dark Fantasy'),
  ('Urban Fantasy'),
  ('Science Fiction'),
  ('Romance'),
  ('Mystery'),
  ('Thriller')
on conflict (name) do nothing;

-- Optional: Seed a demo book with no files yet (you can upload later and update cover_url/file_url)
insert into public.books (title, author, description, genre_id)
select 'City of Brass Keys', 'A. Freeman', 'In a city built from libraries, two rivals race to unlock the oldest gate.', g.id
from public.genres g where g.name='Urban Fantasy'
on conflict do nothing;
