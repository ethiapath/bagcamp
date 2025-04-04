export default function FeaturedArtists() {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold mb-8 text-center">Featured Artists</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* These would be dynamically loaded from the database */}
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition duration-300">
            <div className="h-48 bg-gray-800 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-600"></div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold">Artist Name</h3>
              <p className="text-gray-400">Electronic • House • Techno</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 