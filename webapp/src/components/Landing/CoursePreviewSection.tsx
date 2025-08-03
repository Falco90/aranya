import React from 'react';
import Link from 'next/link';
import { StarIcon, UsersIcon, CheckCircleIcon, ArrowRightIcon } from 'lucide-react';
const CoursePreviewSection: React.FC = () => {
  // Sample course data
  const courses = [{
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1744&q=80',
    instructor: 'Alex Johnson',
    learners: 3245,
    completions: 1879,
    rating: 4.8,
    modules: 8,
    lessons: 42
  }, {
    id: '2',
    title: 'Data Science Essentials',
    description: 'Master the core concepts of data analysis, visualization, and machine learning.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    instructor: 'Maria Garcia',
    learners: 2187,
    completions: 1342,
    rating: 4.7,
    modules: 10,
    lessons: 55
  }, {
    id: '3',
    title: 'Digital Marketing Masterclass',
    description: 'Learn proven strategies for SEO, content marketing, social media, and more.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1115&q=80',
    instructor: 'David Kim',
    learners: 1856,
    completions: 1023,
    rating: 4.9,
    modules: 12,
    lessons: 68
  }];
  return <div className="py-16 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-stone-800 sm:text-4xl">
            Featured Courses
          </h2>
          <p className="mt-4 text-xl text-stone-600 max-w-2xl mx-auto">
            Explore some of our most popular courses and start your learning
            journey today
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => <div key={course.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-stone-200 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-stone-800 mb-2">
                  {course.title}
                </h3>
                <p className="text-stone-600 mb-4 flex-1">
                  {course.description}
                </p>
                <div className="flex items-center text-sm text-stone-500 mb-4">
                  <div className="flex items-center mr-4">
                    <UsersIcon className="h-4 w-4 mr-1 text-amber-700" />
                    <span>{course.learners.toLocaleString()} learners</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <CheckCircleIcon className="h-4 w-4 mr-1 text-emerald-600" />
                    <span>
                      {course.completions.toLocaleString()} completions
                    </span>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 mr-1 text-amber-500 fill-amber-500" />
                    <span>{course.rating}</span>
                  </div>
                </div>
                <div className="text-xs text-stone-500 mb-4">
                  <div className="flex items-center justify-between">
                    <span>By {course.instructor}</span>
                    <span>
                      {course.modules} modules • {course.lessons} lessons
                    </span>
                  </div>
                </div>
                <Link href="/view" className="mt-auto text-amber-700 hover:text-amber-800 font-medium flex items-center">
                  View Course
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>)}
        </div>
        <div className="mt-12 text-center">
          <Link href="/view" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
            Browse All Courses
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>;
};
export default CoursePreviewSection;