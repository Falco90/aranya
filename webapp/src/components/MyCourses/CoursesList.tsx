"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import CreatorCourseCard from "./CreatorCourseCard"
import LearnerCourseCard from "./LearnerCourseCard"
import EmptyState from "./EmptyState"

export default function CoursesList() {
  const { address } = useAccount()
  const [courses, setCourses] = useState<{ created: any[]; enrolled: any[] } | null>(null)

  useEffect(() => {
    if (!address) return

    const fetchCourses = async () => {
      try {
        const res = await fetch(`http://localhost:4000/get-user-courses?userId=${address}`);
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        console.log(data);
        setCourses({
            created: data.created_courses,
            enrolled: data.enrolled_courses
        })
      } catch (err) {
        console.error(err)
      }
    }

    fetchCourses()
  }, [address])

  if (!address) return <p>Please connect your wallet</p>
  if (!courses) return <p>Loading...</p>

  return (
    <div className="space-y-10">
      {/* CREATOR SECTION */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Courses You Created</h2>
        {courses.created.length === 0 ? (
          <EmptyState
            type="creator"
            message="You haven't created any courses yet."
            actionText="Create Course"
            actionLink="/builder"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.created.map((course, idx) => (
              <CreatorCourseCard key={course.id ?? `created-${idx}`} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* LEARNER SECTION */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Courses You're Enrolled In</h2>
        {courses.enrolled.length === 0 ? (
          <EmptyState
            type="learner"
            message="You're not enrolled in any courses yet."
            actionText="Browse Courses"
            actionLink="/explore"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.enrolled.map((course, idx) => (
              <LearnerCourseCard key={course.id ?? `created-${idx}`} course={course}  />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
