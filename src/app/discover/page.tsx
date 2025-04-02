import Link from 'next/link';

export default function DiscoverPage() {
  // These would come from a database in a real app
  const genres = [
    'Techno', 'House', 'Ambient', 'IDM', 'Drum & Bass', 'Breakbeat', 
    'Electro', 'Trance', 'Downtempo', 'Experimental', 'Glitch'
  ];
  
  const tags = [
    'Trans Artist', 'LGBTQ+', 'Non-Binary', 'Queer', 'Female Producer',
    'Deep', 'Atmospheric', 'Melodic', 'Dark', 'Hypnotic', 'Club', 'Dance',
    'Chill', 'Lo-Fi', 'Industrial', 'Acid', 'Dub'
  ];
  
  const releases = [
    {
      id: 1,
      title: 'Midnight Echoes',
      artist: 'Neural Drift',
      genre: 'Ambient',
      tags: ['Atmospheric', 'Deep', 'LGBTQ+'],
      coverUrl: 'https://via.placeholder.com/300'
    },
    {
      id: 2,
      title: 'Quantum Pulse',
      artist: 'Synthia',
      genre: 'Techno',
      tags: ['Trans Artist', 'Dark', 'Hypnotic'],
      coverUrl: 'https://via.placeholder.com/300'
    },
    {
      id: 3,
      title: 'Digital Dreams',
      artist: 'Circuit Breaker',
      genre: 'IDM',
      tags: ['Glitch', 'Experimental', 'Non-Binary'],
      coverUrl: 'https://via.placeholder.com/300'
    },
    {
      id: 4,
      title: 'Urban Motion',
      artist: 'Concrete Waves',
      genre: 'House',
      tags: ['Club', 'Dance', 'Queer'],
      coverUrl: 'https://via.placeholder.com/300'
    },
    {
      id: 5,
      title: 'Future Memories',
      artist: 'Data Ghost',
      genre: 'Downtempo',
      tags: ['Chill', 'Lo-Fi', 'LGBTQ+'],
      coverUrl: 'https://via.placeholder.com/300'
    },
    {
      id: 6,
      title: 'Neural Network',
      artist: 'Binary Bloom',
      genre: 'Experimental',
      tags: ['Glitch', 'Industrial', 'Trans Artist'],
      coverUrl: 'https://via.placeholder.com/300'
    },
    {
      id: 7,
      title: 'Bass Recursion',
      artist: 'Codec',
      genre: 'Drum & Bass',
      tags: ['Dance', 'Deep', 'Female Producer'],
      coverUrl: 'https://via.placeholder.com/300'
    },
    {
      id: 8,
      title: 'Analog Dreams',
      artist: 'Modular Heart',
      genre: 'Electro',
      tags: ['Acid', 'Hypnotic', 'Non-Binary'],
      coverUrl: 'https://via.placeholder.com/300'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
        Discover New Music
      </h1>
      
      {/* Search and Filter Section */}
      <div className="mb-10">
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Search for artists, albums, or tracks..." 
            className="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Genres Filter */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button 
                  key={genre} 
                  className="px-3 py-1 bg-gray-800 hover:bg-purple-900 rounded-full text-sm transition"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tags Filter */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button 
                  key={tag} 
                  className="px-3 py-1 bg-gray-800 hover:bg-purple-900 rounded-full text-sm transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">DJ Bag Lady's Picks</h2>
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/3 aspect-square bg-gray-800 rounded-lg"></div>
            <div className="w-full md:w-2/3">
              <span className="text-purple-300 font-semibold">FEATURED ARTIST</span>
              <h3 className="text-3xl font-bold mb-2">Neural Drift</h3>
              <p className="text-gray-300 mb-4">
                Ambient electronic soundscapes that transport you to another dimension. Created by a non-binary artist exploring the intersection of technology and emotion.
              </p>
              <Link 
                href="/artist/neural-drift" 
                className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition"
              >
                Explore Artist
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Releases Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">New & Notable</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {releases.map((release) => (
            <div key={release.id} className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition duration-300">
              <div className="aspect-square bg-gray-800"></div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{release.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{release.artist}</p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs px-2 py-1 bg-purple-900 rounded-full">{release.genre}</span>
                  {release.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button className="px-8 py-3 border border-purple-500 rounded-full hover:bg-purple-900 transition">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
} 