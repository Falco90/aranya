import React from 'react'
import Link from 'next/link';
import { PencilIcon, UsersIcon, ArrowRightIcon } from 'lucide-react'
import { CreatorCourseSummary, CreatorNFT } from '../../types/course'
import { getAttribute, getNextMilestone, ipfsToHttp } from '../utils/utls';
import Image from 'next/image';
interface CreatorCourseCardProps {
    course: CreatorCourseSummary
    nft: CreatorNFT
}
const CreatorCourseCard: React.FC<CreatorCourseCardProps> = ({
    course,
    nft,
}) => {
    const completions = getAttribute(nft, "Completions")
    const nextMilestone = getNextMilestone(completions);
    const canUpgrade = nft && completions >= nextMilestone
    const completionRate =
        course.numLearners > 0
            ? Math.round((course.numCompleted / course.numLearners) * 100)
            : 0
    return (
        <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
            <div className="flex">
                <div className="p-6 flex-grow">
                    <h3 className="font-bold text-stone-800 text-lg mb-3">
                        {course.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-stone-50 p-3 rounded-md">
                            <div className="text-amber-700 text-sm font-medium">
                                {course.numLearners || 0}
                            </div>
                            <div className="text-xs text-stone-600">Enrolled Learners</div>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-md">
                            <div className="text-amber-700 text-sm font-medium">
                                {course.numCompleted}
                            </div>
                            <div className="text-xs text-stone-600">Completions</div>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-md">
                            <div className="text-amber-700 text-sm font-medium">
                                {completionRate}%
                            </div>
                            <div className="text-xs text-stone-600">Completion Rate</div>
                        </div>
                    </div>
                    <Link
                        href={`/builder/${course.courseId}`}
                        className="inline-flex items-center px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 text-sm"
                    >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Course
                    </Link>
                </div>
                <div className="w-48 border-l border-stone-200 flex flex-col items-center justify-center p-4 bg-stone-50">
                    <Image
                        src={ipfsToHttp(nft.image)}
                        alt="NFT"
                        width={500}
                        height={500}
                        unoptimized
                    />
                    <div className="mt-2 text-xs text-stone-600 text-center">
                        Next milestone: {nextMilestone}
                    </div>
                    <button
                        className={`mt-2 px-3 py-1.5 text-xs rounded-md w-full flex items-center justify-center ${canUpgrade ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-stone-200 text-stone-500 cursor-not-allowed'}`}
                        disabled={!canUpgrade}
                    >
                        Upgrade Tree
                        {canUpgrade && <ArrowRightIcon className="h-3 w-3 ml-1" />}
                    </button>
                </div>
            </div>
        </div>
    )
}
export default CreatorCourseCard
