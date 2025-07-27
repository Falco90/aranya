import React, { useEffect, useState } from 'react';
import { useCourseBuilder, Quiz, QuizQuestion, MultipleChoiceOption } from './CourseContext';
import { TrashIcon, PlusIcon, CheckIcon, LeafIcon } from 'lucide-react';
const QuizForm: React.FC = () => {
  const {
    course,
    setCourse,
    activeModule
  } = useCourseBuilder();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const currentModule = course.modules.find(mod => mod.id === activeModule);
  // Load existing quiz if present
  useEffect(() => {
    if (currentModule?.quiz) {
      setTitle(currentModule.quiz.title);
      setDescription(currentModule.quiz.description);
      setQuestions(currentModule.quiz.questions);
    } else {
      setTitle('');
      setDescription('');
      setQuestions([]);
    }
  }, [currentModule]);
  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: '',
      options: [{
        id: '1',
        text: '',
        isCorrect: false
      }, {
        id: '2',
        text: '',
        isCorrect: false
      }]
    };
    setQuestions([...questions, newQuestion]);
  };
  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };
  const handleQuestionChange = (questionId: string, newText: string) => {
    setQuestions(questions.map(q => q.id === questionId ? {
      ...q,
      question: newText
    } : q));
  };
  const handleAddOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...q.options, {
            id: Date.now().toString(),
            text: '',
            isCorrect: false
          }]
        };
      }
      return q;
    }));
  };
  const handleRemoveOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.filter(opt => opt.id !== optionId)
        };
      }
      return q;
    }));
  };
  const handleOptionChange = (questionId: string, optionId: string, newText: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(opt => opt.id === optionId ? {
            ...opt,
            text: newText
          } : opt)
        };
      }
      return q;
    }));
  };
  const handleSetCorrect = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(opt => ({
            ...opt,
            isCorrect: opt.id === optionId
          }))
        };
      }
      return q;
    }));
  };
  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModule) {
      return;
    }
    const quiz: Quiz = {
      id: currentModule.quiz?.id || Date.now().toString(),
      title,
      description,
      questions
    };
    setCourse({
      ...course,
      modules: course.modules.map(mod => {
        if (mod.id === activeModule) {
          return {
            ...mod,
            quiz
          };
        }
        return mod;
      })
    });
  };
  if (!currentModule) {
    return <div className="text-center py-12">
        <p className="text-amber-700">Please select a module first</p>
      </div>;
  }
  return <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-stone-800">Quiz</h2>
      <p className="text-amber-700 mb-6">Module: {currentModule.title}</p>
      <form onSubmit={handleSaveQuiz} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quizTitle" className="block text-sm font-medium text-stone-700 mb-1">
              Quiz Title
            </label>
            <input type="text" id="quizTitle" value={title} onChange={e => setTitle(e.target.value)} className="block w-full text-stone-800 focus:outline-none rounded-md border-stone-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border" placeholder="Enter quiz title" required />
          </div>
          <div>
            <label htmlFor="quizDescription" className="block text-sm font-medium text-stone-700 mb-1">
              Quiz Description
            </label>
            <input type="text" id="quizDescription" value={description} onChange={e => setDescription(e.target.value)} className="block w-full text-stone-800 focus:outline-none rounded-md border-stone-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border" placeholder="Enter quiz description" />
          </div>
        </div>
        <div className="border-t border-stone-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-stone-700">Questions</h3>
            <button type="button" onClick={handleAddQuestion} className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Question
            </button>
          </div>
          {questions.length === 0 ? <div className="text-center py-8 bg-stone-100/50 rounded-md border border-stone-200">
              <p className="text-stone-600">No questions added yet</p>
            </div> : <div className="space-y-6">
              {questions.map((question, qIndex) => <div key={question.id} className="bg-stone-100/50 p-4 rounded-md border border-stone-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <LeafIcon className="h-4 w-4 text-amber-700 mr-2" />
                      <span className="font-medium text-stone-800">
                        Question {qIndex + 1}
                      </span>
                    </div>
                    <button type="button" onClick={() => handleRemoveQuestion(question.id)} className="text-red-500 hover:text-red-700">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <input type="text" value={question.question} onChange={e => handleQuestionChange(question.id, e.target.value)} className="block text-stone-800 focus:outline-none w-full rounded-md border-stone-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border" placeholder="Enter question" required />
                  </div>
                  <div className="space-y-3 mb-3">
                    {question.options.map(option => <div key={option.id} className="flex items-center space-x-2">
                        <button type="button" onClick={() => handleSetCorrect(question.id, option.id)} className={`flex-shrink-0 h-5 w-5 rounded-full border ${option.isCorrect ? 'bg-amber-700 border-amber-700 text-white' : 'border-gray-300 bg-white'} flex items-center justify-center`}>
                          {option.isCorrect && <CheckIcon className="h-3 w-3" />}
                        </button>
                        <input type="text" value={option.text} onChange={e => handleOptionChange(question.id, option.id, e.target.value)} className="block text-stone-800 focus:outline-none w-full rounded-md border-stone-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border" placeholder="Enter option" required />
                        {question.options.length > 2 && <button type="button" onClick={() => handleRemoveOption(question.id, option.id)} className="text-red-500 hover:text-red-700">
                            <TrashIcon className="h-4 w-4" />
                          </button>}
                      </div>)}
                  </div>
                  {question.options.length < 5 && <button type="button" onClick={() => handleAddOption(question.id)} className="text-sm text-emerald-700 hover:text-emerald-800 inline-flex items-center">
                      <PlusIcon className="h-3 w-3 mr-1" />
                      Add Option
                    </button>}
                </div>)}
            </div>}
        </div>
        <div className="pt-4 flex justify-end">
          <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-amber-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
            Save Quiz
          </button>
        </div>
      </form>
    </div>;
};
export default QuizForm;