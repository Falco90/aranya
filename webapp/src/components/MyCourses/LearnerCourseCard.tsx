import React from 'react'
import Link from 'next/link'
import { BookOpenIcon, CheckCircleIcon } from 'lucide-react'
import { LearnerCourseSummary } from '../../types/course'

interface LearnerCourseCardProps {
  course: LearnerCourseSummary
}

const LearnerCourseCard: React.FC<LearnerCourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold text-stone-800 text-lg">
            {course.title || 'Untitled Course'}
          </h3>
          {course.completed && (
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full flex items-center">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Completed
            </span>
          )}
        </div>

        <p className="text-stone-600 text-sm mb-4">
          Modules completed: {course.completedModules} / {course.totalModules}
        </p>

        <div className="mb-4">
          <div className="text-sm text-stone-700 mb-1">
            Progress: {course.progressPercent}%
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full"
              style={{ width: `${course.progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex border-t border-stone-200">
        <div className="w-1/2 border-r border-stone-200 p-4 flex flex-col items-center">
          <div className="mt-2 text-xs text-stone-600 text-center">
            Your Learning Tree
          </div>
        </div>
        <div className="w-1/2 p-4 flex items-center justify-center">
          <Link
            href={`/view/${course.courseId}`}
            className="w-full flex justify-center items-center px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 text-sm"
          >
            <BookOpenIcon className="h-4 w-4 mr-2" />
            Continue Learning
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LearnerCourseCard
