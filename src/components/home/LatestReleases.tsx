export default function LatestReleases() {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold mb-8 text-center">New Releases</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* These would be dynamically loaded from the database */}
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition">
            <div className="aspect-square bg-gray-800"></div>
            <div className="p-3">
              <h3 className="font-medium">Album Title</h3>
              <p className="text-sm text-gray-400">Artist Name</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 