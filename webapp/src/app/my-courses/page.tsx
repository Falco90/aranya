// app/dashboard/page.tsx
import CoursesList from "../../components/MyCourses/CoursesList"

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">My Courses</h1>
      <CoursesList />
    </div>
  )
}
