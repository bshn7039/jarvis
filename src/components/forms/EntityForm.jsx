import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';

const EntityForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'Medium',
    energy: 'medium',
    linkedGoalIds: [],
    linkedSubjectIds: [],
    linkedScheduleIds: [],
    linkedJournalIds: [],
    linkedFinanceIds: [],
    linkedContactIds: [],
    deadline: new Date().toISOString(),
    estimatedTime: '30m',
    tags: ['quick-capture'],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await useTaskStore.getState().addTask(formData);
    useTaskStore.getState().closeModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
        />
      </div>
      {/* Add more form fields as needed */}
      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
        Save
      </button>
    </form>
  );
};

export default EntityForm;
