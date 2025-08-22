import React from 'react';
import { Lesson, Module } from '../../types/course';
import { ArrowLeftIcon, ArrowRightIcon, BookOpenIcon, CheckIcon, GraduationCap } from 'lucide-react';
interface LessonContentProps {
  lesson: Lesson;
  module: Module | undefined;
  nextLesson: {
    moduleId: number;
    lessonId: number;
  } | null;
  previousLesson: {
    moduleId: number;
    lessonId: number;
  } | null;
  isSubmitting: boolean;
  isLessonCompleted: (lessonId: number) => boolean;
  onNavigate: (moduleId: number, lessonId: number) => void;
  onComplete: () => void;
  isPreview: boolean;
}
const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  module,
  nextLesson,
  previousLesson,
  isSubmitting,
  isLessonCompleted,
  onNavigate,
  onComplete,
  isPreview
}) => {

  const lessonCompleted = isLessonCompleted(lesson.id);

  return <div className="max-w-3xl mx-auto px-6 py-8">
    <div className="mb-6">
      <div className="text-sm text-amber-700 mb-1">{module?.title}</div>
      <h1 className="text-2xl font-bold text-stone-800 mb-4">
        {lesson.title}
      </h1>
      {lesson.videoUrl && <div className="aspect-video mb-8 border border-stone-200 rounded-lg overflow-hidden bg-black">
        <iframe width="100%" height="100%" src={lesson.videoUrl} title={lesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
      </div>}
      <div className="prose prose-stone max-w-none">
        {/* Split content by newlines and create paragraphs */}
        {lesson.content.split('\n\n').map((paragraph, i) => <p key={i} className="mb-4 text-stone-700 leading-relaxed">
          {paragraph}
        </p>)}
      </div>
    </div>
    <div className="flex justify-between mt-12 pt-6 border-t border-stone-200">
      {previousLesson ? <button onClick={() => onNavigate(previousLesson.moduleId, previousLesson.lessonId)} className="flex items-center px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-md hover:bg-stone-200">
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Previous Lesson
      </button> : <div />

      }
      {!lessonCompleted && !isPreview &&
        <button
          onClick={onComplete}
          disabled={isSubmitting}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-700 rounded-md hover:bg-emerald-800"
        >
          <CheckIcon className="h-4 w-4 mr-2" />
          Mark as Complete
        </button>
      }

      {nextLesson ? <button onClick={() => onNavigate(nextLesson.moduleId, nextLesson.lessonId)} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-700 rounded-md hover:bg-amber-800">
        Next Lesson
        <ArrowRightIcon className="h-4 w-4 ml-2" />
      </button> : <div></div>}
    </div>
  </div>;
};
export default LessonContent;