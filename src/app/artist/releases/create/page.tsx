'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/utils/supabase/client'
import { FiMusic, FiDollarSign, FiImage, FiList, FiPlus, FiTrash2, FiInfo, FiClock, FiUpload } from 'react-icons/fi'
import Link from 'next/link'

const RELEASE_TYPES = [
  'Album',
  'EP',
  'Single',
  'Mix',
  'Compilation',
  'Live'
]

export default function CreateReleasePage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, loading: authLoading } = useAuth()
  
  // Form states
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Album')
  const [year, setYear] = useState(new Date().getFullYear())
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState('')
  const [price, setPrice] = useState('')
  const [allowNameYourPrice, setAllowNameYourPrice] = useState(false)
  const [minimumPrice, setMinimumPrice] = useState('')
  const [streamingEnabled, setStreamingEnabled] = useState(true)
  const [streamingLimit, setStreamingLimit] = useState('')
  const [published, setPublished] = useState(false)
  
  // Tracks state
  const [tracks, setTracks] = useState([
    { id: '1', title: '', trackNumber: 1, duration: '', audioFile: null as File | null }
  ])
  
  // UI states
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [artistId, setArtistId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Check if user is authenticated and has an artist profile
  useEffect(() => {
    async function checkUserArtist() {
      if (!user && !authLoading) {
        router.push('/login?redirect=/artist/releases/create')
        return
      }
      
      if (user) {
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (artistError || !artistData) {
          router.push('/artist/create')
          return
        }
        
        setArtistId(artistData.id)
      }
    }
    
    checkUserArtist()
  }, [user, authLoading, router, supabase])

  // Handle cover image selection
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
      setCoverImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle track audio file selection
  const handleTrackFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      const updatedTracks = [...tracks]
      updatedTracks[index].audioFile = file
      setTracks(updatedTracks)
    }
  }

  // Add a new track
  const addTrack = () => {
    setTracks([
      ...tracks,
      {
        id: (tracks.length + 1).toString(),
        title: '',
        trackNumber: tracks.length + 1,
        duration: '',
        audioFile: null
      }
    ])
  }

  // Remove a track
  const removeTrack = (index: number) => {
    if (tracks.length > 1) {
      const updatedTracks = tracks.filter((_, i) => i !== index)
      // Update track numbers
      updatedTracks.forEach((track, i) => {
        track.trackNumber = i + 1
      })
      setTracks(updatedTracks)
    }
  }

  // Update track title
  const updateTrackTitle = (index: number, title: string) => {
    const updatedTracks = [...tracks]
    updatedTracks[index].title = title
    setTracks(updatedTracks)
  }

  // Update track duration (in seconds)
  const updateTrackDuration = (index: number, durationStr: string) => {
    const updatedTracks = [...tracks]
    updatedTracks[index].duration = durationStr
    setTracks(updatedTracks)
  }

  // Parse duration string (mm:ss) to seconds
  const parseDuration = (durationStr: string): number => {
    if (!durationStr) return 0
    
    const parts = durationStr.split(':')
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10)
      const seconds = parseInt(parts[1], 10)
      return minutes * 60 + seconds
    }
    return parseInt(durationStr, 10) || 0
  }

  // Format seconds to mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Validate form
  const validateForm = (): boolean => {
    if (!title) {
      setError('Please enter a release title')
      return false
    }
    
    if (!type) {
      setError('Please select a release type')
      return false
    }
    
    if (!year || year < 1900 || year > new Date().getFullYear() + 1) {
      setError('Please enter a valid year')
      return false
    }
    
    if (!coverImageFile && !coverImageUrl) {
      setError('Please upload a cover image')
      return false
    }
    
    if (allowNameYourPrice && (!minimumPrice || parseFloat(minimumPrice) < 0)) {
      setError('Please enter a valid minimum price')
      return false
    }
    
    if (!allowNameYourPrice && (!price || parseFloat(price) < 0)) {
      setError('Please enter a valid price')
      return false
    }
    
    // Validate tracks
    for (const track of tracks) {
      if (!track.title) {
        setError(`Please enter a title for track ${track.trackNumber}`)
        return false
      }
      
      if (!track.duration) {
        setError(`Please enter a duration for track ${track.trackNumber}`)
        return false
      }
    }
    
    return true
  }

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) return
    if (!artistId) {
      setError('Artist profile not found. Please create one first.')
      return
    }
    
    setLoading(true)
    try {
      // 1. Upload cover image
      let coverUrl = coverImageUrl
      if (coverImageFile) {
        const coverFileName = `${Date.now()}-cover-${coverImageFile.name.replace(/\s+/g, '-').toLowerCase()}`
        const { data: coverData, error: coverError } = await supabase.storage
          .from('release-images')
          .upload(coverFileName, coverImageFile)
        
        if (coverError) throw new Error(`Cover image upload failed: ${coverError.message}`)
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('release-images')
          .getPublicUrl(coverFileName)
        
        coverUrl = publicUrlData.publicUrl
      }
      
      // 2. Create release record
      const { data: releaseData, error: releaseError } = await supabase
        .from('releases')
        .insert([
          {
            title,
            type,
            year,
            description,
            cover_image_url: coverUrl,
            artist_id: artistId,
            price: price ? parseFloat(price) : null,
            allow_name_your_price: allowNameYourPrice,
            minimum_price: minimumPrice ? parseFloat(minimumPrice) : null,
            streaming_enabled: streamingEnabled,
            streaming_limit: streamingLimit ? parseInt(streamingLimit) : null,
            published
          }
        ])
        .select()
      
      if (releaseError) throw new Error(`Failed to create release: ${releaseError.message}`)
      
      const releaseId = releaseData[0].id
      
      // 3. Upload tracks and create track records
      const trackPromises = tracks.map(async (track, index) => {
        // Progress update
        const progressStep = 100 / tracks.length
        
        // Upload audio file if provided
        let audioUrl = null
        if (track.audioFile) {
          const audioFileName = `${Date.now()}-track-${track.trackNumber}-${track.audioFile.name.replace(/\s+/g, '-').toLowerCase()}`
          const { error: audioError } = await supabase.storage
            .from('track-audio')
            .upload(audioFileName, track.audioFile)
          
          if (audioError) throw new Error(`Audio upload failed for track ${track.trackNumber}: ${audioError.message}`)
          
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('track-audio')
            .getPublicUrl(audioFileName)
          
          audioUrl = publicUrlData.publicUrl
        }
        
        // Create track record
        const { error: trackError } = await supabase
          .from('tracks')
          .insert([
            {
              title: track.title,
              release_id: releaseId,
              track_number: track.trackNumber,
              duration: parseDuration(track.duration),
              audio_url: audioUrl,
              preview_url: audioUrl, // For now, use the same URL for preview
              preview_duration: 30 // Default 30 second preview
            }
          ])
        
        if (trackError) throw new Error(`Failed to create track ${track.trackNumber}: ${trackError.message}`)
        
        // Update progress
        setUploadProgress((prevProgress) => prevProgress + progressStep)
      })
      
      await Promise.all(trackPromises)
      
      setSuccess(true)
      setTimeout(() => {
        router.push(`/artist/dashboard?tab=releases`)
      }, 2000)
    } catch (err: any) {
      console.error('Error creating release:', err)
      setError(err.message || 'Failed to create release. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Create New Release</h1>
          <Link 
            href="/artist/dashboard?tab=releases" 
            className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            Back to Dashboard
          </Link>
        </div>
        
        {success ? (
          <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-md mb-6">
            Release created successfully! Redirecting to your dashboard...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md">
                {error}
              </div>
            )}
            
            {/* Release Details Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiMusic className="mr-2" /> Release Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                    placeholder="Album title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                    required
                  >
                    {RELEASE_TYPES.map((releaseType) => (
                      <option key={releaseType} value={releaseType}>
                        {releaseType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cover Image <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <label className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <FiUpload className="mr-2" />
                      <span className="text-sm">{coverImageFile ? coverImageFile.name : 'Select image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {coverImagePreview && (
                    <div className="mt-2">
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        className="h-20 w-20 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                  placeholder="Describe your release"
                />
              </div>
            </div>
            
            {/* Pricing Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiDollarSign className="mr-2" /> Pricing
              </h2>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="nameYourPrice"
                    checked={allowNameYourPrice}
                    onChange={(e) => setAllowNameYourPrice(e.target.checked)}
                    className="mr-2"
                  />
                  <label 
                    htmlFor="nameYourPrice"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Allow fans to pay what they want
                  </label>
                </div>
                
                {allowNameYourPrice ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Minimum Price (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        value={minimumPrice}
                        onChange={(e) => setMinimumPrice(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full pl-7 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Set to 0 to allow free downloads
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full pl-7 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                        placeholder="9.99"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="streamingEnabled"
                    checked={streamingEnabled}
                    onChange={(e) => setStreamingEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  <label 
                    htmlFor="streamingEnabled"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Enable streaming
                  </label>
                </div>
                
                {streamingEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Streaming Limit (number of plays)
                    </label>
                    <input
                      type="number"
                      value={streamingLimit}
                      onChange={(e) => setStreamingLimit(e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                      placeholder="Leave empty for unlimited"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Number of times a fan can listen before purchasing. Leave empty for unlimited.
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="publishRelease"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="mr-2"
                  />
                  <label 
                    htmlFor="publishRelease"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Publish immediately (make public)
                  </label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  If unchecked, your release will be saved as a draft and not visible to the public.
                </p>
              </div>
            </div>
            
            {/* Tracks Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiList className="mr-2" /> Tracks
              </h2>
              
              <div className="space-y-4">
                {tracks.map((track, index) => (
                  <div key={track.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-md font-medium">Track {track.trackNumber}</h3>
                      {tracks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTrack(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={track.title}
                          onChange={(e) => updateTrackTitle(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                          placeholder="Track title"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Duration (mm:ss) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center">
                          <FiClock className="text-gray-400 mr-2" />
                          <input
                            type="text"
                            value={track.duration}
                            onChange={(e) => updateTrackDuration(index, e.target.value)}
                            pattern="([0-9]+:)?[0-5]?[0-9]"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                            placeholder="3:45"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Audio File
                      </label>
                      <label className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <FiUpload className="mr-2" />
                        <span className="text-sm">{track.audioFile ? track.audioFile.name : 'Select audio file'}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleTrackFileChange(e, index)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addTrack}
                  className="flex items-center justify-center w-full py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FiPlus className="mr-2" /> Add Track
                </button>
              </div>
            </div>
            
            {/* Submission */}
            <div className="flex flex-col space-y-4">
              {loading && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating Release...' : 'Create Release'}
              </button>
              
              <Link 
                href="/artist/dashboard?tab=releases"
                className="text-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 