import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpenIcon, CheckCircleIcon, ArrowRightIcon } from 'lucide-react'
import { LearnerCourseSummary } from '../../types/course'
import { getAttribute, getNextLearnerMilestone, ipfsToHttp } from '../utils/utils'
import UpgradeNFTModal from './UpgradeLearnerNFTModal'
interface LearnerCourseCardProps {
    course: LearnerCourseSummary
    nft: any
}
const LearnerCourseCard: React.FC<LearnerCourseCardProps> = ({
    course,
    nft,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const progress = getAttribute(nft.metadata, "Progress");
    const nextMilestone = getNextLearnerMilestone(progress);

    const canUpgrade =
        course.progressPercent >= nextMilestone;
    return (
        <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
            <div className="flex">
                <div className="p-6 flex-grow">
                    <div className="flex justify-between mb-2">
                        <h3 className="font-bold text-stone-800 text-lg">{course.title}</h3>
                        {course.completed && (
                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full flex items-center">
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Completed
                            </span>
                        )}
                    </div>
                    <div className="flex items-center text-sm text-stone-600 mb-3">
                        <span>
                            {course.completedModules} of {course.totalModules} modules
                            completed
                        </span>
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-stone-700 mb-1">
                            <span>Progress</span>
                            <span>{course.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-2">
                            <div
                                className="bg-emerald-600 h-2 rounded-full"
                                style={{
                                    width: `${course.progressPercent}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                    <Link
                        href={`/courses/${course.courseId}`}
                        className="inline-flex items-center px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 text-sm"
                    >
                        <BookOpenIcon className="h-4 w-4 mr-2" />
                        Continue Learning
                    </Link>
                </div>
                <div className="w-48 border-l border-stone-200 flex flex-col items-center justify-center p-4 bg-stone-50">
                    <Image
                        src={ipfsToHttp(nft.metadata.image)}
                        alt="NFT"
                        width={500}
                        height={500}
                        unoptimized
                    />
                    <div className="mt-2 text-xs text-stone-600 text-center">
                        Next milestone: {nextMilestone}%
                    </div>
                    <button
                        className={`mt-2 px-3 py-1.5 text-xs rounded-md w-full flex items-center justify-center ${canUpgrade ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-stone-200 text-stone-500 cursor-not-allowed'}`}
                        disabled={!canUpgrade}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Upgrade Tree
                        {canUpgrade && <ArrowRightIcon className="h-3 w-3 ml-1" />}
                    </button>
                </div>
                <UpgradeNFTModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} nftAddress={nft.address} courseId={course.courseId} />
            </div>
        </div>
    )
}
export default LearnerCourseCard
