"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { FiMenu, FiX, FiUser, FiMusic } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hasArtistProfile, setHasArtistProfile] = useState(false);

  useEffect(() => {
    const checkArtistProfile = async () => {
      if (!user) {
        setHasArtistProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('artists')
          .select('id')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setHasArtistProfile(!!data);
      } catch (err) {
        console.error('Error checking artist profile:', err);
        setHasArtistProfile(false);
      }
    };

    checkArtistProfile();
  }, [user]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900 text-white fixed w-full z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" onClick={closeMenus}>
            BAGCAMP
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/artists" className="hover:text-purple-400 transition">
              Artists
            </Link>
            <Link href="/discover" className="hover:text-purple-400 transition">
              Discover
            </Link>
            <Link href="/about" className="hover:text-purple-400 transition">
              About
            </Link>
            
            {!loading && (
              user ? (
                <div className="relative">
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-1 hover:text-purple-400 transition"
                  >
                    <FiUser />
                    <span className="text-sm truncate max-w-[120px]">
                      {user.email?.split('@')[0]}
                    </span>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-20">
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm hover:bg-gray-700 transition"
                        onClick={closeMenus}
                      >
                        My Account
                      </Link>
                      {hasArtistProfile ? (
                        <Link
                          href="/artist/dashboard"
                          className="block px-4 py-2 text-sm hover:bg-gray-700 transition"
                          onClick={closeMenus}
                        >
                          <span className="flex items-center">
                            <FiMusic className="mr-2" />
                            Artist Dashboard
                          </span>
                        </Link>
                      ) : (
                        <Link
                          href="/artist/create"
                          className="block px-4 py-2 text-sm hover:bg-gray-700 transition"
                          onClick={closeMenus}
                        >
                          <span className="flex items-center">
                            <FiMusic className="mr-2" />
                            Create Artist Profile
                          </span>
                        </Link>
                      )}
                      <Link
                        href="/collection"
                        className="block px-4 py-2 text-sm hover:bg-gray-700 transition"
                        onClick={closeMenus}
                      >
                        My Collection
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          closeMenus();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-x-3">
                  <Link
                    href="/login"
                    className="px-3 py-1 rounded hover:text-purple-400 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col space-y-3">
              <Link href="/artists" className="hover:text-purple-400 transition" onClick={closeMenus}>
                Artists
              </Link>
              <Link href="/discover" className="hover:text-purple-400 transition" onClick={closeMenus}>
                Discover
              </Link>
              <Link href="/about" className="hover:text-purple-400 transition" onClick={closeMenus}>
                About
              </Link>
              
              {!loading && (
                user ? (
                  <>
                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <FiUser />
                        <span className="truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <Link href="/account" className="hover:text-purple-400 transition pl-2" onClick={closeMenus}>
                      My Account
                    </Link>
                    {hasArtistProfile ? (
                      <Link href="/artist/dashboard" className="hover:text-purple-400 transition pl-2" onClick={closeMenus}>
                        <span className="flex items-center">
                          <FiMusic className="mr-2" />
                          Artist Dashboard
                        </span>
                      </Link>
                    ) : (
                      <Link href="/artist/create" className="hover:text-purple-400 transition pl-2" onClick={closeMenus}>
                        <span className="flex items-center">
                          <FiMusic className="mr-2" />
                          Create Artist Profile
                        </span>
                      </Link>
                    )}
                    <Link href="/collection" className="hover:text-purple-400 transition pl-2" onClick={closeMenus}>
                      My Collection
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        closeMenus();
                      }}
                      className="text-left hover:text-purple-400 transition"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Link
                      href="/login"
                      className="px-3 py-2 text-center rounded border border-gray-600 hover:bg-gray-800 transition"
                      onClick={closeMenus}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-3 py-2 text-center bg-purple-600 hover:bg-purple-700 rounded transition"
                      onClick={closeMenus}
                    >
                      Sign Up
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 