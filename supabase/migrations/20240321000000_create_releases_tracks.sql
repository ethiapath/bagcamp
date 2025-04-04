-- Create releases table
create table if not exists releases (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text not null,  -- album, EP, single, mix, etc.
  year int not null,
  description text,
  cover_image_url text,
  artist_id uuid not null references artists(id) on delete cascade,
  price numeric(10,2),
  allow_name_your_price boolean default false,
  minimum_price numeric(10,2),
  streaming_enabled boolean default true,
  streaming_limit int, -- number of free plays before purchase, null for unlimited
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tracks table
create table if not exists tracks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  release_id uuid not null references releases(id) on delete cascade,
  track_number int not null,
  duration int not null, -- in seconds
  audio_url text,
  preview_url text, -- for limited preview if different from full track
  preview_duration int, -- in seconds, for limited preview
  lyrics text,
  credits text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(release_id, track_number) -- Ensure track numbers are unique within a release
);

-- Create merchandise table
create table if not exists merchandise (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text not null, -- t-shirt, vinyl, cassette, etc.
  artist_id uuid not null references artists(id) on delete cascade,
  price numeric(10,2) not null,
  image_url text,
  inventory_count int, -- null for unlimited/digital
  physical boolean default true,
  has_variations boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create merchandise variations table (for sizes, colors, etc.)
create table if not exists merchandise_variations (
  id uuid default gen_random_uuid() primary key,
  merchandise_id uuid not null references merchandise(id) on delete cascade,
  attribute_name text not null, -- e.g., "Size", "Color"
  attribute_value text not null, -- e.g., "XL", "Red"
  price_adjustment numeric(10,2) default 0, -- additional cost for this variation
  inventory_count int, -- null for unlimited
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(merchandise_id, attribute_name, attribute_value)
);

-- Enable Row Level Security (RLS)
alter table releases enable row level security;
alter table tracks enable row level security;
alter table merchandise enable row level security;
alter table merchandise_variations enable row level security;

-- Create policies for releases
create policy "Anyone can read published releases"
  on releases for select
  using (published = true);

create policy "Artists can read all their releases"
  on releases for select
  using (auth.uid() = artist_id);

create policy "Artists can insert their own releases"
  on releases for insert
  with check (auth.uid() = artist_id);

create policy "Artists can update their own releases"
  on releases for update
  using (auth.uid() = artist_id);

create policy "Artists can delete their own releases"
  on releases for delete
  using (auth.uid() = artist_id);

-- Create policies for tracks
create policy "Anyone can read tracks of published releases"
  on tracks for select
  using (
    exists (
      select 1 from releases
      where releases.id = tracks.release_id
      and releases.published = true
    )
  );

create policy "Artists can read all their tracks"
  on tracks for select
  using (
    exists (
      select 1 from releases
      where releases.id = tracks.release_id
      and auth.uid() = releases.artist_id
    )
  );

create policy "Artists can insert tracks for their releases"
  on tracks for insert
  with check (
    exists (
      select 1 from releases
      where releases.id = tracks.release_id
      and auth.uid() = releases.artist_id
    )
  );

create policy "Artists can update tracks for their releases"
  on tracks for update
  using (
    exists (
      select 1 from releases
      where releases.id = tracks.release_id
      and auth.uid() = releases.artist_id
    )
  );

create policy "Artists can delete tracks from their releases"
  on tracks for delete
  using (
    exists (
      select 1 from releases
      where releases.id = tracks.release_id
      and auth.uid() = releases.artist_id
    )
  );

-- Create policies for merchandise
create policy "Anyone can read merchandise"
  on merchandise for select
  using (true);

create policy "Artists can insert their own merchandise"
  on merchandise for insert
  with check (auth.uid() = artist_id);

create policy "Artists can update their own merchandise"
  on merchandise for update
  using (auth.uid() = artist_id);

create policy "Artists can delete their own merchandise"
  on merchandise for delete
  using (auth.uid() = artist_id);

-- Create policies for merchandise variations
create policy "Anyone can read merchandise variations"
  on merchandise_variations for select
  using (true);

create policy "Artists can insert merchandise variations"
  on merchandise_variations for insert
  with check (
    exists (
      select 1 from merchandise
      where merchandise.id = merchandise_variations.merchandise_id
      and auth.uid() = merchandise.artist_id
    )
  );

create policy "Artists can update merchandise variations"
  on merchandise_variations for update
  using (
    exists (
      select 1 from merchandise
      where merchandise.id = merchandise_variations.merchandise_id
      and auth.uid() = merchandise.artist_id
    )
  );

create policy "Artists can delete merchandise variations"
  on merchandise_variations for delete
  using (
    exists (
      select 1 from merchandise
      where merchandise.id = merchandise_variations.merchandise_id
      and auth.uid() = merchandise.artist_id
    )
  );

-- Insert sample data for releases
insert into releases (title, type, year, description, artist_id, price, streaming_enabled, published)
values 
  ('Midnight Circuit', 'Album', 2023, 'A journey through nocturnal electronic landscapes', 
   (select id from artists where name = 'DJ Bag Lady'), 9.99, true, true),
  ('Retrowave Dreams', 'EP', 2022, 'Four tracks of pure nostalgic synthwave', 
   (select id from artists where name = 'Synthwave Queen'), 5.99, true, true),
  ('Binary Emotions', 'Album', 2024, 'An experimental exploration of digital feelings', 
   (select id from artists where name = 'Binary Beats'), 8.99, true, true);

-- Insert sample tracks
insert into tracks (title, release_id, track_number, duration, preview_duration)
values
  -- DJ Bag Lady - Midnight Circuit
  ('Neon Pulse', 
   (select id from releases where title = 'Midnight Circuit'), 
   1, 320, 60),
  ('Downtown Haze', 
   (select id from releases where title = 'Midnight Circuit'), 
   2, 285, 60),
  ('4AM Rhythm', 
   (select id from releases where title = 'Midnight Circuit'), 
   3, 360, 60),
  ('Digital Dawn', 
   (select id from releases where title = 'Midnight Circuit'), 
   4, 330, 60),
   
  -- Synthwave Queen - Retrowave Dreams
  ('1986', 
   (select id from releases where title = 'Retrowave Dreams'), 
   1, 240, 60),
  ('Arcade Love', 
   (select id from releases where title = 'Retrowave Dreams'), 
   2, 265, 60),
  ('Neon Highway', 
   (select id from releases where title = 'Retrowave Dreams'), 
   3, 310, 60),
  ('Sunset Drive', 
   (select id from releases where title = 'Retrowave Dreams'), 
   4, 290, 60),
   
  -- Binary Beats - Binary Emotions
  ('0101 (Intro)', 
   (select id from releases where title = 'Binary Emotions'), 
   1, 120, 60),
  ('Digital Heartbeat', 
   (select id from releases where title = 'Binary Emotions'), 
   2, 345, 60),
  ('Quantum State', 
   (select id from releases where title = 'Binary Emotions'), 
   3, 380, 60),
  ('Nonbinary Code', 
   (select id from releases where title = 'Binary Emotions'), 
   4, 410, 60),
  ('Algorithm of Self', 
   (select id from releases where title = 'Binary Emotions'), 
   5, 290, 60);

-- Insert sample merchandise
insert into merchandise (title, description, type, artist_id, price, physical)
values
  ('Midnight Circuit T-Shirt', 'Black t-shirt with album artwork', 'T-Shirt', 
   (select id from artists where name = 'DJ Bag Lady'), 24.99, true),
  ('Retrowave Dreams Cassette', 'Limited edition cassette in neon pink', 'Cassette', 
   (select id from artists where name = 'Synthwave Queen'), 14.99, true),
  ('Binary Emotions Digital Art', 'High-resolution digital art from the album', 'Digital', 
   (select id from artists where name = 'Binary Beats'), 4.99, false);

-- Add t-shirt variations
update merchandise set has_variations = true where title = 'Midnight Circuit T-Shirt';

insert into merchandise_variations (merchandise_id, attribute_name, attribute_value, inventory_count)
values
  ((select id from merchandise where title = 'Midnight Circuit T-Shirt'), 'Size', 'S', 20),
  ((select id from merchandise where title = 'Midnight Circuit T-Shirt'), 'Size', 'M', 30),
  ((select id from merchandise where title = 'Midnight Circuit T-Shirt'), 'Size', 'L', 25),
  ((select id from merchandise where title = 'Midnight Circuit T-Shirt'), 'Size', 'XL', 15),
  ((select id from merchandise where title = 'Midnight Circuit T-Shirt'), 'Size', '2XL', 10); 