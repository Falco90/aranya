import React from 'react';
import CourseViewerClient from '@/components/CourseViewer/CourseViewerClient';
import { Course } from '../../../types/course';

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const url = new URL("http://localhost:4000/get-course");
  url.searchParams.set("courseId", params.courseId);
  const res = await fetch(url);

  if (!res.ok) {
    return <div>Course not found</div>;
  }

  const course: Course = await res.json();

  return <CourseViewerClient course={course} />
};