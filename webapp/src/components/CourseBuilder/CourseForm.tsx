import React, { useState } from 'react';
import { useCourseBuilder } from './CourseContext';
const CourseForm: React.FC = () => {
  const {
    course,
    setCourse
  } = useCourseBuilder();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCourse({
      ...course,
      title,
      description
    });
  };
  return <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-stone-800">Course Details</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1">
            Course Title
          </label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="block w-full text-stone-800 rounded-md border-stone-200 shadow-sm focus:outline-none focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border" placeholder="Enter course title" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1">
            Course Description
          </label>
          <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="block w-full text-stone-800 focus:outline-none rounded-md border-stone-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border" placeholder="Enter course description" />
        </div>
        <div className="pt-4">
          <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-amber-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
            Save Course Details
          </button>
        </div>
      </form>
    </div>;
};
export default CourseForm;