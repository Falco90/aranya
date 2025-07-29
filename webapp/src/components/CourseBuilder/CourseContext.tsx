import React, { useState, createContext, useContext, ReactNode } from 'react';
// Define types
export type AnswerOption = {
  id: string;
  answerText: string;
  isCorrect: boolean;
};
export type Question = {
  id: string;
  questionText: string;
  options: AnswerOption[];
};
export type Quiz = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
};
export type Lesson = {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
};
export type Module = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  quiz?: Quiz;
};
export type Course = {
  id: string;
  title: string;
  description: string;
  modules: Module[];
};
// Create an initial empty course
const initialCourse: Course = {
  id: '1',
  title: '',
  description: '',
  modules: []
};
// Define context type
type CourseBuilderContextType = {
  course: Course;
  setCourse: React.Dispatch<React.SetStateAction<Course>>;
  activeModule: string | null;
  setActiveModule: React.Dispatch<React.SetStateAction<string | null>>;
  activeLesson: string | null;
  setActiveLesson: React.Dispatch<React.SetStateAction<string | null>>;
  activeQuiz: string | null;
  setActiveQuiz: React.Dispatch<React.SetStateAction<string | null>>;
};
// Create context
const CourseBuilderContext = createContext<CourseBuilderContextType | undefined>(undefined);
// Create provider
export const CourseBuilderProvider: React.FC<{
  children: ReactNode;
}> = ({
  children
}) => {
  const [course, setCourse] = useState<Course>(initialCourse);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  return <CourseBuilderContext.Provider value={{
    course,
    setCourse,
    activeModule,
    setActiveModule,
    activeLesson,
    setActiveLesson,
    activeQuiz,
    setActiveQuiz
  }}>
      {children}
    </CourseBuilderContext.Provider>;
};
// Create hook for using the context
export const useCourseBuilder = () => {
  const context = useContext(CourseBuilderContext);
  if (context === undefined) {
    throw new Error('useCourseBuilder must be used within a CourseBuilderProvider');
  }
  return context;
};