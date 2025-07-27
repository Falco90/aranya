"use client";

import React from 'react';
import { CourseBuilderProvider } from '../../components/CourseBuilder/CourseContext';
import CourseBuilderLayout from '../../components/CourseBuilder/CourseBuilderLayout';
const CourseView: React.FC = () => {
  return <div className="w-full min-h-screen bg-stone-50">
      <CourseBuilderProvider>
        <CourseBuilderLayout />
      </CourseBuilderProvider>
    </div>;
};
export default CourseView;