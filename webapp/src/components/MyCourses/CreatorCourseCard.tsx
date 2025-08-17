import React from 'react'
import Link from 'next/link'
import { PencilIcon, UsersIcon, CheckCircleIcon, BookOpenIcon } from 'lucide-react'
import { CreatorCourseSummary } from '../../types/course'

interface CreatorCourseCardProps {
    course: CreatorCourseSummary
}

const CreatorCourseCard: React.FC<CreatorCourseCardProps> = ({ course }) => {
    // Compute completion rate safely
    const completionRate =
        course.numEnrolled > 0
            ? Math.round((course.numCompleted / course.numEnrolled) * 100)
            : 0

    return (
        <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 flex-grow">
                <h3 className="font-bold text-stone-800 text-lg mb-2">
                    {course.title || 'Untitled Course'}
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-stone-50 p-3 rounded-md flex flex-col items-center">
                        <UsersIcon className="h-4 w-4 text-amber-700 mb-1" />
                        <div className="text-amber-700 text-sm font-medium">
                            {course.numEnrolled}
                        </div>
                        <div className="text-xs text-stone-600">Enrolled Learners</div>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-md flex flex-col items-center">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-600 mb-1" />
                        <div className="text-emerald-700 text-sm font-medium">
                            {course.numCompleted}
                        </div>
                        <div className="text-xs text-stone-600">Completions</div>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-md flex flex-col items-center col-span-2">
                        <BookOpenIcon className="h-4 w-4 text-stone-600 mb-1" />
                        <div className="text-amber-700 text-sm font-medium">
                            {completionRate}%
                        </div>
                        <div className="text-xs text-stone-600">Completion Rate</div>
                    </div>
                </div>
            </div>

            <div className="flex border-t border-stone-200">
                <div className="w-1/2 border-r border-stone-200 p-4 flex flex-col items-center">
                    <div className="mt-2 text-xs text-stone-600 text-center">
                        Your Creator Tree
                    </div>
                </div>
                <div className="w-1/2 p-4 flex items-center justify-center">
                    <Link
                        href={`/builder/${course.courseId}`}
                        className="w-full flex justify-center items-center px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 text-sm"
                    >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Course
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default CreatorCourseCard
