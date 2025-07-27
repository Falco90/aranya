import React from 'react';
import { useCourseBuilder } from './CourseContext';
import { BookOpenIcon, BookIcon, GraduationCapIcon, LeafIcon } from 'lucide-react';
const CoursePreview: React.FC = () => {
  const {
    course
  } = useCourseBuilder();
  if (!course.title) {
    return <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-4 text-stone-800">
          Course Preview
        </h2>
        <div className="bg-stone-100/50 p-8 rounded-lg border border-stone-200">
          <p className="text-stone-600">Please add course details first</p>
        </div>
      </div>;
  }
  return <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-stone-800">Course Preview</h2>
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-200">
          <div className="flex items-center mb-4">
            <LeafIcon className="h-6 w-6 text-amber-700 mr-2" />
            <h3 className="text-xl font-bold text-stone-800">{course.title}</h3>
          </div>
          <p className="text-stone-600">{course.description}</p>
          <div className="mt-4 text-sm text-emerald-700">
            {course.modules.length} module
            {course.modules.length !== 1 ? 's' : ''}
            {' • '}
            {course.modules.reduce((total, mod) => total + mod.lessons.length, 0)}{' '}
            lesson
            {course.modules.reduce((total, mod) => total + mod.lessons.length, 0) !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="divide-y divide-stone-100">
          {course.modules.map((module, index) => <div key={module.id} className="p-4">
              <div className="mb-2">
                <div className="flex items-center">
                  <div className="bg-amber-50 text-amber-700 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium mr-2">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-stone-800">{module.title}</h4>
                </div>
                <p className="text-sm text-stone-600 mt-1 ml-8">
                  {module.description}
                </p>
              </div>
              <div className="ml-8 mt-3 space-y-2">
                {module.lessons.map(lesson => <div key={lesson.id} className="flex items-center text-sm">
                    <BookIcon className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-stone-700">{lesson.title}</span>
                    {lesson.videoUrl && <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs border border-amber-100">
                        Video
                      </span>}
                  </div>)}
                {module.quiz && <div className="flex items-center text-sm">
                    <GraduationCapIcon className="h-4 w-4 text-amber-600 mr-2" />
                    <span className="text-stone-700">{module.quiz.title}</span>
                    <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs border border-amber-100">
                      Quiz • {module.quiz.questions.length} question
                      {module.quiz.questions.length !== 1 ? 's' : ''}
                    </span>
                  </div>}
              </div>
            </div>)}
        </div>
        {course.modules.length === 0 && <div className="p-8 text-center text-stone-600">
            No modules added yet
          </div>}
      </div>
    </div>;
};
export default CoursePreview;