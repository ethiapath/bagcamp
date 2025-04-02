import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            BAGCAMP
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mb-8">
            The premier platform for independent electronic music, 
            dedicated to empowering trans, GNC, and LGBTQ+ artists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/discover" 
              className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition"
            >
              Discover Music
            </Link>
            <Link 
              href="/artist/signup" 
              className="px-8 py-3 rounded-full bg-white text-purple-900 font-semibold text-lg hover:bg-gray-100 transition"
            >
              Join as Artist
            </Link>
          </div>
        </div>

        {/* Featured Artists Section */}
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

        {/* New Releases Section */}
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

        {/* Pledge Section */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Pledge to Artists</h2>
          <p className="max-w-2xl mx-auto mb-6">
            Bagcamp is committed to fair compensation, transparent policies, and creating a safe, supportive space for all artists - especially those from marginalized communities.
          </p>
          <Link 
            href="/about" 
            className="px-6 py-2 rounded-full bg-white text-purple-900 font-medium inline-block hover:bg-gray-100 transition"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2025 Bagcamp — Created with love by DJ Bag Lady</p>
            <p className="mt-2">
              <Link href="/terms" className="hover:text-white mr-4">Terms</Link>
              <Link href="/privacy" className="hover:text-white mr-4">Privacy</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
