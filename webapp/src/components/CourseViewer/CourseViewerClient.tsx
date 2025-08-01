// components/CourseViewer/CourseViewerClient.tsx
"use client";

import React from 'react';
import { CourseBuilderProvider } from '../CourseBuilder/CourseContext';
import CourseViewerLayout from './CourseViewerLayout';
import { Course } from '../../types/course';

interface Props {
    course: Course;
}

const CourseViewerClient: React.FC<Props> = ({ course }) => {
    return (
        <CourseBuilderProvider>
            <CourseViewerLayout course={course} />
        </CourseBuilderProvider>
    );
};

export default CourseViewerClient;
