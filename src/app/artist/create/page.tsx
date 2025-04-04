'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@supabase/supabase-js';
import { FiSave, FiPlus, FiX, FiMusic, FiMapPin, FiLink, FiGlobe, FiTag } from 'react-icons/fi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const popularGenres = [
  'House', 'Techno', 'Ambient', 'Experimental', 'Downtempo', 
  'Drum & Bass', 'IDM', 'Trance', 'Breakbeat', 'Electronica',
  'Synthwave', 'Lo-fi', 'Dubstep', 'Trap', 'Chillwave'
];

export default function CreateArtistProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([
    { platform: 'Instagram', url: '' },
    { platform: 'Twitter', url: '' },
    { platform: 'Bandcamp', url: '' }
  ]);
  
  // UI state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/artist/create');
    }
  }, [user, router]);

  // Check if user already has an artist profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (data) {
          // User already has an artist profile, redirect to edit page
          router.push('/artist/dashboard');
        }
      } catch (err) {
        // No artist profile, which is what we want for this page
      }
    };
    
    checkExistingProfile();
  }, [user, router]);

  // Load user data to pre-fill form
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        if (data && data.name) {
          setName(data.name);
        }
      } catch (err) {
        // Couldn't load profile, but that's ok
      }
    };
    
    loadUserProfile();
  }, [user]);

  const addGenre = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const removeGenre = (genre: string) => {
    setSelectedGenres(selectedGenres.filter(g => g !== genre));
  };

  const handleAddCustomGenre = () => {
    if (customGenre.trim() && !selectedGenres.includes(customGenre.trim())) {
      addGenre(customGenre.trim());
      setCustomGenre('');
    }
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index][field] = value;
    setSocialLinks(updatedLinks);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    const updatedLinks = [...socialLinks];
    updatedLinks.splice(index, 1);
    setSocialLinks(updatedLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic validation
    if (!name.trim()) {
      setError('Artist name is required');
      setIsLoading(false);
      return;
    }

    if (selectedGenres.length === 0) {
      setError('Please select at least one genre');
      setIsLoading(false);
      return;
    }

    try {
      // Filter out empty social links
      const filteredSocialLinks = socialLinks.filter(link => link.platform.trim() && link.url.trim());
      
      // Create artist profile
      // First try with social_links
      let result = await supabase
        .from('artists')
        .insert({
          id: user?.id,
          name,
          bio,
          location,
          genres: selectedGenres,
          website_url: websiteUrl,
          social_links: filteredSocialLinks
        });
        
      // If there's an error about social_links, try without it
      if (result.error && result.error.message.includes('social_links')) {
        console.warn('social_links column not found, inserting without social links');
        result = await supabase
          .from('artists')
          .insert({
            id: user?.id,
            name,
            bio,
            location,
            genres: selectedGenres,
            website_url: websiteUrl
          });
      }

      if (result.error) throw result.error;
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/artist/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create artist profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Please log in to create an artist profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Create Your Artist Profile</h1>
        <p className="text-gray-400 mb-8">Share your music with the world and connect with fans on Bagcamp</p>
        
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">
              Artist profile created successfully! Redirecting to your dashboard...
            </span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            {/* Artist Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Artist Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMusic className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded relative block w-full px-10 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Your artist or band name"
                  required
                />
              </div>
            </div>
            
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="appearance-none rounded relative block w-full px-4 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Tell us about your music, influences, and story"
              />
              <p className="mt-1 text-sm text-gray-400">
                {bio.length}/500 characters
              </p>
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="appearance-none rounded relative block w-full px-10 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="City, Country"
                />
              </div>
            </div>
            
            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Genres <span className="text-red-500">*</span>
              </label>
              
              {/* Selected genres */}
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedGenres.map(genre => (
                  <span 
                    key={genre}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-900 text-purple-200"
                  >
                    {genre}
                    <button 
                      type="button"
                      onClick={() => removeGenre(genre)}
                      className="ml-2 inline-flex text-purple-400 hover:text-purple-200 focus:outline-none"
                    >
                      <FiX size={16} />
                    </button>
                  </span>
                ))}
                
                {selectedGenres.length === 0 && (
                  <span className="text-sm text-gray-400">Select genres that describe your music</span>
                )}
              </div>
              
              {/* Popular genres */}
              <div className="mb-3">
                <p className="text-sm text-gray-300 mb-2">Popular genres:</p>
                <div className="flex flex-wrap gap-2">
                  {popularGenres.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => addGenre(genre)}
                      disabled={selectedGenres.includes(genre)}
                      className={`px-3 py-1 rounded-full text-sm font-medium focus:outline-none ${
                        selectedGenres.includes(genre) 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Custom genre */}
              <div className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    className="appearance-none rounded-l relative block w-full px-10 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Add custom genre"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomGenre}
                  disabled={!customGenre.trim()}
                  className="px-4 bg-purple-600 hover:bg-purple-700 border border-purple-600 rounded-r text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-1">
                Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiGlobe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="website"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="appearance-none rounded relative block w-full px-10 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            
            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Social Links
              </label>
              
              {socialLinks.map((link, index) => (
                <div key={index} className="flex space-x-2 mb-3">
                  <div className="w-1/3">
                    <input
                      type="text"
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="Platform"
                    />
                  </div>
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLink className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      className="appearance-none rounded relative block w-full px-10 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="p-2 text-red-400 hover:text-red-300 focus:outline-none"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addSocialLink}
                className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FiPlus className="-ml-0.5 mr-2 h-4 w-4" />
                Add Social Link
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || success}
              className={`flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                (isLoading || success) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <FiSave className="h-4 w-4" />
              <span>{isLoading ? 'Creating...' : 'Create Artist Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 