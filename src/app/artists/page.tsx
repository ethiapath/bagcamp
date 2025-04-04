'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Artist {
  id: string;
  name: string;
  bio: string;
  location: string;
  genres: string[];
  image_url?: string;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtists() {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*');

        if (error) throw error;
        setArtists(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch artists');
      } finally {
        setLoading(false);
      }
    }

    fetchArtists();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Artists</h1>
        <div className="text-center">Loading artists...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Artists</h1>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Artists</h1>
      
      {artists.length === 0 ? (
        <div className="text-center text-gray-600">
          No artists found. Be the first to join!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div key={artist.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                {artist.image_url ? (
                  <img 
                    src={artist.image_url} 
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-600"></div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{artist.name}</h2>
                <p className="text-gray-600 text-sm mb-2">{artist.location}</p>
                <p className="text-gray-700 mb-3 line-clamp-2">{artist.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {artist.genres.map((genre) => (
                    <span 
                      key={genre}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 