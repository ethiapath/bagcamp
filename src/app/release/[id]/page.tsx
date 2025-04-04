'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { FiPlay, FiPause, FiClock, FiShoppingCart, FiHeart, FiShare2, FiDownload, FiList, FiDollarSign } from 'react-icons/fi'

type Track = {
  id: string
  title: string
  track_number: number
  duration: number
  audio_url: string | null
  preview_url: string | null
  preview_duration: number | null
  lyrics: string | null
  credits: string | null
}

type Release = {
  id: string
  title: string
  type: string
  year: number
  description: string | null
  cover_image_url: string | null
  artist_id: string
  artist_name: string
  price: number | null
  allow_name_your_price: boolean
  minimum_price: number | null
  streaming_enabled: boolean
  streaming_limit: number | null
  published: boolean
  created_at: string
}

export default function ReleasePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  
  // Release data
  const [release, setRelease] = useState<Release | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [isOwner, setIsOwner] = useState(false)
  
  // Playback state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  
  // Purchase state
  const [customPrice, setCustomPrice] = useState('')
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Fetch release and tracks data
  useEffect(() => {
    async function fetchReleaseData() {
      if (!params.id) return
      
      try {
        // Fetch release data with artist name
        const { data: releaseData, error: releaseError } = await supabase
          .from('releases')
          .select(`
            *,
            artists!inner (
              name
            )
          `)
          .eq('id', params.id)
          .single()
        
        if (releaseError) throw new Error(releaseError.message)
        
        if (!releaseData) {
          setError('Release not found')
          setLoading(false)
          return
        }
        
        // If release is not published, check if user is the owner
        if (!releaseData.published) {
          if (!user || user.id !== releaseData.artists.user_id) {
            setError('This release is not currently available')
            setLoading(false)
            return
          }
        }
        
        // Format release data with artist name
        const formattedRelease = {
          ...releaseData,
          artist_name: releaseData.artists.name
        }
        
        setRelease(formattedRelease)
        
        // Check if current user is the owner
        if (user) {
          const { data: artistData } = await supabase
            .from('artists')
            .select('id')
            .eq('user_id', user.id)
            .eq('id', releaseData.artist_id)
            .single()
          
          setIsOwner(!!artistData)
        }
        
        // Fetch tracks
        const { data: tracksData, error: tracksError } = await supabase
          .from('tracks')
          .select('*')
          .eq('release_id', params.id)
          .order('track_number', { ascending: true })
        
        if (tracksError) throw new Error(tracksError.message)
        
        setTracks(tracksData || [])
      } catch (err: any) {
        console.error('Error fetching release:', err)
        setError('Failed to load release data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchReleaseData()
  }, [params.id, supabase, user])
  
  // Create audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio()
      setAudioElement(audio)
      
      // Handle audio element events
      audio.addEventListener('ended', handlePlaybackEnded)
      audio.addEventListener('error', handlePlaybackError)
      
      return () => {
        audio.pause()
        audio.removeEventListener('ended', handlePlaybackEnded)
        audio.removeEventListener('error', handlePlaybackError)
      }
    }
  }, [])
  
  // Format track duration from seconds to minutes:seconds
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Play track
  const playTrack = (track: Track) => {
    if (!audioElement) return
    
    if (currentTrack?.id === track.id && isPlaying) {
      // Pause current track
      audioElement.pause()
      setIsPlaying(false)
    } else {
      // Play new track or resume paused track
      if (currentTrack?.id !== track.id) {
        setCurrentTrack(track)
        const audioSrc = track.preview_url || track.audio_url
        if (audioSrc) {
          audioElement.src = audioSrc
        } else {
          setError('No audio available for this track')
          return
        }
      }
      
      audioElement.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Error playing audio:', err)
          setError('Failed to play track')
        })
    }
  }
  
  // Handle playback ended
  const handlePlaybackEnded = () => {
    setIsPlaying(false)
    setCurrentTrack(null)
  }
  
  // Handle playback error
  const handlePlaybackError = () => {
    setIsPlaying(false)
    setError('Error playing track')
  }
  
  // Handle adding to cart
  const handleAddToCart = () => {
    // This will be implemented in Phase 2 (Monetization)
    alert('Cart functionality coming soon!')
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-500">Loading release...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md">
            {error}
          </div>
          <div className="mt-4 text-center">
            <Link href="/discover" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
              Browse other releases
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  if (!release) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-500">Release not found</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Album Cover and Info */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              {release.cover_image_url ? (
                <div className="relative aspect-square w-full">
                  <Image 
                    src={release.cover_image_url} 
                    alt={release.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500">No Cover</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 space-y-2">
              <h1 className="text-2xl font-bold">{release.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                <Link href={`/artist/${release.artist_id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  {release.artist_name}
                </Link>
              </p>
              <p className="text-gray-600 dark:text-gray-400">{release.type} • {release.year}</p>
              
              {/* Price display */}
              <div className="mt-2">
                {release.allow_name_your_price ? (
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Name your price</p>
                    <div className="mb-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <input
                          type="number"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          min={release.minimum_price || 0}
                          step="0.01"
                          className="w-full pl-7 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                          placeholder={`Minimum: $${release.minimum_price?.toFixed(2) || '0.00'}`}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FiShoppingCart className="mr-2" /> Add to Cart
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                    <p className="text-xl font-bold mb-3">{release.price ? `$${release.price.toFixed(2)} USD` : 'Free'}</p>
                    <button
                      onClick={handleAddToCart}
                      className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FiShoppingCart className="mr-2" /> Add to Cart
                    </button>
                  </div>
                )}
              </div>
              
              {/* Social actions */}
              <div className="flex justify-center space-x-4 mt-4">
                <button className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  <FiHeart />
                </button>
                <button className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  <FiShare2 />
                </button>
                {user && isOwner && (
                  <Link 
                    href={`/artist/releases/edit/${release.id}`}
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Track Listing and Description */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiList className="mr-2" /> Tracks
              </h2>
              
              {/* Track listing */}
              <div className="space-y-2">
                {tracks.length > 0 ? (
                  tracks.map((track) => (
                    <div 
                      key={track.id}
                      className={`flex items-center justify-between p-3 rounded-md ${
                        currentTrack?.id === track.id
                          ? 'bg-indigo-50 dark:bg-indigo-900'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <button
                          onClick={() => playTrack(track)}
                          className={`mr-3 h-8 w-8 flex items-center justify-center rounded-full ${
                            currentTrack?.id === track.id && isPlaying
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {currentTrack?.id === track.id && isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
                        </button>
                        <div>
                          <p className="font-medium">{track.track_number}. {track.title}</p>
                          {track.preview_url && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {track.preview_duration ? `${track.preview_duration}s preview` : 'Preview available'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <FiClock className="mr-1" size={14} />
                        <span>{formatDuration(track.duration)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No tracks available</p>
                )}
              </div>
            </div>
            
            {/* Description */}
            {release.description && (
              <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{release.description}</p>
                </div>
              </div>
            )}
            
            {/* More from this artist */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">More from {release.artist_name}</h2>
              <Link 
                href={`/artist/${release.artist_id}`}
                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View all releases
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 