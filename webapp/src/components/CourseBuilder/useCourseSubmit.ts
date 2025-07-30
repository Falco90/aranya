'use client';

import { Quiz, useCourseBuilder } from './CourseContext';

type CoursePayload = {
  title: string;
  description: string;
  creatorId: string;
  modules: ModulePayload[];
};

type ModulePayload = {
  title: string;
  position: number,
  lessons: LessonPayload[];
  quiz?: QuizPayload;
};

type LessonPayload = {
  title: string;
  content: string;
  position: number;
  videoUrl?: string;
};

type QuizPayload = {
  questions: QuestionPayload[];
};

type QuestionPayload = {
  questionText: string;
  answers: AnswerOptionPayload[];
};

type AnswerOptionPayload = {
  answerText: string;
  isCorrect: boolean;
};

function toQuizPayload(quiz: Quiz): QuizPayload {
  return {
    questions: quiz.questions.map((q) => ({
      questionText: q.questionText,
      answers: q.answers.map((opt) => ({
        answerText: opt.answerText,
        isCorrect: opt.isCorrect,
      })),
    })),
  };
}

export const useCourseSubmit = () => {
  const { course } = useCourseBuilder();

  const coursePayload: CoursePayload = {
    title: course.title,
    description: course.description,
    creatorId: 'test-user',
    modules: course.modules.map((mod) => ({
      title: mod.title,
      position: mod.position,
      lessons: mod.lessons.map((lesson) => ({
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        position: lesson.position,
      })),
      quiz: mod.quiz ? toQuizPayload(mod.quiz) : undefined
    }))
  };


  const submitCourse = async () => {
    try {
      const response = await fetch('http://localhost:4000/create-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coursePayload),
      });

      console.log("COURSE: ", coursePayload);

      if (!response.ok) {
        throw new Error(`Failed to submit course: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { submitCourse };
};
