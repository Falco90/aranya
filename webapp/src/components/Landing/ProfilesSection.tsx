"use client";

import React, { useState } from 'react';
import { StarIcon, BookOpenIcon, UserIcon, PenToolIcon } from 'lucide-react';
const ProfilesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'creators' | 'learners'>('creators');
  const creators = [{
    id: 1,
    name: 'Dr. Emily Chen',
    role: 'Data Science Educator',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80',
    courses: 12,
    students: 8750,
    rating: 4.9,
    bio: 'Former Google AI researcher with a passion for making complex data science concepts accessible to everyone.'
  }, {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Web Development Expert',
    image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    courses: 8,
    students: 12430,
    rating: 4.8,
    bio: 'Full-stack developer with 15 years of experience building web applications and teaching the next generation of developers.'
  }, {
    id: 3,
    name: 'Sarah Johnson',
    role: 'Marketing Strategist',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1061&q=80',
    courses: 6,
    students: 5680,
    rating: 4.7,
    bio: 'Former CMO helping businesses grow through practical, results-driven digital marketing strategies.'
  }];
  const learners = [{
    id: 1,
    name: 'James Wilson',
    role: 'Software Engineer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    coursesCompleted: 15,
    testimonial: 'The courses on Aranya helped me transition from a junior to senior developer role in just 8 months. The quality of instruction is unmatched.'
  }, {
    id: 2,
    name: 'Aisha Patel',
    role: 'Data Analyst',
    image: 'https://images.unsplash.com/photo-1619895862022-09114b41f16f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    coursesCompleted: 8,
    testimonial: 'I switched careers from marketing to data analysis after completing several courses. The practical exercises and quizzes were incredibly helpful.'
  }, {
    id: 3,
    name: 'Robert Kim',
    role: 'Marketing Specialist',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    coursesCompleted: 12,
    testimonial: "The digital marketing courses gave me practical skills I could immediately apply to my job. I've seen a 40% increase in our conversion rates since implementing what I learned."
  }];
  return <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-800 sm:text-4xl">
            Meet Our Community
          </h2>
          <p className="mt-4 text-xl text-stone-600 max-w-2xl mx-auto">
            Join thousands of creators and learners who are transforming
            education
          </p>
        </div>
        {/* Toggle Tabs */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex p-1 bg-stone-100 rounded-lg">
            <button onClick={() => setActiveTab('creators')} className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'creators' ? 'bg-white shadow text-amber-700' : 'text-stone-600 hover:text-amber-700'}`}>
              <div className="flex items-center">
                <PenToolIcon className="h-4 w-4 mr-2" />
                Featured Creators
              </div>
            </button>
            <button onClick={() => setActiveTab('learners')} className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'learners' ? 'bg-white shadow text-amber-700' : 'text-stone-600 hover:text-amber-700'}`}>
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                Learner Success Stories
              </div>
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="transition-all duration-300">
          {activeTab === 'creators' ? <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {creators.map(creator => <div key={creator.id} className="bg-stone-50 rounded-lg overflow-hidden border border-stone-200 shadow-sm">
                  <div className="p-6">
                    <div className="flex items-start mb-4">
                      <img src={creator.image} alt={creator.name} className="w-16 h-16 rounded-full object-cover mr-4" />
                      <div>
                        <h4 className="font-bold text-stone-800">
                          {creator.name}
                        </h4>
                        <p className="text-amber-700 text-sm">{creator.role}</p>
                      </div>
                    </div>
                    <p className="text-stone-600 mb-4">{creator.bio}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="bg-white px-3 py-1 rounded-full border border-stone-200 flex items-center">
                        <BookOpenIcon className="h-4 w-4 text-amber-700 mr-1" />
                        {creator.courses} courses
                      </div>
                      <div className="bg-white px-3 py-1 rounded-full border border-stone-200">
                        {creator.students.toLocaleString()} students
                      </div>
                      <div className="bg-white px-3 py-1 rounded-full border border-stone-200 flex items-center">
                        <StarIcon className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                        {creator.rating}
                      </div>
                    </div>
                  </div>
                </div>)}
            </div> : <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {learners.map(learner => <div key={learner.id} className="bg-stone-50 rounded-lg overflow-hidden border border-stone-200 shadow-sm">
                  <div className="p-6">
                    <div className="flex items-start mb-4">
                      <img src={learner.image} alt={learner.name} className="w-16 h-16 rounded-full object-cover mr-4" />
                      <div>
                        <h4 className="font-bold text-stone-800">
                          {learner.name}
                        </h4>
                        <p className="text-amber-700 text-sm">{learner.role}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-emerald-700 mb-2">
                        <BookOpenIcon className="h-4 w-4 mr-2" />
                        Completed {learner.coursesCompleted} courses
                      </div>
                      <p className="text-stone-600 italic">
                        "{learner.testimonial}"
                      </p>
                    </div>
                  </div>
                </div>)}
            </div>}
        </div>
      </div>
    </div>;
};
export default ProfilesSection;