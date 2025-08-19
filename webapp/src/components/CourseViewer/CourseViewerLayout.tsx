import React, { useEffect, useState } from 'react';
import { useCourseViewer } from './CourseContext';
import CourseSidebar from './CourseSidebar';
import LessonContent from './LessonContent';
import QuizContent from './QuizContent';
import { QuizResult } from '@/types/course';
import { useAccount } from 'wagmi';

const CourseViewerLayout: React.FC = () => {
  const { course, markLessonComplete, markQuizComplete, getQuizResult, isQuizCompleted, isLessonCompleted, isModuleCompleted, progress } = useCourseViewer();

  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isConnected, chainId, address } = useAccount();
  // Set initial active module and lesson
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
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);
    setActiveQuizId(null);
  };

  const handleQuizSelect = (moduleId: number, quizId: number) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(null);
    setActiveQuizId(quizId);
  }

  const handleLessonComplete = async () => {
    if (!activeLesson || !activeModule || isSubmitting) return;

    setIsSubmitting(true);

    // Mark lesson complete in state
    markLessonComplete(activeLesson.id);

    try {
      // Manually compute "new completed lessons" instead of relying on async state update
      const newCompletedLessons = {
        ...progress.completedLessons,
        [activeLesson.id]: true,
      };

      // Check if all lessons in this module are now completed
      const allLessonsCompleted = activeModule.lessons.every(
        (lesson) => newCompletedLessons[lesson.id]
      );

      console.log("all lessons completed: ", allLessonsCompleted);

      // Quiz is considered completed if there's no quiz
      const quizCompleted = !activeModule.quiz || isQuizCompleted(activeModule.quiz.id);

      console.log("quiz completed; ", quizCompleted);

      const moduleComplete = allLessonsCompleted && quizCompleted;

      console.log("module complete: ", moduleComplete);

      // Sync lesson completion to backend
      await fetch('http://localhost:4000/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: activeLesson.id, learnerId: address }),
      });

      // Sync module completion if needed
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

      // Navigate to next lesson or quiz
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

        const learnerId = 'did:privy:cmd2wmiz80171kz0mmwjh1acf';
        try {
          await fetch('http://localhost:4000/complete-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quizId: activeQuiz.id,
              learnerId: learnerId,  // from session/context
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
    <CourseSidebar course={course} activeModuleId={activeModuleId} activeLessonId={activeLessonId} activeQuizId={activeQuizId} onLessonSelect={handleLessonChange} onQuizSelect={handleQuizSelect} />
    <div className="flex-1 overflow-auto">
      {activeLesson ? <LessonContent lesson={activeLesson} module={activeModule} nextLesson={getNextLesson()} previousLesson={getPreviousLesson()} isSubmitting={isSubmitting} isLessonCompleted={isLessonCompleted} onNavigate={handleLessonChange} onComplete={handleLessonComplete} /> : activeQuiz ? (
        <QuizContent quiz={activeQuiz} module={activeModule!} onComplete={handleQuizComplete} existingResult={getQuizResult(activeQuiz.id)} />
      ) : <div className="flex items-center justify-center h-full">
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