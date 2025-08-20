import React from 'react'
import Link from 'next/link'
import {
  StarIcon,
  UsersIcon,
  CheckCircleIcon,
  BookOpenIcon,
  ArrowRightIcon,
} from 'lucide-react'
import { CoursePreview } from '@/types/course';

interface CoursePreviewCardProps {
  course: CoursePreview
}
const CoursePreviewCard: React.FC<CoursePreviewCardProps> = ({ course }) => {
  // Calculate completion rate
  const completionRate =
    course.numEnrollments > 0
      ? Math.round((course.numCompletions / course.numEnrollments) * 100)
      : 0
  // Default image if none provided
  const defaultImage =
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-stone-200 flex flex-col h-full">
      {/* Course content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-stone-800 text-lg mb-1">
          {course.title}
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          By <span className="font-medium">{course.creator}</span>
        </p>
        {/* Stats */}
        <div className="flex items-center text-sm text-stone-500 mb-4">
          <div className="flex items-center mr-4">
            <UsersIcon className="h-4 w-4 mr-1 text-amber-700" />
            <span>{course.numEnrollments.toLocaleString()} enrolled</span>
          </div>
          <div className="flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-1 text-emerald-600" />
            <span>{course.numCompletions.toLocaleString()} completed</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-stone-600 mb-1">
            <span>Completion rate</span>
            <span>{completionRate}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{
                width: `${completionRate}%`,
              }}
            ></div>
          </div>
        </div>
        {/* Modules */}
        <div className="text-xs text-stone-500 mb-4">
          <div className="flex items-center">
            <BookOpenIcon className="h-3.5 w-3.5 mr-1.5 text-amber-700" />
            <span>
              {course.numModules}{' '}
              {course.numModules === 1 ? 'module' : 'modules'}
            </span>
          </div>
        </div>
        {/* Action button */}
        <Link
          href={course.courseId ? `/courses/${course.courseId}` : '/view'}
          className="mt-auto text-amber-700 hover:text-amber-800 font-medium flex items-center text-sm"
        >
          View Course
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
export default CoursePreviewCard
