"use client";

import React, { useState } from 'react';
import { SearchIcon, BookOpenIcon, GraduationCapIcon, StarIcon, PencilIcon, UsersIcon, BarChartIcon, AwardIcon, UserIcon, PenToolIcon, TreesIcon, SproutIcon } from 'lucide-react';
const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learners' | 'creators'>('learners');
  return <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-stone-800 sm:text-4xl">
            How Aranya Works
          </h2>
          <p className="mt-4 text-xl text-stone-600 max-w-2xl mx-auto">
            Our platform makes it easy to learn new skills, share your knowledge and prove it all on-chain
          </p>
        </div>
        {/* Toggle Tabs */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex p-1 bg-stone-100 rounded-lg">
            <button onClick={() => setActiveTab('learners')} className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'learners' ? 'bg-white shadow text-amber-700' : 'text-stone-600 hover:text-amber-700'}`}>
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                For Learners
              </div>
            </button>
            <button onClick={() => setActiveTab('creators')} className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'creators' ? 'bg-white shadow text-amber-700' : 'text-stone-600 hover:text-amber-700'}`}>
              <div className="flex items-center">
                <PenToolIcon className="h-4 w-4 mr-2" />
                For Creators
              </div>
            </button>
          </div>
        </div>
        {/* Content Sections */}
        <div className="mt-12">
          {activeTab === 'learners' ? <div className="transition-opacity duration-300">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 h-full">
                    <SearchIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Discover Courses
                    </h4>
                    <p className="text-stone-600">
                      Pick a course from our extensive library of courses on various subjects.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 h-full">
                    <SproutIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Enroll and Mint Your Seed
                    </h4>
                    <p className="text-stone-600">
                      Enroll in a course and a seed will be minted to you. Then grow it by learning! 
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 h-full">
                    <GraduationCapIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Improve Your Knowledge
                    </h4>
                    <p className="text-stone-600">
                      Improve your knowledge with lessons and quizzes and track your
                      progress throughout each course.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 h-full">
                    <TreesIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Grow Your Forest
                    </h4>
                    <p className="text-stone-600">
                      As you progress through courses transform your seeds into trees!
                    </p>
                  </div>
                </div>
              </div>
            </div> : <div className="transition-opacity duration-300">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 h-full">
                    <PencilIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Create Your Course
                    </h4>
                    <p className="text-stone-600">
                      Build engaging courses with our intuitive course builder.
                      Add lessons, videos, and quizzes.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 h-full">
                    <SproutIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Mint Your Seed
                    </h4>
                    <p className="text-stone-600">
                      Upon submitting your course a seed will be minted to you! Watch it grow as more people complete your course.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 h-full">
                    <BarChartIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Track Progress
                    </h4>
                    <p className="text-stone-600">
                      Monitor student engagement and performance with detailed
                      analytics and insights.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 h-full">
                    <TreesIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Grow Your Forest
                    </h4>
                    <p className="text-stone-600">
                      Build your reputation as an educator by growing your on-chain forest of courses.
                    </p>
                  </div>
                </div>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};
export default HowItWorks;