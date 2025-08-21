"use client";

import { CoursePreview } from "@/types/course"
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon } from "lucide-react"
import { useEffect, useState } from "react"
import CoursePreviewCard from "./CoursePreviewCard"

interface CoursesListProps {
    allCourses: CoursePreview[]
}
const CoursesList: React.FC<CoursesListProps> = ({ allCourses }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const coursesPerPage = 9

    const filteredCourses = allCourses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const indexOfLastCourse = currentPage * coursesPerPage
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage
    const currentCourses = filteredCourses.slice(
        indexOfFirstCourse,
        indexOfLastCourse,
    )

    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage)

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages)
        }
    }, [filteredCourses.length, currentPage, totalPages])
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-3xl font-bold text-stone-800">All Courses</h1>
                    <p className="mt-2 text-stone-600">
                        Browse our collection of {allCourses.length} courses to enhance
                        your skills
                    </p>
                </div>
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-stone-200 text-black rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                </div>
            </div>
            <div className="mb-6 flex items-center justify-between">
                <div className="text-sm text-stone-600">
                    Showing {currentCourses.length} of {filteredCourses.length} courses
                </div>
            </div>
            {currentCourses.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {currentCourses.map((course) => (
                        <CoursePreviewCard key={course.courseId} course={course} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-stone-600 mb-4">
                        No courses found matching "{searchTerm}"
                    </p>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"
                    >
                        Clear Search
                    </button>
                </div>
            )}
            {filteredCourses.length > coursesPerPage && (
                <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-1">
                        <button
                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentPage === 1 ? 'text-stone-400 cursor-not-allowed' : 'text-stone-700 hover:bg-stone-100'}`}
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                        </button>
                        {Array.from({
                            length: Math.min(5, totalPages),
                        }).map((_, index) => {
                            let pageNum = currentPage
                            if (totalPages <= 5) {
                                pageNum = index + 1
                            } else if (currentPage <= 3) {
                                pageNum = index + 1
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + index
                            } else {
                                pageNum = currentPage - 2 + index
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => paginate(pageNum)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentPage === pageNum ? 'bg-amber-700 text-white' : 'text-stone-700 hover:bg-stone-100'}`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentPage === totalPages ? 'text-stone-400 cursor-not-allowed' : 'text-stone-700 hover:bg-stone-100'}`}
                        >
                            <ArrowRightIcon className="h-4 w-4" />
                        </button>
                    </nav>
                </div>
            )}
        </div>
    )
}

export default CoursesList;