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
