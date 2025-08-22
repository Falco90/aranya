"use client";

import React from 'react';
import Link from "next/link"
import Image from 'next/image';
import { useAccount } from "wagmi"
import { BookOpenIcon, PlusIcon } from 'lucide-react';
interface HeroSectionProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  counts: any;
}
const HeroSection: React.FC<HeroSectionProps> = ({
  isLoggedIn,
  onLogin,
  counts
}) => {
  const { isConnected, address } = useAccount();
  return <div className="bg-gradient-to-br from-amber-50 to-stone-100 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 sm:text-5xl md:text-6xl">
              Learn and teach with{' '}
              <span className="text-amber-700">Aranya</span>
            </h1>
            <p className="mt-6 text-xl text-stone-600 max-w-3xl">
              Discover a platform that connects passionate educators with
              curious learners. Grow and prove your skills as a learner or teacher with on-chain trees.
            </p>
            <div className="mt-10 flex gap-4">
              {isConnected ? <>
                  <Link href="/course-builder" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create a Course
                  </Link>
                  <Link href="/view" className="inline-flex items-center px-6 py-3 border border-stone-200 text-base font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                    <BookOpenIcon className="h-5 w-5 mr-2" />
                    Find Courses
                  </Link>
                </> : <>
                  <button onClick={onLogin} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                    Get Started
                  </button>
                  <Link href="/view" className="inline-flex items-center px-6 py-3 border border-stone-200 text-base font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                    Explore Courses
                  </Link>
                </>}
            </div>
          </div>
          <div className="mt-12 lg:mt-0">
            <div className="pl-4 sm:pl-6 lg:pl-0 lg:relative lg:h-full">
              <div className="max-w-md mx-auto lg:max-w-none">
                <div className="relative rounded-lg shadow-lg overflow-hidden">
                  <Image src="/images/mature_tree.png" alt="tree" width={600} height={500}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-700/30 to-transparent mix-blend-multiply" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow border border-stone-200">
                    <div className="text-amber-700 font-bold text-3xl">
                      {counts.numLearners}
                    </div>
                    <div className="text-stone-600 text-sm">
                      Learners
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow border border-stone-200">
                    <div className="text-amber-700 font-bold text-3xl">
                      {counts.numCourses}
                    </div>
                    <div className="text-stone-600 text-sm">
                      Courses
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default HeroSection;