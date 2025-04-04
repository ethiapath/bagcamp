'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiSearch, FiX, FiMusic, FiUser, FiDisc } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';

type SearchResult = {
  id: string;
  type: 'artist' | 'release' | 'track';
  name: string;
  image_url?: string | null;
  artist_name?: string;
  artist_id?: string;
};

export default function SearchComponent({ className = '' }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Perform search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    if (query.length < 2) return;
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      // Search for artists
      const { data: artists } = await supabase
        .from('artists')
        .select('id, name, profile_image_url')
        .ilike('name', `%${query}%`)
        .limit(3);
      
      // Search for releases (albums/EPs)
      const { data: releases } = await supabase
        .from('releases')
        .select('id, title, cover_image_url, artists(id, name)')
        .ilike('title', `%${query}%`)
        .limit(3);
      
      // Search for tracks
      const { data: tracks } = await supabase
        .from('tracks')
        .select('id, title, releases(id, title, artists(id, name))')
        .ilike('title', `%${query}%`)
        .limit(3);
      
      // Format results
      const formattedResults: SearchResult[] = [
        ...(artists || []).map((artist): SearchResult => ({
          id: artist.id,
          type: 'artist',
          name: artist.name,
          image_url: artist.profile_image_url
        })),
        ...(releases || []).map((release): SearchResult => ({
          id: release.id,
          type: 'release',
          name: release.title,
          image_url: release.cover_image_url,
          artist_name: release.artists?.name,
          artist_id: release.artists?.id
        })),
        ...(tracks || []).map((track): SearchResult => ({
          id: track.id,
          type: 'track',
          name: track.title,
          artist_name: track.releases?.artists?.name,
          artist_id: track.releases?.artists?.id
        }))
      ];
      
      setResults(formattedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      clearSearch();
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for artists, releases, or tracks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            className="w-full py-2 pl-10 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FiX className="h-5 w-5 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {isSearching ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : results.length > 0 ? (
            <div>
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Group results by type */}
                {results.some(r => r.type === 'artist') && (
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase px-3 py-1">Artists</h3>
                    {results.filter(r => r.type === 'artist').map(result => (
                      <Link
                        key={`artist-${result.id}`}
                        href={`/artist/${result.id}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center px-3 py-2 hover:bg-gray-700 rounded-md"
                      >
                        <div className="mr-3 flex-shrink-0">
                          <div className="w-10 h-10 bg-purple-900 rounded-full flex items-center justify-center">
                            {result.image_url ? (
                              <img
                                src={result.image_url}
                                alt={result.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <FiUser className="text-white" />
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-white">{result.name}</p>
                          <p className="text-xs text-gray-400">Artist</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {results.some(r => r.type === 'release') && (
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase px-3 py-1">Releases</h3>
                    {results.filter(r => r.type === 'release').map(result => (
                      <Link
                        key={`release-${result.id}`}
                        href={`/release/${result.id}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center px-3 py-2 hover:bg-gray-700 rounded-md"
                      >
                        <div className="mr-3 flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                            {result.image_url ? (
                              <img
                                src={result.image_url}
                                alt={result.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <FiDisc className="text-white" />
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-white">{result.name}</p>
                          {result.artist_name && (
                            <p className="text-xs text-gray-400">
                              by{' '}
                              <Link
                                href={`/artist/${result.artist_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-purple-400"
                              >
                                {result.artist_name}
                              </Link>
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {results.some(r => r.type === 'track') && (
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase px-3 py-1">Tracks</h3>
                    {results.filter(r => r.type === 'track').map(result => (
                      <Link
                        key={`track-${result.id}`}
                        href={`/track/${result.id}`}
                        onClick={() => setShowResults(false)}
                        className="flex items-center px-3 py-2 hover:bg-gray-700 rounded-md"
                      >
                        <div className="mr-3 flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            <FiMusic className="text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-white">{result.name}</p>
                          {result.artist_name && (
                            <p className="text-xs text-gray-400">
                              by{' '}
                              <Link
                                href={`/artist/${result.artist_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-purple-400"
                              >
                                {result.artist_name}
                              </Link>
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-gray-700">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setShowResults(false)}
                  className="block px-3 py-2 text-center text-purple-400 hover:text-purple-300"
                >
                  View all results for "{query}"
                </Link>
              </div>
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-400">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 