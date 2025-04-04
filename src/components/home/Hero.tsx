import Link from "next/link";

export default function Hero() {
  return (
    <div className="bg-gradient-to-b from-purple-900 to-black text-white">
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
      </div>
    </div>
  );
} 