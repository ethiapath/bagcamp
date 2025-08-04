-- Add S3 file paths and download tracking to existing schema

-- Add file_path to tracks table
ALTER TABLE tracks 
ADD COLUMN file_path text, 
ADD COLUMN file_size bigint,
ADD COLUMN file_type text;

-- Update existing audio_url and preview_url columns to track CDN URLs
COMMENT ON COLUMN tracks.audio_url IS 'Public CDN URL for the full audio file';
COMMENT ON COLUMN tracks.preview_url IS 'Public CDN URL for the preview clip';
COMMENT ON COLUMN tracks.file_path IS 'Private B2 path to the source audio file';

-- Add high-res file path to releases for download bundles
ALTER TABLE releases
ADD COLUMN download_path text,
ADD COLUMN download_size bigint,
ADD COLUMN download_file_type text DEFAULT 'zip';

-- Update release cover image
COMMENT ON COLUMN releases.cover_image_url IS 'Public CDN URL for cover image';
ALTER TABLE releases
ADD COLUMN cover_image_path text;

-- Add image path for artist profile images
ALTER TABLE artists
ADD COLUMN profile_image_path text;
COMMENT ON COLUMN artists.image_url IS 'Public CDN URL for profile image';

-- Table for tracking downloads
CREATE TABLE downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  release_id uuid REFERENCES releases(id) ON DELETE CASCADE,
  track_id uuid REFERENCES tracks(id) ON DELETE CASCADE,
  downloaded_at timestamptz DEFAULT now() NOT NULL,
  ip_address text,
  user_agent text,
  download_type text NOT NULL, -- 'release', 'track', 'preview'
  
  -- Ensure either release_id or track_id is provided, not both or neither
  CONSTRAINT downloads_release_or_track_check CHECK (
    (release_id IS NOT NULL AND track_id IS NULL) OR
    (release_id IS NULL AND track_id IS NOT NULL)
  )
);

-- Enable Row Level Security (RLS) on downloads
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Define RLS policies for downloads
CREATE POLICY "Users can view their own downloads"
  ON downloads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Artists can view downloads of their content"
  ON downloads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM releases 
      WHERE releases.id = downloads.release_id 
      AND releases.artist_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM tracks 
      JOIN releases ON tracks.release_id = releases.id
      WHERE tracks.id = downloads.track_id 
      AND releases.artist_id = auth.uid()
    )
  );

-- Create function to record downloads
CREATE OR REPLACE FUNCTION record_download(
  p_user_id uuid,
  p_release_id uuid DEFAULT NULL,
  p_track_id uuid DEFAULT NULL,
  p_download_type text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO downloads (
    user_id, release_id, track_id, download_type, ip_address, user_agent
  ) VALUES (
    p_user_id, p_release_id, p_track_id, p_download_type, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$; 