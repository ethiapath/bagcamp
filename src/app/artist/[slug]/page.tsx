import Link from 'next/link';
import ArtistTabs from '@/components/artist/ArtistTabs';

// This would normally come from an API or database
const getArtistData = (_slug: string) => {
  // Dummy data for demonstration
  return {
    name: 'Neural Drift',
    bio: 'Neural Drift is a non-binary electronic music producer from Berlin, specializing in ambient soundscapes and experimental techno. Their music explores the intersection of technology and emotion, creating atmospheric journeys that transport listeners to other dimensions.',
    location: 'Berlin, Germany',
    tags: ['Ambient', 'Experimental', 'Techno', 'IDM', 'Non-Binary Artist'],
    websiteUrl: 'https://neuraldrift.com',
    socialLinks: {
      instagram: 'https://instagram.com/neuraldrift',
      twitter: 'https://twitter.com/neuraldrift',
      soundcloud: 'https://soundcloud.com/neuraldrift'
    },
    releases: [
      {
        id: 1,
        title: 'Midnight Echoes',
        type: 'Album',
        year: '2023',
        tracks: 8,
        price: 12,
        imageUrl: 'https://via.placeholder.com/300'
      },
      {
        id: 2,
        title: 'Lost Signal',
        type: 'EP',
        year: '2022',
        tracks: 4,
        price: 7,
        imageUrl: 'https://via.placeholder.com/300'
      },
      {
        id: 3,
        title: 'Quantum Memory',
        type: 'Single',
        year: '2022',
        tracks: 1,
        price: 2,
        imageUrl: 'https://via.placeholder.com/300'
      }
    ],
    merchandise: [
      {
        id: 1,
        title: 'Midnight Echoes Vinyl',
        type: 'Vinyl',
        price: 25,
        imageUrl: 'https://via.placeholder.com/300'
      },
      {
        id: 2,
        title: 'Neural Drift T-Shirt',
        type: 'Apparel',
        price: 20,
        imageUrl: 'https://via.placeholder.com/300'
      }
    ]
  };
};

export default function ArtistPage({ params }: { params: { slug: string } }) {
  const artist = getArtistData(params.slug);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Artist Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Artist Image */}
        <div className="w-full md:w-1/3">
          <div className="aspect-square bg-gray-800 rounded-lg"></div>
        </div>
        
        {/* Artist Info */}
        <div className="w-full md:w-2/3">
          <h1 className="text-4xl font-bold mb-2">{artist.name}</h1>
          <p className="text-gray-400 mb-4">{artist.location}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {artist.tags.map((tag) => (
              <span key={tag} className="text-sm px-3 py-1 bg-gray-800 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          
          <p className="text-gray-300 mb-6">{artist.bio}</p>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <Link 
              href={artist.websiteUrl} 
              target="_blank" 
              className="text-purple-400 hover:text-purple-300"
            >
              Website
            </Link>
            {Object.entries(artist.socialLinks).map(([platform, url]) => (
              <Link 
                key={platform} 
                href={url} 
                target="_blank" 
                className="text-purple-400 hover:text-purple-300"
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Link>
            ))}
          </div>
          
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition">
              Follow
            </button>
            <button className="px-6 py-2 border border-purple-600 rounded-full hover:bg-purple-900 transition">
              Share
            </button>
          </div>
        </div>
      </div>
      
      <ArtistTabs artist={artist} />
    </div>
  );
} 