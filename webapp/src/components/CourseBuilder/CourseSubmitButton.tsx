'use client';

import { useCourseSubmit } from './useCourseSubmit';

const CourseSubmitButton: React.FC = () => {
  const { submitCourse } = useCourseSubmit();

  const handleClick = async () => {
    try {
      const result = await submitCourse();
      console.log('Course submitted:', result);
    } catch (err) {
      alert('Submission failed.');
    }
  };

  return (
    <button onClick={handleClick} className="px-4 py-2 bg-amber-700 text-white rounded">
      Submit Course
    </button>
  );
};

export default CourseSubmitButton;
