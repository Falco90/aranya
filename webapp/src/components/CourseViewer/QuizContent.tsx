import React, { useState } from 'react'
import { Quiz, Module, QuizResult} from '../../types/course';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  AwardIcon,
} from 'lucide-react'
interface QuizContentProps {
  quiz: Quiz
  module: Module
  existingResult?: QuizResult | null
}
const QuizContent: React.FC<QuizContentProps> = ({
  quiz,
  module,
  existingResult,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({})
  const [showResults, setShowResults] = useState(!!existingResult)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(
    existingResult || null,
  )
  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const hasSelectedAnswer = !!selectedAnswers[currentQuestion?.id]
  const handleSelectAnswer = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }
  const handleNextQuestion = () => {
    if (isLastQuestion) {
      calculateResults()
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }
  const calculateResults = () => {
    let correctAnswers = 0
    quiz.questions.forEach((question) => {
      const selectedOptionId = selectedAnswers[question.id]
      if (selectedOptionId) {
        const selectedOption = question.answers.find(
          (opt) => opt.id === selectedOptionId,
        )
        if (selectedOption?.isCorrect) {
          correctAnswers++
        }
      }
    })
    const result: QuizResult = {
      score: correctAnswers,
      totalQuestions: quiz.questions.length,
      answers: {
        ...selectedAnswers,
      },
    }
    setQuizResult(result)
    setShowResults(true)
  }
  const resetQuiz = () => {
    setSelectedAnswers({})
    setCurrentQuestionIndex(0)
    setShowResults(false)
    setQuizResult(null)
  }
  if (showResults && quizResult) {
    const percentScore = Math.round(
      (quizResult.score / quizResult.totalQuestions) * 100,
    )
    const passed = percentScore >= 70 // Assuming 70% is passing
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="text-sm text-amber-700 mb-1">{module.title}</div>
          <h1 className="text-2xl font-bold text-stone-800 mb-4">
            Quiz
          </h1>
          <div className="bg-white border border-stone-200 rounded-lg p-6 mb-6">
            <div className="text-center mb-6">
              <div
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'} mb-4`}
              >
                {passed ? (
                  <AwardIcon className="h-12 w-12" />
                ) : (
                  <XCircleIcon className="h-12 w-12" />
                )}
              </div>
              <h2 className="text-xl font-bold text-stone-800">
                {passed ? 'Quiz Passed!' : 'Try Again'}
              </h2>
              <p className="text-stone-600">
                You scored {quizResult.score} out of {quizResult.totalQuestions}{' '}
                ({percentScore}%)
              </p>
            </div>
            <div className="space-y-4 mb-6">
              {quiz.questions.map((question, idx) => {
                const selectedOptionId = quizResult.answers[question.id]
                const selectedOption = question.answers.find(
                  (opt) => opt.id === selectedOptionId,
                )
                const correctOption = question.answers.find(
                  (opt) => opt.isCorrect,
                )
                return (
                  <div
                    key={question.id}
                    className="border border-stone-200 rounded-md p-4"
                  >
                    <div className="flex items-start">
                      <div className="bg-stone-100 text-stone-700 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium mr-2 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-stone-800 mb-2">
                          {question.questionText}
                        </p>
                        <div className="space-y-2">
                          {question.answers.map((option) => {
                            const isSelected = option.id === selectedOptionId
                            const isCorrect = option.isCorrect
                            let bgColor = 'bg-white'
                            if (isSelected && isCorrect) {
                              bgColor = 'bg-emerald-50'
                            } else if (isSelected && !isCorrect) {
                              bgColor = 'bg-red-50'
                            } else if (isCorrect) {
                              bgColor = 'bg-emerald-50'
                            }
                            return (
                              <div
                                key={option.id}
                                className={`flex items-center p-2 rounded-md ${bgColor} border border-stone-200`}
                              >
                                {isSelected && isCorrect && (
                                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
                                )}
                                {isSelected && !isCorrect && (
                                  <XCircleIcon className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                                )}
                                {!isSelected && isCorrect && (
                                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 mr-2 flex-shrink-0" />
                                )}
                                {!isSelected && !isCorrect && (
                                  <div className="w-5 h-5 mr-2" />
                                )}
                                <span
                                  className={`${isCorrect ? 'text-emerald-700' : isSelected ? 'text-red-700' : 'text-stone-700'}`}
                                >
                                  {option.answerText}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center">
              <button
                onClick={resetQuiz}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-700 rounded-md hover:bg-amber-800"
              >
                <div className="h-4 w-4 mr-2" />
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="text-sm text-amber-700 mb-1">{module.title}</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-4">Quiz</h1>
        <p className="text-stone-600 mb-6">Quiz Description?</p>
        <div className="bg-white border border-stone-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-stone-500">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div className="h-2 bg-stone-100 rounded-full w-48">
              <div
                className="h-2 bg-amber-600 rounded-full"
                style={{
                  width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-stone-800 mb-4">
              {currentQuestion.questionText}
            </h3>
            <div className="space-y-3">
              {currentQuestion.answers.map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    handleSelectAnswer(currentQuestion.id, option.id)
                  }
                  className={`w-full text-left p-3 rounded-md border ${selectedAnswers[currentQuestion.id] === option.id ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-amber-200 hover:bg-amber-50/30'}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${selectedAnswers[currentQuestion.id] === option.id ? 'border-amber-500 bg-amber-500' : 'border-stone-300'}`}
                    >
                      {selectedAnswers[currentQuestion.id] === option.id && (
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-stone-700">{option.answerText}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleNextQuestion}
              disabled={!hasSelectedAnswer}
              className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md ${hasSelectedAnswer ? 'bg-amber-700 hover:bg-amber-800' : 'bg-stone-300 cursor-not-allowed'}`}
            >
              {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default QuizContent
