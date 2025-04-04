-- Create artists table
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  genres TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alter the existing artists table to add new fields
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;

-- Create a view for publicly accessible artist data
CREATE VIEW public.artists_public AS
  SELECT 
    id,
    name,
    bio,
    location,
    genres,
    website_url,
    social_links,
    image_url,
    created_at
  FROM 
    public.artists;

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Create policies for the artists table if they don't exist yet
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'artists' 
        AND policyname = 'Artists are viewable by everyone'
    ) THEN
        CREATE POLICY "Artists are viewable by everyone" 
        ON public.artists 
        FOR SELECT 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'artists' 
        AND policyname = 'Users can create their own artist profile'
    ) THEN
        CREATE POLICY "Users can create their own artist profile" 
        ON public.artists 
        FOR INSERT 
        WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'artists' 
        AND policyname = 'Users can update their own artist profile'
    ) THEN
        CREATE POLICY "Users can update their own artist profile" 
        ON public.artists 
        FOR UPDATE 
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'artists' 
        AND policyname = 'Users can delete their own artist profile'
    ) THEN
        CREATE POLICY "Users can delete their own artist profile" 
        ON public.artists 
        FOR DELETE 
        USING (auth.uid() = id);
    END IF;
END
$$;

-- Add this table to the public schema (exposed to all authenticated users)
GRANT ALL ON public.artists TO authenticated;
GRANT SELECT ON public.artists TO anon;
GRANT SELECT ON public.artists_public TO anon;
GRANT SELECT ON public.artists_public TO authenticated; 