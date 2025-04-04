'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { FiDisc, FiMusic, FiUser, FiFilter, FiX } from 'react-icons/fi';
import SearchComponent from '@/components/search/SearchComponent';

interface SearchResult {
  id: string;
  type: 'artist' | 'release' | 'track';
  name: string;
  image_url?: string | null;
  artist_name?: string;
  artist_id?: string;
  genres?: string[];
  year?: number;
  description?: string;
  release_title?: string;
  release_id?: string;
}

// Inner component that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'artist' | 'release' | 'track'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    if (query) {
      performSearch();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    // Apply filtering
    let filtered = [...results];
    
    // Filter by type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activeFilter);
    }
    
    // Filter by genres if any are selected
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.genres) return false;
        return selectedGenres.some(genre => item.genres?.includes(genre));
      });
    }
    
    setFilteredResults(filtered);
  }, [results, activeFilter, selectedGenres]);

  // Extract all unique genres from results
  useEffect(() => {
    const genres = new Set<string>();
    results.forEach(item => {
      if (item.genres) {
        item.genres.forEach(genre => genres.add(genre));
      }
    });
    setAllGenres(Array.from(genres));
  }, [results]);

  const performSearch = async () => {
    setLoading(true);
    
    try {
      // Search for artists
      const { data: artists } = await supabase
        .from('artists')
        .select('id, name, profile_image_url, genres, bio, location')
        .ilike('name', `%${query}%`)
        .limit(20);
      
      // Search for releases
      const { data: releases } = await supabase
        .from('releases')
        .select('id, title, cover_image_url, description, year, artist_id, type, artists(id, name, genres)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);
      
      // Search for tracks
      const { data: tracks } = await supabase
        .from('tracks')
        .select('id, title, release_id, releases(id, title, cover_image_url, artists(id, name, genres))')
        .ilike('title', `%${query}%`)
        .limit(20);
      
      // Format results
      const formattedResults: SearchResult[] = [
        ...(artists || []).map((artist): SearchResult => ({
          id: artist.id,
          type: 'artist',
          name: artist.name,
          image_url: artist.profile_image_url,
          genres: artist.genres ?? [],
          description: artist.bio ?? undefined
        })),
        ...(releases || []).map((release): SearchResult => ({
          id: release.id,
          type: 'release',
          name: release.title,
          image_url: release.cover_image_url ?? undefined,
          artist_name: release.artists?.name,
          artist_id: release.artist_id,
          year: release.year,
          description: release.description ?? undefined,
          genres: release.artists?.genres ?? []
        })),
        ...(tracks || []).map((track): SearchResult => ({
          id: track.id,
          type: 'track',
          name: track.title,
          image_url: track.releases?.cover_image_url,
          artist_name: track.releases?.artists?.name,
          artist_id: track.releases?.artists?.id,
          release_title: track.releases?.title,
          release_id: track.release_id,
          genres: track.releases?.artists?.genres ?? []
        }))
      ];
      
      setResults(formattedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setSelectedGenres([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-20 pt-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-6">Search Results</h1>
          <SearchComponent className="max-w-2xl" />
          
          {query && (
            <p className="mt-4 text-gray-400">
              {loading ? 'Searching...' : `${filteredResults.length} results for "${query}"`}
            </p>
          )}
        </div>

        {query && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Filters</h2>
                {(activeFilter !== 'all' || selectedGenres.length > 0) && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase mb-3">Type</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      activeFilter === 'all' ? 'bg-purple-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    All Results ({results.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('artist')}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      activeFilter === 'artist' ? 'bg-purple-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Artists ({results.filter(r => r.type === 'artist').length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('release')}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      activeFilter === 'release' ? 'bg-purple-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Releases ({results.filter(r => r.type === 'release').length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('track')}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      activeFilter === 'track' ? 'bg-purple-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Tracks ({results.filter(r => r.type === 'track').length})
                  </button>
                </div>
              </div>
              
              {allGenres.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase mb-3">Genres</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {allGenres.map(genre => (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          selectedGenres.includes(genre) ? 'bg-purple-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Search Results */}
            <div className="lg:col-span-3">
              {filteredResults.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-400">No results match your filters.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Artists */}
                  {(activeFilter === 'all' || activeFilter === 'artist') && 
                    filteredResults.some(r => r.type === 'artist') && (
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4">Artists</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResults
                          .filter(r => r.type === 'artist')
                          .map(artist => (
                          <Link
                            key={`artist-${artist.id}`}
                            href={`/artist/${artist.id}`}
                            className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition"
                          >
                            <div className="aspect-square bg-gray-750 flex items-center justify-center">
                              {artist.image_url ? (
                                <img
                                  src={artist.image_url}
                                  alt={artist.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-full bg-purple-900 flex items-center justify-center">
                                  <FiUser className="w-10 h-10 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-white">{artist.name}</h3>
                              {artist.genres && artist.genres.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {artist.genres.slice(0, 3).map(genre => (
                                    <span
                                      key={genre}
                                      className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300"
                                    >
                                      {genre}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Releases */}
                  {(activeFilter === 'all' || activeFilter === 'release') && 
                    filteredResults.some(r => r.type === 'release') && (
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4">Releases</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredResults
                          .filter(r => r.type === 'release')
                          .map(release => (
                          <Link
                            key={`release-${release.id}`}
                            href={`/release/${release.id}`}
                            className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition"
                          >
                            <div className="aspect-square bg-gray-750 flex items-center justify-center">
                              {release.image_url ? (
                                <img
                                  src={release.image_url}
                                  alt={release.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded bg-gray-700 flex items-center justify-center">
                                  <FiDisc className="w-10 h-10 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-white">{release.name}</h3>
                              {release.artist_name && (
                                <p className="text-sm text-gray-400">by {release.artist_name}</p>
                              )}
                              {release.year && (
                                <p className="text-sm text-gray-500 mt-1">{release.year}</p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tracks */}
                  {(activeFilter === 'all' || activeFilter === 'track') && 
                    filteredResults.some(r => r.type === 'track') && (
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4">Tracks</h2>
                      <div className="bg-gray-800 rounded-lg overflow-hidden">
                        {filteredResults
                          .filter(r => r.type === 'track')
                          .map(track => (
                          <Link
                            key={`track-${track.id}`}
                            href={track.release_id ? `/release/${track.release_id}` : '#'}
                            className="flex items-center p-4 hover:bg-gray-750 transition border-b border-gray-700 last:border-b-0"
                          >
                            <div className="mr-4 flex-shrink-0">
                              {track.image_url ? (
                                <img
                                  src={track.image_url}
                                  alt={track.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                                  <FiMusic className="text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{track.name}</h3>
                              <div className="text-sm text-gray-400">
                                {track.release_title && (
                                  <span>from {track.release_title}</span>
                                )}
                                {track.artist_name && (
                                  <span> by {track.artist_name}</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {query && loading && (
          <div className="flex justify-center py-10">
            <div className="animate-pulse text-xl text-gray-400">Searching...</div>
          </div>
        )}

        {!query && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-white mb-4">Enter a search term to find music, artists, and more</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Search for your favorite artists, albums, or tracks. Discover new music based on genres, tags, and more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main search page component with suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-400">Loading search results...</div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
} 