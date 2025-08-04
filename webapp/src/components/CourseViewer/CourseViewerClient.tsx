"use client";

import React from 'react';
import { CourseViewerProvider } from '../CourseViewer/CourseContext';
import CourseViewerLayout from './CourseViewerLayout';
import { Course, CourseProgress } from '../../types/course';

interface Props {
    course: Course;
    courseProgress: CourseProgress;
}

const CourseViewerClient: React.FC<Props> = ({ course, courseProgress }) => {
    return (
        <CourseViewerProvider course={course} courseProgress={courseProgress}>
            <CourseViewerLayout />
        </CourseViewerProvider>
    );
};

export default CourseViewerClient;
