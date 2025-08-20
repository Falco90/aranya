"use client";

import React from 'react';
import { CourseBuilderProvider } from '../../components/CourseBuilder/CourseContext';
import CourseBuilderLayout from '../../components/CourseBuilder/CourseBuilderLayout';
import Navbar from '@/components/Layout/Navbar';

interface CourseBuilderPageProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const CourseView: React.FC<CourseBuilderPageProps> = (
  {
    isLoggedIn,
    onLogin,
    onLogout
  }
) => {
  return <div className="w-full min-h-screen bg-stone-50">
    <Navbar isLoggedIn={isLoggedIn} onLogin={onLogin} onLogout={onLogout} />
    <CourseBuilderProvider>
      <CourseBuilderLayout />
    </CourseBuilderProvider>
  </div>;
};
export default CourseView;