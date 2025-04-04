'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { FiMusic, FiPackage, FiExternalLink, FiShare2, FiHeart, FiStar } from 'react-icons/fi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Artist {
  id: string;
  name: string;
  bio: string | null;
  location: string | null;
  genres: string[];
  website_url: string | null;
  social_links: { platform: string; url: string }[];
  image_url: string | null;
  created_at: string;
}

export default function ArtistProfilePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Placeholder data for releases and merchandise
  const [releases, setReleases] = useState([]);
  const [merchandise, setMerchandise] = useState([]);

  // Load artist profile
  useEffect(() => {
    const fetchArtistProfile = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .eq('id', slug)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setArtist(data as Artist);
          
          // Check if the user is following this artist (would be implemented when we have a followers table)
          if (user) {
            // This is where we'd check the followers table
            setIsFollowing(false);
          }
          
          // Fetch releases (for future implementation)
          // Fetch merchandise (for future implementation)
        } else {
          setError('Artist not found');
        }
      } catch (err: any) {
        console.error('Error fetching artist profile:', err);
        setError(err.message || 'Failed to load artist profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtistProfile();
  }, [slug, user]);

  const handleFollow = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = `/login?redirect=/artist/${slug}`;
      return;
    }
    
    // Toggle following status (would be implemented with a followers table)
    setIsFollowing(!isFollowing);
    
    // Here we would add/remove the user from the followers table
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artist?.name || 'Artist on Bagcamp',
        text: `Check out ${artist?.name} on Bagcamp!`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading artist profile...</p>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-white mb-2">Artist Not Found</h2>
          <p className="text-gray-300 mb-4">{error || 'The artist you\'re looking for doesn\'t exist or has been removed.'}</p>
          <Link 
            href="/discover" 
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Discover Artists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative bg-purple-900 bg-opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col md:flex-row items-center md:items-end">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-800 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6 flex-shrink-0 border-2 border-purple-500">
              {artist.image_url ? (
                <img 
                  src={artist.image_url} 
                  alt={artist.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-900">
                  <span className="text-5xl font-bold text-white">{artist.name.charAt(0)}</span>
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{artist.name}</h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                {artist.genres.map(genre => (
                  <span 
                    key={genre} 
                    className="px-2 py-0.5 bg-gray-800 bg-opacity-60 rounded-full text-xs text-gray-200"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              <p className="text-gray-300 text-sm md:text-base">
                {artist.location && `${artist.location} • `}
                Joined {new Date(artist.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center gap-2">
              <button
                onClick={handleFollow}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  isFollowing 
                    ? 'bg-purple-700 text-white border border-purple-500' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <FiHeart className={`mr-2 h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FiShare2 className="mr-1 h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Sidebar - Bio and Links */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-white mb-4">About</h2>
              
              {artist.bio ? (
                <p className="text-gray-300 mb-6 whitespace-pre-line">{artist.bio}</p>
              ) : (
                <p className="text-gray-500 italic mb-6">This artist hasn't added a bio yet.</p>
              )}
              
              {(artist.website_url || (artist.social_links && artist.social_links.length > 0)) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Links</h3>
                  <div className="space-y-2">
                    {artist.website_url && (
                      <a 
                        href={artist.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-purple-400 hover:text-purple-300"
                      >
                        <FiExternalLink className="mr-2 h-4 w-4" />
                        Website
                      </a>
                    )}
                    
                    {artist.social_links?.map((link, index) => (
                      <a 
                        key={index}
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-purple-400 hover:text-purple-300"
                      >
                        <FiExternalLink className="mr-2 h-4 w-4" />
                        {link.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* This section would show top supporters when implemented */}
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-white mb-4">Top Supporters</h2>
              <p className="text-gray-400 text-sm">
                Support this artist by purchasing their music or merchandise.
              </p>
            </div>
          </div>
          
          {/* Main Content - Music and Merchandise */}
          <div className="md:col-span-2 space-y-8">
            {/* Music Releases */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Music</h2>
              </div>
              
              {releases && releases.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Would map over actual releases here */}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-800 rounded-lg">
                  <FiMusic className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Music Yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    {artist.name} hasn't uploaded any music yet. Check back soon!
                  </p>
                </div>
              )}
            </div>
            
            {/* Merchandise */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Merchandise</h2>
              </div>
              
              {merchandise && merchandise.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Would map over actual merchandise here */}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-800 rounded-lg">
                  <FiPackage className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Merchandise Yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    {artist.name} hasn't added any merchandise yet. Check back soon!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 