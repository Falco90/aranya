import React from 'react';
import CourseViewerClient from '@/components/CourseViewer/CourseViewerClient';
import { Course } from '../../../types/course';

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const courseId = params.courseId;
  const learnerId = 'did:privy:cmd2wmiz80171kz0mmwjh1acf';

  const getCourseUrl = new URL("http://localhost:4000/get-course");
  getCourseUrl.searchParams.set("courseId", courseId);

  const getCourseProgressUrl = new URL("http://localhost:4000/get-course-progress");
  getCourseProgressUrl.searchParams.set("courseId", courseId);
  getCourseProgressUrl.searchParams.set("learnerId", learnerId);

  const [courseRes, completedLessonsRes] = await Promise.all([
    fetch(getCourseUrl),
    fetch(getCourseProgressUrl),
  ]);

  if (!courseRes.ok) {
    return <div>Course not found</div>;
  }

  const course: Course = await courseRes.json();
  const courseProgress = await completedLessonsRes.json();
  console.log(courseProgress);

  return <CourseViewerClient course={course} courseProgress={courseProgress} />;
}