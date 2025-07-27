import React, { useEffect, useState } from 'react';
import { useCourseBuilder, Lesson } from './CourseContext';
import { TrashIcon, PencilIcon, LeafIcon } from 'lucide-react';
const LessonForm: React.FC = () => {
  const {
    course,
    setCourse,
    activeModule,
    setActiveLesson,
    activeLesson
  } = useCourseBuilder();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const currentModule = course.modules.find(mod => mod.id === activeModule);
  useEffect(() => {
    if (!currentModule) {
      return;
    }
    if (activeLesson) {
      const lesson = currentModule.lessons.find(l => l.id === activeLesson);
      if (lesson) {
        setTitle(lesson.title);
        setContent(lesson.content);
        setVideoUrl(lesson.videoUrl || '');
        setIsEditing(true);
      }
    }
  }, [activeLesson, currentModule]);
  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModule) {
      return;
    }
    if (isEditing && activeLesson) {
      setCourse({
        ...course,
        modules: course.modules.map(mod => {
          if (mod.id === activeModule) {
            return {
              ...mod,
              lessons: mod.lessons.map(lesson => lesson.id === activeLesson ? {
                ...lesson,
                title,
                content,
                videoUrl: videoUrl || undefined
              } : lesson)
            };
          }
          return mod;
        })
      });
      setIsEditing(false);
    } else {
      const newLesson: Lesson = {
        id: Date.now().toString(),
        title,
        content,
        videoUrl: videoUrl || undefined
      };
      setCourse({
        ...course,
        modules: course.modules.map(mod => {
          if (mod.id === activeModule) {
            return {
              ...mod,
              lessons: [...mod.lessons, newLesson]
            };
          }
          return mod;
        })
      });
    }
    setTitle('');
    setContent('');
    setVideoUrl('');
    setActiveLesson(null);
  };
  const handleEditLesson = (lesson: Lesson) => {
    setTitle(lesson.title);
    setContent(lesson.content);
    setVideoUrl(lesson.videoUrl || '');
    setActiveLesson(lesson.id);
    setIsEditing(true);
  };
  const handleDeleteLesson = (id: string) => {
    setCourse({
      ...course,
      modules: course.modules.map(mod => {
        if (mod.id === activeModule) {
          return {
            ...mod,
            lessons: mod.lessons.filter(lesson => lesson.id !== id)
          };
        }
        return mod;
      })
    });
    if (activeLesson === id) {
      setActiveLesson(null);
    }
  };
  if (!currentModule) {
    return <div className="text-center py-12">
        <p className="text-amber-700">Please select a module first</p>
      </div>;
  }
  return <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-stone-800">Lessons</h2>
      <p className="text-amber-700 mb-6">Module: {currentModule.title}</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4 text-stone-700">
            {isEditing ? 'Edit Lesson' : 'Add New Lesson'}
          </h3>
          <form onSubmit={handleAddLesson} className="space-y-4">
            <div>
              <label htmlFor="lessonTitle" className="block text-sm font-medium text-stone-700 mb-1">
                Lesson Title
              </label>
              <input type="text" id="lessonTitle" value={title} onChange={e => setTitle(e.target.value)} className="block w-full text-stone-800 focus:outline-none rounded-md border-stone-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border" placeholder="Enter lesson title" required />
            </div>
            <div>
              <label htmlFor="lessonContent" className="block text-sm font-medium text-stone-700 mb-1">
                Lesson Content
              </label>
              <textarea id="lessonContent" value={content} onChange={e => setContent(e.target.value)} rows={6} className="block w-full text-stone-800 focus:outline-none rounded-md border-stone-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border" placeholder="Enter lesson content" required />
            </div>
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-stone-700 mb-1">
                Video URL (optional)
              </label>
              <input type="url" id="videoUrl" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="block w-full text-stone-800 focus:outline-none rounded-md border-stone-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border" placeholder="https://www.youtube.com/embed/video-id" />
              {videoUrl && <div className="mt-2 border border-stone-200 rounded-md overflow-hidden">
                  <iframe width="100%" height="150" src={videoUrl} title="Video preview" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>}
            </div>
            <div className="pt-2 flex gap-2">
              <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-amber-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                {isEditing ? 'Update Lesson' : 'Add Lesson'}
              </button>
              {isEditing && <button type="button" onClick={() => {
              setIsEditing(false);
              setTitle('');
              setContent('');
              setVideoUrl('');
              setActiveLesson(null);
            }} className="inline-flex justify-center rounded-md border border-stone-200 bg-white py-2 px-4 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                  Cancel
                </button>}
            </div>
          </form>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4 text-stone-700">
            Lesson List
          </h3>
          {currentModule.lessons.length === 0 ? <div className="text-center py-8 bg-stone-100/50 rounded-md border border-stone-200">
              <p className="text-stone-600">No lessons created yet</p>
            </div> : <div className="space-y-3">
              {currentModule.lessons.map(lesson => <div key={lesson.id} className="p-4 rounded-md border border-stone-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <LeafIcon className="h-4 w-4 text-amber-700 mr-2" />
                        <h4 className="font-medium text-stone-800">
                          {lesson.title}
                        </h4>
                      </div>
                      <p className="text-sm text-stone-600 mt-1 ml-6">
                        {lesson.content.substring(0, 100)}
                        {lesson.content.length > 100 ? '...' : ''}
                      </p>
                      {lesson.videoUrl && <div className="mt-1 text-xs text-emerald-700 ml-6">
                          Has video content
                        </div>}
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditLesson(lesson)} className="text-stone-400 hover:text-amber-700">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteLesson(lesson.id)} className="text-stone-400 hover:text-red-500">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>)}
            </div>}
        </div>
      </div>
    </div>;
};
export default LessonForm;