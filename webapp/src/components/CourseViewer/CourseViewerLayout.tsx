import React, { useEffect, useState } from 'react';
import { useCourseViewer } from './CourseContext';
import CourseSidebar from './CourseSidebar';
import LessonContent from './LessonContent';
import QuizContent from './QuizContent';
import { QuizResult } from '@/types/course';
import { useAccount } from 'wagmi';
import EnrollModal from './EnrollModal';
import { ArrowRightIcon, BookOpenIcon, LeafIcon } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const CourseViewerLayout: React.FC = () => {
  const { course, markLessonComplete, markQuizComplete, getQuizResult, isQuizCompleted, isLessonCompleted, isModuleCompleted, progress, isEnrolled } = useCourseViewer();

  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected, chainId, address } = useAccount();
  const [isEnrolltModalOpen, setIsEnrollModalOpen] = useState(false);

  useEffect(() => {
    if (course.modules.length > 0 && !activeModuleId) {
      const firstModule = course.modules[0];
      setActiveModuleId(firstModule.id);
      if (firstModule.lessons.length > 0) {
        setActiveLessonId(firstModule.lessons[0].id);
        setActiveQuizId(null);
      } else if (firstModule.quiz) {
        setActiveLessonId(null);
        setActiveQuizId(firstModule.quiz.id);
      }
    }
  }, [course, activeModuleId]);
  const activeModule = course.modules.find(m => m.id === activeModuleId);
  const activeLesson = activeModule?.lessons.find(l => l.id === activeLessonId);

  const activeQuiz = activeModule?.quiz && activeModule.quiz.id === activeQuizId ? activeModule.quiz : null;
  const handleLessonChange = (moduleId: number, lessonId: number) => {

    if (!isEnrolled && moduleId !== course.modules[0].id) {
      alert("Enroll to unlock this module!");
      return;
    }
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);
    setActiveQuizId(null);
  };

  const handleQuizSelect = (moduleId: number, quizId: number) => {

    if (!isEnrolled && moduleId !== course.modules[0].id) {
      alert("Enroll to unlock this quiz!");
      return;
    }

    setActiveModuleId(moduleId);
    setActiveLessonId(null);
    setActiveQuizId(quizId);
  }

  const handleLessonComplete = async () => {
    if (!activeLesson || !activeModule || isSubmitting) return;

    setIsSubmitting(true);
    markLessonComplete(activeLesson.id);

    try {
      const newCompletedLessons = {
        ...progress.completedLessons,
        [activeLesson.id]: true,
      };

      const allLessonsCompleted = activeModule.lessons.every(
        (lesson) => newCompletedLessons[lesson.id]
      );

      console.log("all lessons completed: ", allLessonsCompleted);

      const quizCompleted = !activeModule.quiz || isQuizCompleted(activeModule.quiz.id);

      console.log("quiz completed; ", quizCompleted);

      const moduleComplete = allLessonsCompleted && quizCompleted;

      console.log("module complete: ", moduleComplete);

      await fetch('http://localhost:4000/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: activeLesson.id, learnerId: address }),
      });

      if (moduleComplete) {
        const res = await fetch('http://localhost:4000/complete-module', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId: activeModule.id, learnerId: address, courseId: course.id }),
        });

        const data = await res.json();
        console.log("module completed data", data);

        if (data.course_completed) {
          const res = await fetch('http://localhost:4000/complete-course', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ learnerId: address, courseId: course.id }),
          });

          const data = await res.json();
          console.log("course completed data", data);
        }

      }

      const nextLesson = getNextLesson();
      if (nextLesson) {
        handleLessonChange(nextLesson.moduleId, nextLesson.lessonId);
      } else if (activeModule.quiz) {
        handleQuizSelect(activeModule.id, activeModule.quiz.id);
      }
    } catch (err) {
      console.error("Failed to sync lesson/module completion:", err);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleQuizComplete = async (result: QuizResult) => {
    if (activeQuiz && activeModule) {

      const percentScore = Math.round(
        (result.score / result.totalQuestions) * 100,
      )
      const passed = percentScore >= 70

      if (passed) {
        markQuizComplete(activeQuiz.id, result);

        const learnerId = address;
        try {
          await fetch('http://localhost:4000/complete-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quizId: activeQuiz.id,
              learnerId: learnerId,
              score: result.score,
              totalQuestions: result.totalQuestions,
            }),
          });

          const moduleComplete = isModuleCompleted(activeModule.id);
          if (moduleComplete) {
            await fetch('http://localhost:4000/complete-module', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ moduleId: activeModule.id, learnerId }),
            });
          }
        } catch (err) {
          console.error("Failed to sync quiz/module completion:", err);
        }
      }
    }
  }

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
    return null;
  };

  const getNextModule = () => {
    if (!activeModule || !activeQuizId) return null;
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
  }

  const getPreviousLesson = () => {
    if (!activeModule || !activeLessonId) return null;
    const currentLessonIndex = activeModule.lessons.findIndex(l => l.id === activeLessonId);
    if (currentLessonIndex > 0) {
      return {
        moduleId: activeModule.id,
        lessonId: activeModule.lessons[currentLessonIndex - 1].id
      };
    }

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

  const handleOpenEnrollModal = () => {
    setIsEnrollModalOpen(true);
  };

  const handleCloseEnrollModal = () => {
    setIsEnrollModalOpen(false);
  };


  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      <>
        <CourseSidebar
          course={course}
          activeModuleId={activeModuleId}
          activeLessonId={activeLessonId}
          activeQuizId={activeQuizId}
          onLessonSelect={handleLessonChange}
          onQuizSelect={handleQuizSelect}
          isPreview={!isEnrolled}
        />
        <div className="flex-1 overflow-auto">
          {!isEnrolled && (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200 p-4">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="bg-amber-700 text-white p-2 rounded-lg mr-3">
                    <LeafIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-amber-800">
                      Course Preview Mode
                    </h2>
                    <p className="text-amber-700 text-sm">
                      You're viewing a preview of this course. Enroll to access
                      all modules.
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <button
                    onClick={handleOpenEnrollModal}
                    className="px-6 py-2.5 bg-amber-700 text-white rounded-md hover:bg-amber-800 flex items-center font-medium"
                  >
                    <BookOpenIcon className="h-5 w-5 mr-2" />
                    Enroll in Course
                  </button>
                ) : (
                  <ConnectButton />
                )}
              </div>
            </div>
          )}
          {activeLesson ? (
            <LessonContent
              lesson={activeLesson}
              module={activeModule}
              nextLesson={getNextLesson()}
              previousLesson={getPreviousLesson()}
              isSubmitting={isSubmitting}
              isLessonCompleted={isLessonCompleted}
              onNavigate={handleLessonChange}
              onComplete={handleLessonComplete}
              isPreview={!isEnrolled}
            />
          ) : activeQuiz ? (
            <QuizContent
              quiz={activeQuiz}
              module={activeModule!}
              onComplete={handleQuizComplete}
              existingResult={getQuizResult(activeQuiz.id)}
              isPreview={!isEnrolled}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <p className="text-stone-600">Select a lesson to begin learning</p>
              </div>
            </div>
          )}
        </div>
      </>
      <EnrollModal courseId={course.id} isOpen={isEnrolltModalOpen} onClose={handleCloseEnrollModal} />
    </div>
  );

};
export default CourseViewerLayout;