import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import CourseViewerClient from '@/components/CourseViewer/CourseViewerClient';
import { Course } from '../../../types/course';

interface CoursePageProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  params: { courseId: string };
}

const CoursePage = async ({ isLoggedIn, onLogin, onLogout, params }: CoursePageProps) => {
  const courseId = params.courseId;

  const getCourseUrl = new URL("http://localhost:4000/get-course");
  getCourseUrl.searchParams.set("courseId", courseId);

  const courseRes = await fetch(getCourseUrl);
  if (!courseRes.ok) {
    return <div>Course not found</div>;
  }

  const course: Course = await courseRes.json();

  return (
    <div className="w-full min-h-screen bg-stone-50">
      <Navbar isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
      <CourseViewerClient course={course} />
    </div>
  );
};

export default CoursePage;
