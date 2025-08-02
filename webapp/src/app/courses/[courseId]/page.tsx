import React from 'react';
import CourseViewerClient from '@/components/CourseViewer/CourseViewerClient';
import { Course } from '../../../types/course';

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const courseId = params.courseId;
  const learnerId = 'did:privy:cmd2wmiz80171kz0mmwjh1acf';

  const getCourseUrl = new URL("http://localhost:4000/get-course");
  getCourseUrl.searchParams.set("courseId", courseId);

  const getCompletedLessonIdsUrl = new URL("http://localhost:4000/get-completed-lesson-ids");
  getCompletedLessonIdsUrl.searchParams.set("courseId", courseId);
  getCompletedLessonIdsUrl.searchParams.set("learnerId", learnerId);

  const [courseRes, completedLessonsRes] = await Promise.all([
    fetch(getCourseUrl),
    fetch(getCompletedLessonIdsUrl),
  ]);

  if (!courseRes.ok) {
    return <div>Course not found</div>;
  }

  const course: Course = await courseRes.json();
  const completed = await completedLessonsRes.json();

  return <CourseViewerClient course={course} completedLessonIds={completed.lessonIds} />;
}