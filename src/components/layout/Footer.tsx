import Link from 'next/link';
import { FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              BAGCAMP
            </h3>
            <p className="text-gray-300 mb-4">
              The premier platform for independent electronic music, dedicated to empowering trans, GNC, and LGBTQ+ artists.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition" target="_blank" rel="noopener noreferrer">
                <FiTwitter size={20} />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white transition" target="_blank" rel="noopener noreferrer">
                <FiInstagram size={20} />
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-white transition" target="_blank" rel="noopener noreferrer">
                <FiGithub size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/discover" className="text-gray-400 hover:text-white transition">
                  Discover Music
                </Link>
              </li>
              <li>
                <Link href="/artists" className="text-gray-400 hover:text-white transition">
                  Artists
                </Link>
              </li>
              <li>
                <Link href="/genres" className="text-gray-400 hover:text-white transition">
                  Genres
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-gray-400 hover:text-white transition">
                  Tags
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/artist/signup" className="text-gray-400 hover:text-white transition">
                  For Artists
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="text-gray-400 hover:text-white transition">
                  Copyright Policy
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-gray-400 hover:text-white transition">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400 text-sm">
          <p>© {currentYear} Bagcamp — Created with love by DJ Bag Lady</p>
          <p className="mt-2">Support independent artists and inclusive communities.</p>
        </div>
      </div>
    </footer>
  );
} 