'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface CompleteLessonButtonProps {
  lessonId: number;
  moduleId: number;
  courseId: number;
}

export default function CompleteLessonButton({ lessonId, moduleId, courseId }: CompleteLessonButtonProps) {
  const { user, ready } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async () => {
    console.log("lessonId: ", lessonId);
    if (!ready || !user) {
      setError('You must be logged in to complete the lesson.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/complete-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privy_id: user.id,
          lesson_id: lessonId,
          module_id: moduleId,
          course_id: courseId
        }),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Failed to mark lesson as complete');
      }

      setCompleted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return <p className="text-green-600">Lesson completed ✅</p>;
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleComplete}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Completing...' : 'Mark Lesson as Complete'}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
