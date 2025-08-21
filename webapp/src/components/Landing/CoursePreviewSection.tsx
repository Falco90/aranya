import React from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'
import CoursePreviewCard from '../Courses/CoursePreviewCard'
import { CoursePreview } from '@/types/course'

interface CoursePreviewSectionProps {
  courses: CoursePreview[]
}

const CoursePreviewSection: React.FC<CoursePreviewSectionProps> = ({courses}) => {
  // Sample course data

  return (
    <div className="py-16 bg-stone-50">
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
          {courses.map((course) => (
            <CoursePreviewCard key={course.courseId} course={course} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/view"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Browse All Courses
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
export default CoursePreviewSection
