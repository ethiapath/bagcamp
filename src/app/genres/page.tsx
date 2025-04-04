'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { FiMusic, FiArrowRight } from 'react-icons/fi';
import SearchComponent from '@/components/search/SearchComponent';

// Predefined genres for electronic music
const GENRES = [
  'Techno', 'House', 'Ambient', 'IDM', 'Drum & Bass', 
  'Breakbeat', 'Electro', 'Trance', 'Downtempo', 'Experimental', 
  'Glitch', 'Dub', 'Footwork', 'Synthwave', 'Lo-Fi', 'Jungle',
  'Acid', 'Dubstep', 'Grime', 'Bass', 'Garage', 'Minimal',
  'UK Garage', 'Deep House', 'Tech House', 'Hard Techno',
  'Microhouse', 'Chillwave', 'Trap', 'Future Bass'
];

interface GenreStats {
  name: string;
  count: number;
  primaryColor: string;
  secondaryColor: string;
}

// Function to get a deterministic color for each genre
const getGenreColors = (genreName: string): { primary: string; secondary: string } => {
  // Simple hash function to get a consistent number from a string
  let hash = 0;
  for (let i = 0; i < genreName.length; i++) {
    hash = genreName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate hues for primary and secondary colors
  const hue1 = hash % 360;
  const hue2 = (hue1 + 30) % 360;
  
  return {
    primary: `hsl(${hue1}, 70%, 40%)`,
    secondary: `hsl(${hue2}, 70%, 50%)`
  };
};

export default function GenresPage() {
  const [genreStats, setGenreStats] = useState<GenreStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    const fetchGenreStats = async () => {
      setIsLoading(true);
      try {
        // In a production app, we'd fetch actual genre stats from the database
        // For now, we'll generate fake counts for each genre
        const stats = GENRES.map(genre => {
          const count = Math.floor(Math.random() * 50) + 5; // Random count between 5-54
          const { primary, secondary } = getGenreColors(genre);
          
          return {
            name: genre,
            count,
            primaryColor: primary,
            secondaryColor: secondary
          };
        });
        
        // Sort by count descending
        stats.sort((a, b) => b.count - a.count);
        
        setGenreStats(stats);
      } catch (error) {
        console.error('Error fetching genre stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGenreStats();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 py-20 pt-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            Browse by Genre
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore the diverse world of electronic music through genres. Find artists and releases within your favorite electronic music styles.
          </p>
        </div>
        
        {/* Search */}
        <div className="mb-12 max-w-3xl mx-auto">
          <SearchComponent />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse text-xl text-gray-400">Loading genres...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {genreStats.map((genre) => (
              <Link 
                key={genre.name}
                href={`/discover?genre=${encodeURIComponent(genre.name)}`}
                className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:translate-y-[-4px] transition duration-300"
                style={{
                  background: `linear-gradient(45deg, ${genre.primaryColor}, ${genre.secondaryColor})`
                }}
              >
                <div className="p-6 flex justify-between items-center bg-black bg-opacity-70 h-full">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{genre.name}</h2>
                    <p className="text-gray-200 opacity-90">{genre.count} {genre.count === 1 ? 'release' : 'releases'}</p>
                  </div>
                  <FiArrowRight className="text-white text-xl opacity-70" />
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Popular Genre Combinations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link 
              href="/discover?genre=Ambient&genre=Experimental"
              className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition"
            >
              <div className="w-16 h-16 mb-4 mx-auto bg-gradient-to-br from-indigo-500 to-purple-700 rounded-full flex items-center justify-center">
                <FiMusic className="text-white text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ambient & Experimental</h3>
              <p className="text-gray-400 text-sm">
                Abstract soundscapes and avant-garde compositions pushing the boundaries of electronic music.
              </p>
            </Link>
            
            <Link 
              href="/discover?genre=Techno&genre=Acid"
              className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition"
            >
              <div className="w-16 h-16 mb-4 mx-auto bg-gradient-to-br from-red-500 to-yellow-600 rounded-full flex items-center justify-center">
                <FiMusic className="text-white text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Techno & Acid</h3>
              <p className="text-gray-400 text-sm">
                High-energy dance music featuring the iconic squelchy sound of the Roland TB-303.
              </p>
            </Link>
            
            <Link 
              href="/discover?genre=House&genre=Garage"
              className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition"
            >
              <div className="w-16 h-16 mb-4 mx-auto bg-gradient-to-br from-blue-500 to-teal-400 rounded-full flex items-center justify-center">
                <FiMusic className="text-white text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">House & Garage</h3>
              <p className="text-gray-400 text-sm">
                Groovy rhythms and soulful vibes from two of electronic music's most influential genres.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 