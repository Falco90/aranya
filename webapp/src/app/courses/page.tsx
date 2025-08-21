import React from 'react'
import Navbar from '../../components/Layout/Navbar'
import { CoursePreview } from '@/types/course'
import CoursesList from '@/components/Courses/CoursesList'
interface AllCoursesProps {
    isLoggedIn: boolean
    onLogin: () => void
    onLogout: () => void
}
const AllCourses: React.FC<AllCoursesProps> = async ({
    isLoggedIn,
    onLogin,
    onLogout,
}) => {

    const response = await fetch("http://localhost:4000/get-all-courses");
    const allCourses: CoursePreview[] = await response.json();

    return (
        <div className="min-h-screen bg-stone-50">
            <Navbar isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
            <CoursesList allCourses={allCourses} />
        </div>
    )
}
export default AllCourses
