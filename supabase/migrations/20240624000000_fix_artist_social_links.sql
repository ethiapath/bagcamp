-- Ensure social_links column exists on the artists table
ALTER TABLE IF EXISTS public.artists 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;

-- Also make sure website_url column exists
ALTER TABLE IF EXISTS public.artists 
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Update the public view to include these columns if they're not already there
CREATE OR REPLACE VIEW public.artists_public AS
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

-- Grant permissions
GRANT ALL ON public.artists TO authenticated;
GRANT SELECT ON public.artists TO anon;
GRANT SELECT ON public.artists_public TO anon;
GRANT SELECT ON public.artists_public TO authenticated; 