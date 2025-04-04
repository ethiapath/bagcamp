'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { FiMusic, FiCalendar, FiDollarSign } from 'react-icons/fi'

interface Release {
  id: string
  title: string
  type: string
  year: number
  cover_image_url: string | null
  price: number | null
  allow_name_your_price: boolean
  minimum_price: number | null
  published: boolean
}

interface ReleasesListProps {
  artistId: string
  limit?: number
  showAllLink?: boolean
  isOwner?: boolean
}

export default function ReleasesList({ 
  artistId, 
  limit = 6, 
  showAllLink = true, 
  isOwner = false 
}: ReleasesListProps) {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()
  
  useEffect(() => {
    async function fetchReleases() {
      try {
        let query = supabase
          .from('releases')
          .select('*')
          .eq('artist_id', artistId)
          .order('created_at', { ascending: false })
        
        if (!isOwner) {
          query = query.eq('published', true)
        }
        
        if (limit > 0) {
          query = query.limit(limit)
        }
        
        const { data, error: fetchError } = await query
        
        if (fetchError) throw new Error(fetchError.message)
        
        setReleases(data || [])
      } catch (err: any) {
        console.error('Error fetching releases:', err)
        setError('Failed to load releases')
      } finally {
        setLoading(false)
      }
    }
    
    fetchReleases()
  }, [artistId, isOwner, limit, supabase])
  
  // Format price display
  const formatPrice = (release: Release) => {
    if (release.allow_name_your_price) {
      if (release.minimum_price && release.minimum_price > 0) {
        return `Name your price (min: $${release.minimum_price.toFixed(2)})`
      }
      return 'Name your price'
    } else if (release.price) {
      return `$${release.price.toFixed(2)}`
    }
    return 'Free'
  }
  
  if (loading) {
    return (
      <div className="text-center my-8">
        <p className="text-gray-500">Loading releases...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center my-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }
  
  if (releases.length === 0) {
    return (
      <div className="text-center my-8">
        <p className="text-gray-500 italic">No releases available yet</p>
        {isOwner && (
          <div className="mt-4">
            <Link 
              href="/artist/releases/create" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiMusic className="mr-2" /> Add your first release
            </Link>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {releases.map((release) => (
          <Link 
            key={release.id} 
            href={`/release/${release.id}`}
            className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-md"
          >
            <div className="relative aspect-square w-full bg-gray-200 dark:bg-gray-700">
              {release.cover_image_url ? (
                <Image 
                  src={release.cover_image_url} 
                  alt={release.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FiMusic size={48} className="text-gray-400" />
                </div>
              )}
              {!release.published && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  Draft
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                {release.title}
              </h3>
              <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FiCalendar className="mr-1" size={14} />
                <span>{release.year} • {release.type}</span>
              </div>
              <div className="mt-2 flex items-center text-sm font-medium">
                <FiDollarSign className="mr-1" size={14} />
                <span>{formatPrice(release)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {showAllLink && releases.length >= limit && (
        <div className="text-center mt-8">
          <Link 
            href={`/artist/${artistId}/releases`}
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            View all releases
          </Link>
        </div>
      )}
      
      {isOwner && (
        <div className="text-center mt-8">
          <Link 
            href="/artist/releases/create" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiMusic className="mr-2" /> Add new release
          </Link>
        </div>
      )}
    </div>
  )
} 