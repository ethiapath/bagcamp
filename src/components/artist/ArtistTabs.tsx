'use client';

import { useState } from 'react';

// The type of artist data
interface Artist {
  name: string;
  bio: string;
  location: string;
  tags: string[];
  websiteUrl: string;
  socialLinks: Record<string, string>;
  releases: Array<{
    id: number;
    title: string;
    type: string;
    year: string;
    tracks: number;
    price: number;
    imageUrl: string;
  }>;
  merchandise: Array<{
    id: number;
    title: string;
    type: string;
    price: number;
    imageUrl: string;
  }>;
}

export default function ArtistTabs({ artist }: { artist: Artist }) {
  const [activeTab, setActiveTab] = useState('music');
  
  return (
    <>
      {/* Content Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-800">
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'music' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('music')}
          >
            Music
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'merch' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('merch')}
          >
            Merchandise
          </button>
        </div>
      </div>
      
      {/* Music Releases */}
      {activeTab === 'music' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artist.releases.map((release) => (
            <div 
              key={release.id} 
              className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition"
            >
              <div className="aspect-square bg-gray-800"></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{release.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {release.type} • {release.year} • {release.tracks} tracks
                    </p>
                  </div>
                  <span className="font-semibold">${release.price}</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-full text-sm flex-grow transition">
                    Buy
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Merchandise */}
      {activeTab === 'merch' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artist.merchandise.map((item) => (
            <div 
              key={item.id} 
              className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition"
            >
              <div className="aspect-square bg-gray-800"></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.type}</p>
                  </div>
                  <span className="font-semibold">${item.price}</span>
                </div>
                
                <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-full text-sm mt-4 transition">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
} 