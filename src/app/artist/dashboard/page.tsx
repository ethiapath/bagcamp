'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { FiEdit2, FiMusic, FiPackage, FiBarChart2, FiPlus, FiSettings, FiAlertCircle } from 'react-icons/fi';

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

export default function ArtistDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    releases: 0,
    merchandiseItems: 0,
    followers: 0,
    sales: 0
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/artist/dashboard');
    }
  }, [user, router]);

  // Load artist profile
  useEffect(() => {
    const fetchArtistProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setArtist(data as Artist);
          
          // Fetch stats (for now we'll use mock data, but this would connect to real tables)
          // This is where we'd count releases, merchandise, followers, etc.
          setStats({
            releases: 0, // This would be a count from the releases table
            merchandiseItems: 0, // This would be a count from the merchandise table
            followers: 0, // This would be a count from a followers/following table
            sales: 0 // This would be a sum from a sales/transactions table
          });
        } else {
          // No artist profile found, redirect to create page
          router.push('/artist/create');
        }
      } catch (err: any) {
        console.error('Error fetching artist profile:', err);
        setError(err.message || 'Failed to load artist profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtistProfile();
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Please log in to access your artist dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading your artist dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{artist?.name} Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your music, merchandise, and profile</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link
              href={`/artist/${user.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mr-3"
            >
              View Public Profile
            </Link>
            <Link
              href="/artist/edit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FiEdit2 className="-ml-1 mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-purple-900 bg-opacity-50">
                <FiMusic className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">Releases</h3>
                <p className="text-2xl font-semibold text-white">{stats.releases}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-indigo-900 bg-opacity-50">
                <FiPackage className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">Merchandise</h3>
                <p className="text-2xl font-semibold text-white">{stats.merchandiseItems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-pink-900 bg-opacity-50">
                <svg className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">Followers</h3>
                <p className="text-2xl font-semibold text-white">{stats.followers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-green-900 bg-opacity-50">
                <FiBarChart2 className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-400">Sales</h3>
                <p className="text-2xl font-semibold text-white">${stats.sales}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Profile</h2>
            
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-gray-700 rounded-full overflow-hidden mb-4">
                {artist?.image_url ? (
                  <img 
                    src={artist.image_url} 
                    alt={artist.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-900">
                    <span className="text-3xl font-bold text-white">{artist?.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-white text-center">{artist?.name}</h3>
              <p className="text-gray-400 text-center mt-1">{artist?.location || 'Location not specified'}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Bio</h4>
                <p className="text-white text-sm">
                  {artist?.bio || 'No bio provided. Add a bio to tell fans about yourself and your music.'}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {artist?.genres.map(genre => (
                    <span 
                      key={genre} 
                      className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
                    >
                      {genre}
                    </span>
                  ))}
                  {!artist?.genres.length && (
                    <p className="text-gray-500 text-sm">No genres specified</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Links</h4>
                <div className="space-y-2">
                  {artist?.website_url && (
                    <a 
                      href={artist.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm block"
                    >
                      {artist.website_url}
                    </a>
                  )}
                  
                  {artist?.social_links?.map((link, index) => (
                    <a 
                      key={index}
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm block"
                    >
                      {link.platform}
                    </a>
                  ))}
                  
                  {(!artist?.website_url && (!artist?.social_links || artist.social_links.length === 0)) && (
                    <p className="text-gray-500 text-sm">No links provided</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                href="/artist/edit"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FiEdit2 className="-ml-1 mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </div>
          </div>
          
          {/* Music & Merchandise Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Music Releases */}
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Your Music</h2>
                <Link
                  href="/artist/releases/new"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <FiPlus className="-ml-1 mr-1 h-4 w-4" />
                  Add Release
                </Link>
              </div>
              
              {stats.releases > 0 ? (
                <div className="space-y-4">
                  {/* Would map over actual releases here */}
                  <p className="text-gray-400">Your releases will appear here</p>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-900 rounded-lg">
                  <FiMusic className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Music Yet</h3>
                  <p className="text-gray-400 mb-4 max-w-md mx-auto">
                    Share your music with the world! Add your first release to get started.
                  </p>
                  <Link
                    href="/artist/releases/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                    Add Your First Release
                  </Link>
                </div>
              )}
            </div>
            
            {/* Merchandise */}
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Your Merchandise</h2>
                <Link
                  href="/artist/merchandise/new"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <FiPlus className="-ml-1 mr-1 h-4 w-4" />
                  Add Merch
                </Link>
              </div>
              
              {stats.merchandiseItems > 0 ? (
                <div className="space-y-4">
                  {/* Would map over actual merchandise here */}
                  <p className="text-gray-400">Your merchandise will appear here</p>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-900 rounded-lg">
                  <FiPackage className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Merchandise Yet</h3>
                  <p className="text-gray-400 mb-4 max-w-md mx-auto">
                    Sell merchandise to your fans! T-shirts, vinyl, physical media, or digital goods.
                  </p>
                  <Link
                    href="/artist/merchandise/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                    Add Your First Item
                  </Link>
                </div>
              )}
            </div>
            
            {/* Account Settings */}
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Settings & Actions</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/artist/settings"
                  className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  <FiSettings className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-white font-medium">Artist Settings</h3>
                    <p className="text-gray-400 text-sm">Payment, privacy, and account options</p>
                  </div>
                </Link>
                
                <Link
                  href="/account"
                  className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <h3 className="text-white font-medium">Account Settings</h3>
                    <p className="text-gray-400 text-sm">Manage your personal account</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 