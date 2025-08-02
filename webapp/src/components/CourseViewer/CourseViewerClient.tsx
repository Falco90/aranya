"use client";

import React from 'react';
import { CourseViewerProvider } from '../CourseViewer/CourseContext';
import CourseViewerLayout from './CourseViewerLayout';
import { Course } from '../../types/course';

interface Props {
    course: Course;
}

const CourseViewerClient: React.FC<Props> = ({ course }) => {
    return (
        <CourseViewerProvider course={course}>
            <CourseViewerLayout />
        </CourseViewerProvider>
    );
};

export default CourseViewerClient;
