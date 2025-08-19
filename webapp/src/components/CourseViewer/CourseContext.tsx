import React, { useState, createContext, useContext, ReactNode } from 'react'
import { Course, QuizResult, Progress, CourseProgress } from '../../types/course';
// Define context type
type CourseViewerContextType = {
    course: Course
    activeModule: number | null
    setActiveModule: React.Dispatch<React.SetStateAction<number | null>>
    activeLesson: number | null
    setActiveLesson: React.Dispatch<React.SetStateAction<number | null>>
    activeQuiz: number | null
    setActiveQuiz: React.Dispatch<React.SetStateAction<number | null>>
    // Progress tracking
    progress: Progress
    markLessonComplete: (lessonId: number) => void
    markQuizComplete: (quizId: number, result: QuizResult) => void
    isLessonCompleted: (lessonId: number) => boolean
    isQuizCompleted: (quizId: number) => boolean
    isModuleCompleted: (moduleId: number) => boolean
    getQuizResult: (quizId: number) => QuizResult | null
}
// Create context
const CourseViewerContext = createContext<
    CourseViewerContextType | undefined
>(undefined)
// Create provider
export const CourseViewerProvider: React.FC<{
    children: ReactNode,
    course: Course,
    courseProgress: CourseProgress,
}> = ({ children, course, courseProgress }) => {
    const [activeModule, setActiveModule] = useState<number | null>(null)
    const [activeLesson, setActiveLesson] = useState<number | null>(null)
    const [activeQuiz, setActiveQuiz] = useState<number | null>(null)
    const [progress, setProgress] = useState<Progress>({
        completedLessons: courseProgress.completedLessonIds.reduce((acc, id) => {
            acc[id] = true
            return acc
        }, {} as Record<number, boolean>),
        completedQuizzes: courseProgress.completedQuizIds.reduce((acc, id) => {
            acc[id] = true;
            return acc;
        }, {} as Record<number, boolean>),
        completedModules: courseProgress.completedModuleIds.reduce((acc, id) => {
            acc[id] = true;
            return acc;
        }, {} as Record<number, boolean>),
        quizResults: {},
    })
    // Progress tracking functions
    const markLessonComplete = (lessonId: number) => {
        setProgress((prev) => ({
            ...prev,
            completedLessons: {
                ...prev.completedLessons,
                [lessonId]: true,
            },
        }))
    }
    const markQuizComplete = (quizId: number, result: QuizResult) => {
        setProgress((prev) => ({
            ...prev,
            completedQuizzes: {
                ...prev.completedQuizzes,
                [quizId]: true,
            },
            quizResults: {
                ...prev.quizResults,
                [quizId]: result,
            },
        }))
    }
    const isLessonCompleted = (lessonId: number) => {
        return !!progress.completedLessons[lessonId]
    }
    const isQuizCompleted = (quizId: number) => {
        return !!progress.completedQuizzes[quizId]
    }
    const isModuleCompleted = (moduleId: number) => {
        const module = course.modules.find((m) => m.id === moduleId)
        console.log("module: ", module);
        if (!module) return false
        // Check if all lessons are completed
        const allLessonsCompleted = module.lessons.every((lesson) =>
            isLessonCompleted(lesson.id),
        )
        // Check if quiz is completed (if there is one)
        const quizCompleted = !module.quiz || isQuizCompleted(module.quiz.id)
        return allLessonsCompleted && quizCompleted
    }
    const getQuizResult = (quizId: number) => {
        return progress.quizResults[quizId] || null
    }
    return (
        <CourseViewerContext.Provider
            value={{
                course,
                activeModule,
                setActiveModule,
                activeLesson,
                setActiveLesson,
                activeQuiz,
                setActiveQuiz,
                progress,
                markLessonComplete,
                markQuizComplete,
                isLessonCompleted,
                isQuizCompleted,
                isModuleCompleted,
                getQuizResult,
            }}
        >
            {children}
        </CourseViewerContext.Provider>
    )
}
// Create hook for using the context
export const useCourseViewer = () => {
    const context = useContext(CourseViewerContext)
    if (context === undefined) {
        throw new Error(
            'useCourseViewer must be used within a CourseViewerProvider',
        )
    }
    return context
}