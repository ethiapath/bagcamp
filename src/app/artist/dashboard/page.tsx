'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/utils/supabase/client';
import { FiEdit2, FiMusic, FiPackage, FiBarChart2, FiPlus, FiSettings, FiAlertCircle } from 'react-icons/fi';
import ReleasesList from '@/components/artist/ReleasesList';

interface Artist {
  id: string;
  name: string;
  bio: string | null;
  location: string | null;
  genres: string[] | null;
  profile_image_url: string | null;
  social_links: { platform: string; url: string }[] | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Create a component that safely uses useSearchParams with Suspense
function ArtistDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { user } = useAuth();
  const supabase = createClient();
  
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
    if (!user && !isLoading) {
      router.push('/login?redirect=/artist/dashboard');
    }
  }, [user, router, isLoading]);

  // Load artist profile
  useEffect(() => {
    const fetchArtistProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (artistError) {
          if (artistError.code === 'PGRST116') {
            // No artist profile found, redirect to create page
            router.push('/artist/create');
            return;
          }
          throw artistError;
        }
        
        if (artistData) {
          setArtist(artistData as Artist);
          
          // Fetch stats
          const [releasesResponse, merchandiseResponse] = await Promise.all([
            supabase
              .from('releases')
              .select('id', { count: 'exact' })
              .eq('artist_id', artistData.id),
            supabase
              .from('merchandise')
              .select('id', { count: 'exact' })
              .eq('artist_id', artistData.id)
          ]);
          
          setStats({
            releases: releasesResponse.count || 0,
            merchandiseItems: merchandiseResponse.count || 0,
            followers: 0, // This would be a count from a followers/following table (future feature)
            sales: 0 // This would be a sum from a sales/transactions table (future feature)
          });
        }
      } catch (err: any) {
        console.error('Error fetching artist profile:', err);
        setError(err.message || 'Failed to load artist profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtistProfile();
  }, [user, router, supabase]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Please log in to access your artist dashboard.</p>
          <Link 
            href="/login?redirect=/artist/dashboard"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            Log in
          </Link>
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
        <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{artist?.name} Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your music, merchandise, and profile</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link
              href={`/artist/${artist?.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            >
              View Public Profile
            </Link>
            <Link
              href="/artist/edit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiEdit2 className="-ml-1 mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-indigo-100 dark:bg-indigo-900">
                <FiMusic className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Releases</h3>
                <p className="text-2xl font-semibold">{stats.releases}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-purple-100 dark:bg-purple-900">
                <FiPackage className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Merchandise</h3>
                <p className="text-2xl font-semibold">{stats.merchandiseItems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-pink-100 dark:bg-pink-900">
                <svg className="h-6 w-6 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Followers</h3>
                <p className="text-2xl font-semibold">{stats.followers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-green-100 dark:bg-green-900">
                <FiBarChart2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sales</h3>
                <p className="text-2xl font-semibold">${stats.sales.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <Link
                href="/artist/dashboard?tab=overview"
                className={`${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Overview
              </Link>
              
              <Link
                href="/artist/dashboard?tab=releases"
                className={`${
                  activeTab === 'releases'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Releases
              </Link>
              
              <Link
                href="/artist/dashboard?tab=merchandise"
                className={`${
                  activeTab === 'merchandise'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Merchandise
              </Link>
              
              <Link
                href="/artist/dashboard?tab=fans"
                className={`${
                  activeTab === 'fans'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Fans
              </Link>
              
              <Link
                href="/artist/dashboard?tab=settings"
                className={`${
                  activeTab === 'settings'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Settings
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
                  <p className="text-gray-500 dark:text-gray-400 italic">Activity feed coming soon</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
                  <div className="space-y-4">
                    <Link 
                      href="/artist/releases/create"
                      className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <FiMusic className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      <div className="ml-4">
                        <p className="font-medium">Upload New Release</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add albums, EPs, singles or mixes to your catalog</p>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/artist/merchandise/create"
                      className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <FiPackage className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <div className="ml-4">
                        <p className="font-medium">Add Merchandise</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create and sell physical or digital merchandise</p>
                      </div>
                    </Link>
                    
                    <Link 
                      href="/artist/edit"
                      className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <FiSettings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      <div className="ml-4">
                        <p className="font-medium">Update Profile</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Edit your bio, social links and profile image</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Your Releases</h2>
                  <Link 
                    href="/artist/dashboard?tab=releases"
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View All
                  </Link>
                </div>
                {artist && <ReleasesList artistId={artist.id} limit={3} showAllLink={false} isOwner={true} />}
              </div>
            </div>
          )}
          
          {activeTab === 'releases' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Releases</h2>
                <Link 
                  href="/artist/releases/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                  New Release
                </Link>
              </div>
              
              {artist && <ReleasesList artistId={artist.id} limit={0} showAllLink={false} isOwner={true} />}
            </div>
          )}
          
          {activeTab === 'merchandise' && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Merchandise</h2>
                <Link 
                  href="/artist/merchandise/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                  New Item
                </Link>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 italic text-center my-8">Merchandise management coming soon</p>
            </div>
          )}
          
          {activeTab === 'fans' && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Your Fans</h2>
              <p className="text-gray-500 dark:text-gray-400 italic text-center my-8">Fan management and analytics coming soon</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Artist Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Profile Settings</h3>
                  <Link 
                    href="/artist/edit"
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Edit your artist profile
                  </Link>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Account Settings</h3>
                  <Link 
                    href="/account"
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Manage your account
                  </Link>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Payment Settings</h3>
                  <p className="text-gray-500 dark:text-gray-400 italic">Payment settings coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ArtistDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ArtistDashboardContent />
    </Suspense>
  );
} 