import React from 'react';
import CourseViewerClient from '@/components/CourseViewer/CourseViewerClient';
import { Course } from '../../../types/course';

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const courseId = params.courseId;

  const getCourseUrl = new URL("http://localhost:4000/get-course");
  getCourseUrl.searchParams.set("courseId", courseId);

  const courseRes = await fetch(getCourseUrl);
  if (!courseRes.ok) {
    return <div>Course not found</div>;
  }

  const course: Course = await courseRes.json();

  return <CourseViewerClient course={course} />;
}