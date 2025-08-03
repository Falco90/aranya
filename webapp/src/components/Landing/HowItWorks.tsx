"use client";

import React, { useState } from 'react';
import { SearchIcon, BookOpenIcon, GraduationCapIcon, StarIcon, PencilIcon, UsersIcon, BarChartIcon, AwardIcon, UserIcon, PenToolIcon } from 'lucide-react';
const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'learners' | 'creators'>('learners');
  return <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-stone-800 sm:text-4xl">
            How Aranya Works
          </h2>
          <p className="mt-4 text-xl text-stone-600 max-w-2xl mx-auto">
            Our platform makes it easy to learn new skills and share your
            knowledge
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
                      Browse our extensive library of courses created by expert
                      instructors across various subjects.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 h-full">
                    <BookOpenIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Learn at Your Pace
                    </h4>
                    <p className="text-stone-600">
                      Access course materials anytime and learn at your own pace
                      with our flexible learning platform.
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
                      Test Your Knowledge
                    </h4>
                    <p className="text-stone-600">
                      Reinforce your learning with quizzes and track your
                      progress throughout each course.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 h-full">
                    <StarIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Earn Certificates
                    </h4>
                    <p className="text-stone-600">
                      Complete courses to earn certificates that showcase your
                      new skills and knowledge.
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
                      Create Content
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
                    <UsersIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Reach Students
                    </h4>
                    <p className="text-stone-600">
                      Share your expertise with learners from around the world
                      who are eager to learn from you.
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
                    <AwardIcon className="h-8 w-8 text-amber-700 mb-4" />
                    <h4 className="text-lg font-medium text-stone-800 mb-2">
                      Earn Recognition
                    </h4>
                    <p className="text-stone-600">
                      Build your reputation as an educator and earn rewards
                      based on your course's success.
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