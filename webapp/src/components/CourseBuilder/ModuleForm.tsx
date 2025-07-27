import React, { useState } from 'react';
import { useCourseBuilder, Module } from './CourseContext';
import { TrashIcon, PencilIcon, LeafIcon } from 'lucide-react';
const ModuleForm: React.FC = () => {
  const {
    course,
    setCourse,
    setActiveModule,
    activeModule
  } = useCourseBuilder();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && activeModule) {
      setCourse({
        ...course,
        modules: course.modules.map(mod => mod.id === activeModule ? {
          ...mod,
          title,
          description
        } : mod)
      });
      setIsEditing(false);
    } else {
      const newModule: Module = {
        id: Date.now().toString(),
        title,
        description,
        lessons: []
      };
      setCourse({
        ...course,
        modules: [...course.modules, newModule]
      });
    }
    setTitle('');
    setDescription('');
  };
  const handleEditModule = (module: Module) => {
    setTitle(module.title);
    setDescription(module.description);
    setActiveModule(module.id);
    setIsEditing(true);
  };
  const handleDeleteModule = (id: string) => {
    setCourse({
      ...course,
      modules: course.modules.filter(mod => mod.id !== id)
    });
    if (activeModule === id) {
      setActiveModule(null);
    }
  };
  const handleSelectModule = (id: string) => {
    setActiveModule(id);
  };
  return <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-stone-800">Modules</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4 text-stone-700">
            {isEditing ? 'Edit Module' : 'Add New Module'}
          </h3>
          <form onSubmit={handleAddModule} className="space-y-4">
            <div>
              <label htmlFor="moduleTitle" className="block text-sm font-medium text-stone-700 mb-1">
                Module Title
              </label>
              <input type="text" id="moduleTitle" value={title} onChange={e => setTitle(e.target.value)} className="block w-full text-stone-800 focus:outline-none rounded-md border-stone-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border" placeholder="Enter module title" required />
            </div>
            <div>
              <label htmlFor="moduleDescription" className="block text-sm font-medium text-stone-700 mb-1">
                Module Description
              </label>
              <textarea id="moduleDescription" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="block w-full text-stone-800 focus:outline-none rounded-md border-stone-200 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border" placeholder="Enter module description" />
            </div>
            <div className="pt-2 flex gap-2">
              <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-amber-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                {isEditing ? 'Update Module' : 'Add Module'}
              </button>
              {isEditing && <button type="button" onClick={() => {
              setIsEditing(false);
              setTitle('');
              setDescription('');
            }} className="inline-flex justify-center rounded-md border border-stone-200 bg-white py-2 px-4 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                  Cancel
                </button>}
            </div>
          </form>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4 text-stone-700">
            Module List
          </h3>
          {course.modules.length === 0 ? <div className="text-center py-8 bg-stone-100/50 rounded-md border border-stone-200">
              <p className="text-stone-600">No modules created yet</p>
            </div> : <div className="space-y-3">
              {course.modules.map(module => <div key={module.id} className={`p-4 rounded-md border ${module.id === activeModule ? 'border-amber-500 bg-amber-50/40' : 'border-stone-200'}`} onClick={() => handleSelectModule(module.id)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <LeafIcon className="h-4 w-4 text-amber-700 mr-2" />
                        <h4 className="font-medium text-stone-800">
                          {module.title}
                        </h4>
                      </div>
                      <p className="text-sm text-stone-600 mt-1 ml-6">
                        {module.description}
                      </p>
                      <div className="mt-1 text-xs text-emerald-700 ml-6">
                        {module.lessons.length} lesson(s)
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={e => {
                  e.stopPropagation();
                  handleEditModule(module);
                }} className="text-stone-400 hover:text-amber-700">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={e => {
                  e.stopPropagation();
                  handleDeleteModule(module.id);
                }} className="text-stone-400 hover:text-red-500">
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
export default ModuleForm;