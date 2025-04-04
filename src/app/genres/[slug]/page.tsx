'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FiUser, FiMusic, FiArrowLeft } from 'react-icons/fi';

interface Artist {
  id: string;
  name: string;
  image_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  genres: string[] | null;
}

interface Release {
  id: string;
  title: string;
  cover_image_url: string | null;
  artist_id: string;
  created_at: string;
  artist_name?: string;
  description: string | null;
  price: number | null;
  year: number;
  type: string;
  streaming_enabled: boolean;
  published: boolean;
  minimum_price: number | null;
  allow_name_your_price: boolean;
  artists: { name: string } | null;
}

export default function GenreDetailPage() {
  const params = useParams();
  const genre = decodeURIComponent(params.slug as string);
  
  const [artists, setArtists] = useState<Artist[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // In production, you would fetch artists and releases by genre
        // For now, we'll fetch a few random artists and releases
        const { data: artistsData, error: artistsError } = await supabase
          .from('artists')
          .select('*')
          .limit(6);
        
        if (artistsError) throw artistsError;
        
        const { data: releasesData, error: releasesError } = await supabase
          .from('releases')
          .select('*, artists(name)')
          .limit(8);
        
        if (releasesError) throw releasesError;
        
        // Format data to match our interfaces
        const formattedArtists = artistsData?.map(artist => ({
          id: artist.id,
          name: artist.name,
          image_url: artist.profile_image_url, // Mapping from database field
          bio: artist.bio,
          location: artist.location,
          created_at: artist.created_at,
          genres: artist.genres
        })) || [];
        
        // Format releases data with artist name
        const formattedReleases = releasesData?.map(release => ({
          ...release,
          artist_name: release.artists?.name || 'Unknown Artist'
        })) || [];
        
        setArtists(formattedArtists);
        setReleases(formattedReleases);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use fallback data
        setArtists([]);
        setReleases([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [genre, supabase]);
  
  // Get two colors for the genre
  const getGenreColors = (genreName: string): { primary: string; secondary: string } => {
    // Simple hash function for consistent colors
    let hash = 0;
    for (let i = 0; i < genreName.length; i++) {
      hash = genreName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue1 = hash % 360;
    const hue2 = (hue1 + 30) % 360;
    
    return {
      primary: `hsl(${hue1}, 70%, 40%)`,
      secondary: `hsl(${hue2}, 70%, 50%)`
    };
  };
  
  const { primary, secondary } = getGenreColors(genre);
  
  return (
    <div className="min-h-screen bg-gray-900 py-20 pt-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/genres" 
            className="inline-flex items-center text-gray-400 hover:text-white transition"
          >
            <FiArrowLeft className="mr-2" /> Back to all genres
          </Link>
        </div>
        
        <div className="mb-12">
          <div 
            className="h-40 rounded-xl mb-8 flex items-center justify-center"
            style={{
              background: `linear-gradient(45deg, ${primary}, ${secondary})`
            }}
          >
            <h1 className="text-5xl font-bold text-white px-6 py-4 bg-black bg-opacity-30 rounded-lg">
              {genre}
            </h1>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-3">About {genre}</h2>
            <p className="text-gray-300">
              {getGenreDescription(genre)}
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse text-xl text-gray-400">Loading content...</div>
          </div>
        ) : (
          <>
            {/* Artists Section */}
            <div className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Artists</h2>
                <Link 
                  href={`/discover?genre=${encodeURIComponent(genre)}&entityType=artist`}
                  className="text-indigo-400 hover:text-indigo-300 transition"
                >
                  View all
                </Link>
              </div>
              
              {artists.length === 0 ? (
                <div className="text-center py-10 bg-gray-800 rounded-lg">
                  <FiUser className="mx-auto text-gray-600 text-4xl mb-4" />
                  <p className="text-gray-400">No artists found for this genre yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artists.map((artist) => (
                    <Link key={artist.id} href={`/artist/${artist.id}`} className="block">
                      <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition group">
                        <div className="h-48 bg-gray-700 relative">
                          {artist.image_url ? (
                            <Image
                              src={artist.image_url}
                              alt={artist.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                              <FiUser className="text-gray-500 text-4xl" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition">
                            {artist.name}
                          </h3>
                          {artist.location && (
                            <p className="text-gray-400 text-sm">{artist.location}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Releases Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Releases</h2>
                <Link 
                  href={`/discover?genre=${encodeURIComponent(genre)}&entityType=release`}
                  className="text-indigo-400 hover:text-indigo-300 transition"
                >
                  View all
                </Link>
              </div>
              
              {releases.length === 0 ? (
                <div className="text-center py-10 bg-gray-800 rounded-lg">
                  <FiMusic className="mx-auto text-gray-600 text-4xl mb-4" />
                  <p className="text-gray-400">No releases found for this genre yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {releases.map((release) => (
                    <Link key={release.id} href={`/release/${release.id}`} className="block">
                      <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition group">
                        <div className="aspect-square bg-gray-700 relative">
                          {release.cover_image_url ? (
                            <Image
                              src={release.cover_image_url}
                              alt={release.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                              <FiMusic className="text-gray-500 text-4xl" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-medium truncate group-hover:text-indigo-300 transition">
                            {release.title}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">{release.artist_name}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Helper function to get genre descriptions
function getGenreDescription(genre: string): string {
  const descriptions: Record<string, string> = {
    'Techno': 'Techno is a genre of electronic dance music characterized by a repetitive beat and often minimal melodic accompaniment, typically produced for use in a continuous DJ set.',
    'House': 'House music is a genre of electronic dance music characterized by a repetitive four-on-the-floor beat and a tempo of 120 to 130 beats per minute.',
    'Ambient': 'Ambient music is a genre of music that emphasizes tone and atmosphere over traditional musical structure or rhythm.',
    'IDM': 'Intelligent Dance Music (IDM) is a form of electronic music that emerged in the early 1990s. It was characterized by experimentation and the use of advanced electronic production techniques.',
    'Drum & Bass': 'Drum and bass is a genre of electronic music characterized by fast breakbeats with heavy bass and sub-bass lines, sampled sources, and synthesizers.',
    'Breakbeat': 'Breakbeat is a broad type of electronic music that tends to use drum breaks and a non-4/4 time signature.',
    'Electro': 'Electro (or electro-funk) is a genre of electronic music directly influenced by the use of the Roland TR-808 drum machine, using futuristic themes with robot vocals.',
    'Trance': 'Trance is a genre of electronic music that emerged from the British new-age music scene and the early 1990s German techno and hardcore scenes.',
    'Downtempo': 'Downtempo (or downbeat) is a broad genre of electronic music characterized by an atmospheric, mellow style and a tempo typically between 90 and 120 BPM.',
    'Experimental': 'Experimental electronic music pushes the boundaries of conventional electronic music, often incorporating unconventional sounds, structures, and production techniques.',
    // Default for any unspecified genre
    'default': 'A vibrant electronic music genre with a unique sound and cultural history. Artists in this genre push boundaries with innovative production techniques and sonic explorations.'
  };
  
  return descriptions[genre] || descriptions['default'];
} 