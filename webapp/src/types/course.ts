export interface AnswerOption {
  id: number,
  questionId: number,
  answerText: string;
  isCorrect: boolean;
}

export interface Question {
  id: number,
  quizId: number,
  questionText: string;
  answers: AnswerOption[];
}

export interface Quiz {
  id: number,
  moduleId: number,
  questions: Question[];
}

export type QuizResult = {
  score: number
  totalQuestions: number
  answers: Record<number, number> // questionId -> selectedOptionId
}

export interface Lesson {
  id: number,
  moduleId: number,
  title: string;
  content: string;
  videoUrl?: string | null;
  position: number;
}

export interface Module {
  id: number,
  courseId: number,
  title: string;
  position: number;
  lessons: Lesson[];
  quiz: Quiz;
}

export interface Course {
  id: number,
  title: string;
  description: string;
  creatorId: string;
  numLearners: number;
  numCompleted: number;
  modules: Module[];
}

export type Progress = {
  completedLessons: Record<number, boolean>
  completedQuizzes: Record<number, boolean>
  completedModules: Record<number, boolean>
  quizResults: Record<number, QuizResult>
}

export type CourseProgress = {
  completedLessonIds: number[];
  completedQuizIds: number[];
  completedModuleIds: number[];
  progressPercent: number;
  courseCompleted: boolean;
}

export type CoursePayload = {
  title: string;
  description: string;
  creatorId: string;
  modules: ModulePayload[];
};

export type ModulePayload = {
  title: string;
  position: number,
  lessons: LessonPayload[];
  quiz?: QuizPayload;
};

export type LessonPayload = {
  title: string;
  content: string;
  position: number;
  videoUrl?: string;
};

export type QuizPayload = {
  questions: QuestionPayload[];
};

export type QuestionPayload = {
  questionText: string;
  answers: AnswerOptionPayload[];
};

export type AnswerOptionPayload = {
  answerText: string;
  isCorrect: boolean;
};

export type CreatorCourseSummary = {
  courseId: number;
  title: string;
  numCompleted: number;
  numEnrolled: number;
}

export type LearnerCourseSummary = {
  courseId: number
  title: string
  totalModules: number
  completedModules: number
  progressPercent: number
  completed: boolean
}
