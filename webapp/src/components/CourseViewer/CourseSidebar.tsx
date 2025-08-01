import React, { useState } from 'react';
import { Course, Module } from '../../types/course';
import { ChevronDownIcon, ChevronRightIcon, BookIcon, LeafIcon, CheckCircleIcon } from 'lucide-react';
interface CourseSidebarProps {
  course: Course;
  activeModuleId: number | null;
  activeLessonId: number | null;
  onLessonSelect: (moduleId: number, lessonId: number) => void;
}
const CourseSidebar: React.FC<CourseSidebarProps> = ({
  course,
  activeModuleId,
  activeLessonId,
  onLessonSelect
}) => {
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    [activeModuleId || '']: true
  });
  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };
  return <div className="w-72 bg-white border-r border-stone-200 flex flex-col h-full">
      <div className="p-4 border-b border-stone-200">
        <div className="flex items-center space-x-2">
          <LeafIcon className="h-5 w-5 text-amber-700" />
          <h1 className="font-medium text-stone-800 text-lg">
            {course.title || 'Untitled Course'}
          </h1>
        </div>
      </div>
      <div className="overflow-y-auto flex-1 py-2">
        {course.modules.map(module => <div key={module.id} className="mb-1">
            <button onClick={() => toggleModule(module.id)} className={`w-full px-4 py-2 flex items-center justify-between text-left ${activeModuleId === module.id ? 'bg-stone-100 text-amber-800' : 'text-stone-700 hover:bg-stone-50'}`}>
              <div className="flex items-center">
                <span className="mr-2">
                  {expandedModules[module.id] ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                </span>
                <span className="font-medium">{module.title}</span>
              </div>
              <span className="text-xs text-stone-500">
                {module.lessons.length}
              </span>
            </button>
            {expandedModules[module.id] && <div className="ml-6 mr-2 mt-1 mb-2 space-y-1">
                {module.lessons.map(lesson => <button key={lesson.id} onClick={() => onLessonSelect(module.id, lesson.id)} className={`w-full px-3 py-2 text-sm rounded-md flex items-center text-left ${activeLessonId === lesson.id ? 'bg-amber-50 text-amber-800 border-l-2 border-amber-700' : 'text-stone-600 hover:bg-stone-50'}`}>
                    <BookIcon className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    <span className="truncate">{lesson.title}</span>
                  </button>)}
                {module.quiz && <button className="w-full px-3 py-2 text-sm rounded-md flex items-center text-left text-emerald-700 hover:bg-stone-50">
                    <CheckCircleIcon className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                  </button>}
              </div>}
          </div>)}
      </div>
      <div className="p-4 border-t border-stone-200 bg-stone-50">
        <div className="text-sm text-stone-600">
          <div className="flex items-center">
            <LeafIcon className="h-4 w-4 text-amber-700 mr-2" />
            <span>Zen Learning Path</span>
          </div>
        </div>
      </div>
    </div>;
};
export default CourseSidebar;