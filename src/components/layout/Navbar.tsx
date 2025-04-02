"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black bg-opacity-90 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-purple-900/40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              BAGCAMP
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/discover" className="text-white hover:text-purple-400 transition">
              Discover
            </Link>
            <Link href="/artists" className="text-white hover:text-purple-400 transition">
              Artists
            </Link>
            <Link href="/about" className="text-white hover:text-purple-400 transition">
              About
            </Link>
            <div className="flex items-center space-x-4 ml-4">
              <Link href="/login" className="text-white hover:text-purple-400 transition">
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black bg-opacity-95 border-t border-purple-900/40 py-4">
          <div className="container mx-auto px-4 space-y-3">
            <Link 
              href="/discover" 
              className="block text-white hover:text-purple-400 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Discover
            </Link>
            <Link 
              href="/artists" 
              className="block text-white hover:text-purple-400 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Artists
            </Link>
            <Link 
              href="/about" 
              className="block text-white hover:text-purple-400 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-2 border-t border-gray-800 mt-2">
              <Link 
                href="/login" 
                className="block text-white hover:text-purple-400 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="block text-white hover:text-purple-400 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 