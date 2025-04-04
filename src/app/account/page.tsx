'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { FiSave, FiUser, FiMail, FiLock } from 'react-icons/fi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AccountPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      // Check if user has an artist profile
      checkForArtistProfile();
    }
  }, [user, router]);

  const checkForArtistProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('id')
        .eq('id', user?.id)
        .single();
      
      if (data) {
        setIsArtist(true);
        setProfileId(data.id);
      }
    } catch (err) {
      // User doesn't have an artist profile, which is fine
      console.log('No artist profile found');
    }
  };
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setName(data.name || '');
          setAvatarUrl(data.avatar_url || '');
        } else {
          // Create profile if it doesn't exist
          await supabase.from('profiles').insert([
            { id: user.id, email: user.email }
          ]);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user?.id, 
          name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString() 
        });
      
      if (error) throw error;
      
      setSuccessMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleArtistDashboard = () => {
    router.push('/artist/dashboard');
  };

  const handleCreateArtistProfile = () => {
    router.push('/artist/create');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Please log in to view your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Your Account</h1>
        
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="appearance-none rounded relative block w-full px-10 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  Email cannot be changed.
                </p>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none rounded relative block w-full px-10 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Your display name"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-300 mb-1">
                  Profile Image URL
                </label>
                <input
                  type="text"
                  id="avatar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="appearance-none rounded relative block w-full px-4 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="https://example.com/your-image.jpg"
                />
                <p className="mt-1 text-sm text-gray-400">
                  Enter a URL for your profile image.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FiSave className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Artist Profile</h2>
          
          {isArtist ? (
            <div>
              <p className="text-gray-300 mb-4">
                You have an artist profile on Bagcamp. Manage your music, merchandise, and more from your artist dashboard.
              </p>
              <button
                onClick={handleArtistDashboard}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Go to Artist Dashboard
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-300 mb-4">
                You don't have an artist profile yet. Create one to share your music with the world!
              </p>
              <button
                onClick={handleCreateArtistProfile}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Create Artist Profile
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Account Security</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-md font-medium text-white">Password</h3>
                <p className="text-sm text-gray-400">Update your password</p>
              </div>
              <button
                onClick={() => router.push('/reset-password')}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Change Password
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
} 