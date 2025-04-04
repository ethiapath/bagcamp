'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@supabase/supabase-js';
import { FiSave, FiX, FiArrowLeft, FiAlertCircle, FiCheck } from 'react-icons/fi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Predefined list of genres
const GENRES = [
  'Electronic', 'Techno', 'House', 'Ambient', 'Experimental',
  'Hip-Hop', 'Bass', 'Drum & Bass', 'Dubstep', 'IDM',
  'Trap', 'Trance', 'Footwork', 'Breakbeat', 'Electro',
  'Downtempo', 'Synthwave', 'Vaporwave', 'Lo-Fi', 'Future Bass'
];

export default function EditArtistProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Form fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([
    { platform: '', url: '' }
  ]);
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/artist/edit');
    }
  }, [user, router]);

  // Load artist profile data
  useEffect(() => {
    const fetchArtistProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Populate form with existing data
          setName(data.name || '');
          setBio(data.bio || '');
          setLocation(data.location || '');
          setSelectedGenres(data.genres || []);
          setWebsiteUrl(data.website_url || '');
          setImageUrl(data.image_url || '');
          setSocialLinks(data.social_links || [{ platform: '', url: '' }]);
        } else {
          // No artist profile found, redirect to create page
          router.push('/artist/create');
        }
      } catch (err: any) {
        console.error('Error fetching artist profile:', err);
        setError('Failed to load artist profile. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchArtistProfile();
  }, [user, router]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prevGenres => 
      prevGenres.includes(genre)
        ? prevGenres.filter(g => g !== genre)
        : [...prevGenres, genre]
    );
  };

  const handleAddCustomGenre = () => {
    if (customGenre && !selectedGenres.includes(customGenre)) {
      setSelectedGenres(prev => [...prev, customGenre]);
      setCustomGenre('');
    }
  };

  const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const handleRemoveSocialLink = (index: number) => {
    if (socialLinks.length > 1) {
      const newLinks = [...socialLinks];
      newLinks.splice(index, 1);
      setSocialLinks(newLinks);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      setError('Artist name is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Filter out empty social links
      const filteredSocialLinks = socialLinks.filter(link => link.platform && link.url);
      
      // First try with social_links
      let updateResult = await supabase
        .from('artists')
        .update({
          name,
          bio,
          location,
          genres: selectedGenres,
          website_url: websiteUrl,
          image_url: imageUrl,
          social_links: filteredSocialLinks,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);
      
      // If there's an error about social_links, try without it
      if (updateResult.error && updateResult.error.message.includes('social_links')) {
        console.warn('social_links column not found, updating without social links');
        updateResult = await supabase
          .from('artists')
          .update({
            name,
            bio,
            location,
            genres: selectedGenres,
            website_url: websiteUrl,
            image_url: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user!.id);
      }
      
      if (updateResult.error) throw updateResult.error;
      
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating artist profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              href="/artist/dashboard" 
              className="text-gray-400 hover:text-white mr-3"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Edit Artist Profile</h1>
          </div>
          <p className="text-gray-400">Update your artist information to showcase your work on Bagcamp.</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-md">
            <div className="flex items-center">
              <FiAlertCircle className="text-red-400 mr-3" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900 bg-opacity-50 border border-green-700 rounded-md">
            <div className="flex items-center">
              <FiCheck className="text-green-400 mr-3" />
              <p className="text-green-200">{successMessage}</p>
            </div>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 rounded-lg shadow-md p-6">
          {/* Artist Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Artist Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Your artist or project name"
              required
            />
          </div>
          
          {/* Artist Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell your fans about yourself and your music"
            />
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="City, Country"
            />
          </div>
          
          {/* Profile Image */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-1">
              Profile Image URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/your-image.jpg"
            />
            {imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-400 mb-1">Preview:</p>
                <div className="w-20 h-20 bg-gray-700 rounded-full overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/150?text=Error';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Genres
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedGenres.includes(genre)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add custom genre"
              />
              <button
                type="button"
                onClick={handleAddCustomGenre}
                disabled={!customGenre}
                className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            
            {selectedGenres.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-400 mb-1">Selected genres:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedGenres.map(genre => (
                    <div 
                      key={genre} 
                      className="flex items-center px-3 py-1 bg-gray-700 rounded-full text-sm text-white"
                    >
                      {genre}
                      <button
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        className="ml-2 text-gray-400 hover:text-gray-200 focus:outline-none"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Website */}
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-300 mb-1">
              Website URL
            </label>
            <input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
          
          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Social Links
            </label>
            
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={link.platform}
                  onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                  className="w-1/3 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Platform (e.g., Instagram)"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                  className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="URL"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSocialLink(index)}
                  className="p-2 text-gray-400 hover:text-gray-200 focus:outline-none"
                  disabled={socialLinks.length === 1}
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={handleAddSocialLink}
              className="text-purple-400 hover:text-purple-300 text-sm focus:outline-none"
            >
              + Add another social link
            </button>
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || !name}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <Link
            href="/artist/dashboard"
            className="text-gray-400 hover:text-white text-sm"
          >
            Cancel and return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 