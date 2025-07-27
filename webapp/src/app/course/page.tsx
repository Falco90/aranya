"use client";

import React from 'react';
import { CourseBuilderProvider } from '../../components/CourseBuilder/CourseContext';
import CourseViewerLayout from '../../components/CourseViewer/CourseViewerLayout';
const CourseView: React.FC = () => {
  return <div className="w-full min-h-screen bg-stone-50">
      <CourseBuilderProvider>
        <CourseViewerLayout />
      </CourseBuilderProvider>
    </div>;
};
export default CourseView;