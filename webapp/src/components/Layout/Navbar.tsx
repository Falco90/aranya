"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { SearchIcon, UserIcon, BookOpenIcon, MenuIcon, XIcon, LeafIcon } from 'lucide-react';
interface NavbarProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}
const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  onLogin,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <nav className="bg-white border-b border-stone-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <LeafIcon className="h-8 w-8 text-amber-700" />
              <span className="ml-2 text-xl font-bold text-stone-800">
                Aranya
              </span>
            </Link>
          </div>
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative w-64">
              <input type="text" placeholder="Search courses..." className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            </div>
            {isLoggedIn ? <>
                <Link href="/view" className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-amber-700 flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  My Courses
                </Link>
                <Link href="/nft-gallery" className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-amber-700 flex items-center">
                  <LeafIcon className="h-4 w-4 mr-2" />
                  My NFTs
                </Link>
                <div className="relative group">
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-stone-700 hover:text-amber-700 focus:outline-none">
                    <UserIcon className="h-4 w-4 mr-2" />
                    My Profile
                  </button>
                  <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white border border-stone-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-150 ease-in-out">
                    <div className="py-1">
                      <Link href="/builder" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100">
                        Dashboard
                      </Link>
                      <Link href="/view" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100">
                        My Learning
                      </Link>
                      <Link href="/nft-gallery" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100">
                        NFT Collection
                      </Link>
                      <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </> : <button onClick={onLogin} className="px-4 py-2 text-sm font-medium text-white bg-amber-700 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                Sign In
              </button>}
          </div>
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-stone-700 hover:text-amber-700 hover:bg-stone-100 focus:outline-none">
              {isMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-stone-200">
            <div className="relative mx-2 my-2">
              <input type="text" placeholder="Search courses..." className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            </div>
            {isLoggedIn ? <>
                <Link href="/view" className="block px-3 py-2 text-base font-medium text-stone-700 hover:text-amber-700 hover:bg-stone-100 rounded-md">
                  My Courses
                </Link>
                <Link href="/nft-gallery" className="block px-3 py-2 text-base font-medium text-stone-700 hover:text-amber-700 hover:bg-stone-100 rounded-md">
                  My NFTs
                </Link>
                <Link href="/builder" className="block px-3 py-2 text-base font-medium text-stone-700 hover:text-amber-700 hover:bg-stone-100 rounded-md">
                  Dashboard
                </Link>
                <button onClick={onLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-stone-700 hover:text-amber-700 hover:bg-stone-100 rounded-md">
                  Sign Out
                </button>
              </> : <button onClick={onLogin} className="block w-full text-left px-3 py-2 text-base font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-md">
                Sign In
              </button>}
          </div>
        </div>}
    </nav>;
};
export default Navbar;