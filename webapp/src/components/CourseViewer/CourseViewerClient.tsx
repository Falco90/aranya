"use client";

import React from 'react';
import { CourseViewerProvider } from '../CourseViewer/CourseContext';
import CourseViewerLayout from './CourseViewerLayout';
import { Course } from '../../types/course';

interface Props {
    course: Course;
    completedLessonIds: number[];
}

const CourseViewerClient: React.FC<Props> = ({ course, completedLessonIds }) => {
    return (
        <CourseViewerProvider course={course} completedLessonIds={completedLessonIds}>
            <CourseViewerLayout />
        </CourseViewerProvider>
    );
};

export default CourseViewerClient;
