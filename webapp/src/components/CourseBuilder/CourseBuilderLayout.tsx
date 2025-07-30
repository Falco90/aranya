import React, { useState } from 'react';
import { useCourseBuilder } from './CourseContext';
import CourseForm from './CourseForm';
import ModuleForm from './ModuleForm';
import LessonForm from './LessonForm';
import QuizForm from './QuizForm';
import CoursePreview from './CoursePreview';
import { PlusIcon, BookOpenIcon, BookIcon, GraduationCapIcon, LayoutIcon, LeafIcon } from 'lucide-react';
import CourseSubmitButton from './CourseSubmitButton';
import PrivyLoginButton from '../PrivyLoginButton';
type Tab = 'course' | 'module' | 'lesson' | 'quiz' | 'preview';
const CourseBuilderLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('course');
  const {
    course,
    activeModule
  } = useCourseBuilder();
  return <div className="flex h-screen overflow-hidden bg-stone-50">
    {/* Sidebar */}
    <div className="w-64 bg-white border-r border-stone-200 p-4 flex flex-col">
      <div className="mb-6 flex items-center">
        <LeafIcon className="h-5 w-5 text-amber-700 mr-2" />
        <div>
          <h1 className="text-xl font-bold text-stone-800">Course Builder</h1>
          <p className="text-sm text-stone-600">Create your course content</p>
        </div>
      </div>
      <nav className="space-y-1">
        <button onClick={() => setActiveTab('course')} className={`flex items-center px-3 py-2 w-full text-left rounded-md ${activeTab === 'course' ? 'bg-stone-100 text-amber-800' : 'text-stone-700 hover:bg-stone-50'}`}>
          <BookOpenIcon className="mr-2 h-5 w-5" />
          Course Details
        </button>
        <button onClick={() => setActiveTab('module')} className={`flex items-center px-3 py-2 w-full text-left rounded-md ${activeTab === 'module' ? 'bg-stone-100 text-amber-800' : 'text-stone-700 hover:bg-stone-50'}`}>
          <LayoutIcon className="mr-2 h-5 w-5" />
          Modules
        </button>
        <button onClick={() => setActiveTab('lesson')} disabled={!activeModule} className={`flex items-center px-3 py-2 w-full text-left rounded-md ${!activeModule ? 'opacity-50 cursor-not-allowed text-gray-400' : activeTab === 'lesson' ? 'bg-stone-100 text-amber-800' : 'text-stone-700 hover:bg-stone-50'}`}>
          <BookIcon className="mr-2 h-5 w-5" />
          Lessons
        </button>
        <button onClick={() => setActiveTab('quiz')} disabled={!activeModule} className={`flex items-center px-3 py-2 w-full text-left rounded-md ${!activeModule ? 'opacity-50 cursor-not-allowed text-gray-400' : activeTab === 'quiz' ? 'bg-stone-100 text-amber-800' : 'text-stone-700 hover:bg-stone-50'}`}>
          <GraduationCapIcon className="mr-2 h-5 w-5" />
          Quizzes
        </button>
        <button onClick={() => setActiveTab('preview')} className={`flex items-center px-3 py-2 w-full text-left rounded-md ${activeTab === 'preview' ? 'bg-stone-100 text-amber-800' : 'text-stone-700 hover:bg-stone-50'}`}>
          <PlusIcon className="mr-2 h-5 w-5" />
          Preview Course
        </button>
        <CourseSubmitButton />
      </nav>
      <div className="mt-auto pt-4 border-t border-stone-200">
        <div className="text-sm text-stone-600">
          <p className="font-medium">{course.title || 'Untitled Course'}</p>
          <p className="mt-1">{course.modules.length} module(s)</p>
        </div>
      </div>
    </div>
    {/* Main content */}
    <div className="flex-1 overflow-auto p-6 bg-stone-50">
      {activeTab === 'course' && <CourseForm />}
      {activeTab === 'module' && <ModuleForm />}
      {activeTab === 'lesson' && <LessonForm />}
      {activeTab === 'quiz' && <QuizForm />}
      {activeTab === 'preview' && <CoursePreview />}
    </div>
  </div>;
};
export default CourseBuilderLayout;