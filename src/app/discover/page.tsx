'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FiFilter, FiX, FiMusic } from 'react-icons/fi';
import SearchComponent from '@/components/search/SearchComponent';

const GENRES = [
  'Techno', 'House', 'Ambient', 'IDM', 'Drum & Bass', 
  'Breakbeat', 'Electro', 'Trance', 'Downtempo', 'Experimental', 
  'Glitch', 'Dub', 'Footwork', 'Synthwave', 'Lo-Fi'
];

const TAGS = [
  'Trans Artist', 'LGBTQ+', 'Non-Binary', 'Queer', 'Female Producer',
  'Deep', 'Atmospheric', 'Melodic', 'Dark', 'Hypnotic', 'Club', 'Dance',
  'Chill', 'Industrial', 'Acid', 'Dub'
];

interface Release {
  id: string;
  title: string;
  cover_image_url: string | null;
  year: number;
  artist_id: string;
  artist_name: string;
  genres: string[];
  tags: string[];
}

// Inner component that uses useSearchParams
function DiscoverPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedGenre = searchParams.get('genre');
  const selectedTag = searchParams.get('tag');
  
  const [releases, setReleases] = useState<Release[]>([]);
  const [filteredReleases, setFilteredReleases] = useState<Release[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(selectedGenre ? [selectedGenre] : []);
  const [selectedTags, setSelectedTags] = useState<string[]>(selectedTag ? [selectedTag] : []);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const supabase = createClient();

  // Fetch releases
  useEffect(() => {
    const fetchReleases = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would fetch actual releases from the database
        // with genre and tag information
        const { data, error } = await supabase
          .from('releases')
          .select('id, title, cover_image_url, year, artist_id, artists(name)')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        
        // For demonstration, add random genres and tags to releases
        // In a real app, these would come from the database
        const releasesWithGenresAndTags: Release[] = (data || []).map(release => {
          // Randomly assign 1-3 genres
          const numGenres = Math.floor(Math.random() * 3) + 1;
          const randomGenres = [...GENRES].sort(() => 0.5 - Math.random()).slice(0, numGenres);
          
          // Randomly assign 1-4 tags
          const numTags = Math.floor(Math.random() * 4) + 1;
          const randomTags = [...TAGS].sort(() => 0.5 - Math.random()).slice(0, numTags);
          
          return {
            id: release.id,
            title: release.title,
            cover_image_url: release.cover_image_url,
            year: release.year,
            artist_id: release.artist_id,
            artist_name: release.artists?.name || 'Unknown Artist',
            genres: randomGenres,
            tags: randomTags
          };
        });
        
        setReleases(releasesWithGenresAndTags);
      } catch (error) {
        console.error('Error fetching releases:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReleases();
  }, []);

  // Apply filters whenever releases, selected genres, or tags change
  useEffect(() => {
    if (releases.length === 0) return;
    
    let filtered = [...releases];
    
    // Apply genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(release => 
        release.genres.some(genre => selectedGenres.includes(genre))
      );
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(release => 
        release.tags.some(tag => selectedTags.includes(tag))
      );
    }
    
    setFilteredReleases(filtered);
  }, [releases, selectedGenres, selectedTags]);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedTags([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            Discover New Music
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore the latest electronic music from independent artists. Use the filters to discover music based on genres and tags.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-10">
          <SearchComponent />
        </div>
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-800 rounded-lg"
          >
            <FiFilter />
            <span>{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
            <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Filters</h2>
                {(selectedGenres.length > 0 || selectedTags.length > 0) && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              {/* Genres Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <button 
                      key={genre} 
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        selectedGenres.includes(genre)
                          ? 'bg-purple-700 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tags Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <button 
                      key={tag} 
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-700 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-pulse text-xl text-gray-400">Loading...</div>
              </div>
            ) : filteredReleases.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <FiMusic className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No releases found</h3>
                <p className="text-gray-400">
                  Try adjusting your filters to see more results.
                </p>
                {(selectedGenres.length > 0 || selectedTags.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 text-purple-400 hover:text-purple-300"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">
                    {filteredReleases.length} {filteredReleases.length === 1 ? 'Release' : 'Releases'} 
                  </h2>
                  <div className="flex space-x-2">
                    {selectedGenres.map(genre => (
                      <span key={genre} className="flex items-center px-2 py-1 bg-purple-800 rounded-full text-xs">
                        {genre}
                        <button 
                          onClick={() => toggleGenre(genre)}
                          className="ml-1 text-purple-300 hover:text-white"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                    {selectedTags.map(tag => (
                      <span key={tag} className="flex items-center px-2 py-1 bg-purple-800 rounded-full text-xs">
                        {tag}
                        <button 
                          onClick={() => toggleTag(tag)}
                          className="ml-1 text-purple-300 hover:text-white"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReleases.map((release) => (
                    <Link
                      key={release.id}
                      href={`/release/${release.id}`}
                      className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition duration-300"
                    >
                      <div className="aspect-square bg-gray-700 flex items-center justify-center">
                        {release.cover_image_url ? (
                          <img 
                            src={release.cover_image_url} 
                            alt={release.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiMusic className="w-12 h-12 text-gray-600" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-1 text-white">{release.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{release.artist_name}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {release.genres.slice(0, 2).map((genre) => (
                            <span 
                              key={`${release.id}-${genre}`} 
                              className="text-xs px-2 py-1 bg-purple-900 rounded-full"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {release.tags.slice(0, 2).map((tag) => (
                            <span 
                              key={`${release.id}-${tag}`} 
                              className="text-xs px-2 py-1 bg-gray-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {filteredReleases.length > 12 && (
                  <div className="mt-8 text-center">
                    <button className="px-8 py-3 border border-purple-500 rounded-full hover:bg-purple-900 transition">
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with suspense boundary
export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-400">Loading discover page...</div>
      </div>
    }>
      <DiscoverPageContent />
    </Suspense>
  );
} 