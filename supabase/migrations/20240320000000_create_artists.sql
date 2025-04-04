-- Create artists table
create table if not exists artists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  bio text,
  location text,
  genres text[],
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table artists enable row level security;

-- Create a policy that allows anyone to read artists
create policy "Anyone can read artists"
  on artists for select
  using (true);

-- Create a policy that allows authenticated users to insert their own artist profile
create policy "Users can insert their own artist profile"
  on artists for insert
  with check (auth.uid() = id);

-- Create a policy that allows users to update their own artist profile
create policy "Users can update their own artist profile"
  on artists for update
  using (auth.uid() = id);

-- Insert sample data
insert into artists (name, bio, location, genres, image_url)
values 
  ('DJ Bag Lady', 'Pioneering electronic music producer and DJ, creating innovative sounds that push boundaries.', 'San Francisco, CA', ARRAY['House', 'Techno', 'Experimental'], null),
  ('Synthwave Queen', 'Crafting retro-futuristic electronic music that transports listeners to another dimension.', 'Los Angeles, CA', ARRAY['Synthwave', 'Retrowave', 'Electronic'], null),
  ('Binary Beats', 'Non-binary producer exploring the intersection of technology and human emotion through sound.', 'Berlin, Germany', ARRAY['IDM', 'Ambient', 'Experimental'], null); 