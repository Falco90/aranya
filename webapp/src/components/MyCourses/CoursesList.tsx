"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { readContract } from "wagmi/actions"
import CreatorCourseCard from "./CreatorCourseCard"
// import LearnerCourseCard from "./LearnerCourseCard"
import EmptyState from "./EmptyState"

import { config } from "../Wallet/Providers"

import { erc721Abi } from 'viem'
import ICourseManager from "../../app/abis/aranya/ICourseManager.json"
import ICreatorNft from "../../app/abis/aranya/ICreatorNFT.json"
import ILearnerNft from "../../app/abis/aranya/ILearnerNFT.json"
import { BookOpenIcon, LeafIcon, PenToolIcon } from "lucide-react"
import { ipfsToHttp } from "../utils/utls";
import { CreatorCourseSummary, LearnerCourseSummary } from "@/types/course"

const COURSE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_COURSE_MANAGER_ADDRESS as `0x${string}`;

export default function CoursesList() {
  const { address } = useAccount()
  const [courses, setCourses] = useState<{
    created: (CreatorCourseSummary & { nft?: any })[]
    enrolled: (LearnerCourseSummary & { nft?: any })[]
  } | null>(null);
  const [activeView, setActiveView] = useState<'learner' | 'creator'>('creator');

  useEffect(() => {
    if (!address) return

    const fetchCoursesAndNFTs = async () => {
      try {
        const res = await fetch(`http://localhost:4000/get-user-courses?userId=${address}`);
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();

        const createdWithNFTs = await Promise.all(
          data.createdCourses.map(async (course: CreatorCourseSummary) => {

            try {
              const nftAddr = await readContract(config, {
                address: COURSE_MANAGER_ADDRESS,
                abi: ICourseManager,
                functionName: "getCreatorNFTAddress",
                args: [BigInt(course.courseId)],
              });

              const tokenURI = await readContract(config, {
                address: nftAddr as `0x${string}`,
                abi: erc721Abi,
                functionName: "tokenURI",
                args: [BigInt(0)],
              });

              const metadata = await fetch(ipfsToHttp(tokenURI)).then(r => r.json());
              console.log(metadata);

              return { ...course, nft: { address: nftAddr, metadata } }
            } catch (err) {
              console.error("Error fetching creator NFT:", err)
              return { ...course, nft: null }
            }
          })
        )

        // const enrolledWithNFTs = await Promise.all(
        //   data.enrolledCourses.map(async (course: LearnerCourseSummary) => {
        //     try {
        //       const nftAddr = await readContract(config, {
        //         address: COURSE_MANAGER_ADDRESS,
        //         abi: ICourseManager,
        //         functionName: "getLearnerNFTAddress",
        //         args: [BigInt(course.courseId)],
        //       })

        //       const progress = await readContract(config, {
        //         address: nftAddr as `0x${string}`,
        //         abi: ILearnerNft.abi,
        //         functionName: "getProgress", // adjust to your ABI
        //         args: [address],
        //       })

        //       return { ...course, nft: { progress } }
        //     } catch (err) {
        //       console.error("Error fetching learner NFT:", err)
        //       return { ...course, nft: null }
        //     }
        //   })
        // )

        setCourses({ created: createdWithNFTs, enrolled: [] })
      } catch (err) {
        console.error("Error fetching:", err)
      }
    }

    fetchCoursesAndNFTs()
  }, [address])

  if (!address) return <p>Please connect your wallet</p>
  if (!courses) return <p>Loading...</p>

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <LeafIcon className="h-8 w-8 text-amber-700 mr-3" />
              <h1 className="text-3xl font-bold text-stone-800">My Courses</h1>
            </div>
            {courses.created && courses.enrolled && (
              <div className="inline-flex p-1 bg-stone-100 rounded-lg">
                <button
                  onClick={() => setActiveView('learner')}
                  className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${activeView === 'learner' ? 'bg-white shadow text-emerald-700' : 'text-stone-600 hover:text-emerald-700'}`}
                >
                  <div className="flex items-center">
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    Learning
                  </div>
                </button>
                <button
                  onClick={() => setActiveView('creator')}
                  className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${activeView === 'creator' ? 'bg-white shadow text-amber-700' : 'text-stone-600 hover:text-amber-700'}`}
                >
                  <div className="flex items-center">
                    <PenToolIcon className="h-4 w-4 mr-2" />
                    Teaching
                  </div>
                </button>
              </div>
            )}
          </div>
          {/* Learner View */}
          {/* {activeView === 'learner' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-stone-800 mb-2">
                  Courses You're Learning
                </h2>
                <p className="text-stone-600">
                  Track your progress and watch your trees grow as you complete
                  courses
                </p>
              </div>
              {courses.enrolled ? (
                <div className="space-y-4">
                  {learnerCourses.map((learnerCourse) => (
                    <LearnerCourseCard
                      key={learnerCourse.courseId}
                      course={learnerCourse}
                      nft={progress.learnerNFTs[`${learnerCourse.courseId}`]}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="learner"
                  message="You haven't enrolled in any courses yet"
                  actionText="Explore Courses"
                  actionLink="/"
                />
              )}
            </div>
          )} */}
          {/* Creator View */}
          {activeView === 'creator' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-stone-800 mb-2">
                  Courses You're Teaching
                </h2>
                <p className="text-stone-600">
                  Monitor course performance and watch your creator trees evolve
                  as learners complete your courses
                </p>
              </div>
              {courses.created ? (
                <div className="space-y-4">
                  {courses.created.map((creatorCourse) => (
                    <CreatorCourseCard
                      key={creatorCourse.courseId}
                      course={creatorCourse}
                      nft={creatorCourse.nft}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="creator"
                  message="You haven't created any courses yet"
                  actionText="Create a Course"
                  actionLink="/builder"
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
