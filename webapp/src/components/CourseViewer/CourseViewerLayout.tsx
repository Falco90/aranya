import React, { useEffect, useState } from 'react';
import { useCourseBuilder } from '../CourseBuilder/CourseContext';
import CourseSidebar from './CourseSidebar';
import LessonContent from './LessonContent';
const CourseViewerLayout: React.FC = () => {
  const {
    course
  } = useCourseBuilder();
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  // Set initial active module and lesson
  useEffect(() => {
    if (course.modules.length > 0 && !activeModuleId) {
      const firstModule = course.modules[0];
      setActiveModuleId(firstModule.id);
      if (firstModule.lessons.length > 0) {
        setActiveLessonId(firstModule.lessons[0].id);
      }
    }
  }, [course, activeModuleId]);
  const activeModule = course.modules.find(m => m.id === activeModuleId);
  const activeLesson = activeModule?.lessons.find(l => l.id === activeLessonId);
  const handleLessonChange = (moduleId: string, lessonId: string) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);
  };
  const getNextLesson = () => {
    if (!activeModule || !activeLessonId) return null;
    const currentLessonIndex = activeModule.lessons.findIndex(l => l.id === activeLessonId);
    // If there's another lesson in this module
    if (currentLessonIndex < activeModule.lessons.length - 1) {
      return {
        moduleId: activeModule.id,
        lessonId: activeModule.lessons[currentLessonIndex + 1].id
      };
    }
    // Check for next module
    const currentModuleIndex = course.modules.findIndex(m => m.id === activeModuleId);
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        return {
          moduleId: nextModule.id,
          lessonId: nextModule.lessons[0].id
        };
      }
    }
    return null;
  };
  const getPreviousLesson = () => {
    if (!activeModule || !activeLessonId) return null;
    const currentLessonIndex = activeModule.lessons.findIndex(l => l.id === activeLessonId);
    // If there's a previous lesson in this module
    if (currentLessonIndex > 0) {
      return {
        moduleId: activeModule.id,
        lessonId: activeModule.lessons[currentLessonIndex - 1].id
      };
    }
    // Check for previous module
    const currentModuleIndex = course.modules.findIndex(m => m.id === activeModuleId);
    if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
      if (prevModule.lessons.length > 0) {
        return {
          moduleId: prevModule.id,
          lessonId: prevModule.lessons[prevModule.lessons.length - 1].id
        };
      }
    }
    return null;
  };
  return <div className="flex h-screen bg-stone-50 overflow-hidden">
      <CourseSidebar course={course} activeModuleId={activeModuleId} activeLessonId={activeLessonId} onLessonSelect={handleLessonChange} />
      <div className="flex-1 overflow-auto">
        {activeLesson ? <LessonContent lesson={activeLesson} module={activeModule} nextLesson={getNextLesson()} previousLesson={getPreviousLesson()} onNavigate={handleLessonChange} /> : <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-stone-600">
                Select a lesson to begin learning
              </p>
            </div>
          </div>}
      </div>
    </div>;
};
export default CourseViewerLayout;