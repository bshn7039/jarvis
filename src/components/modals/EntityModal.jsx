import React from 'react';
import { useTaskStore } from '../store/taskStore';

const EntityModal = ({ isOpen, onClose, title, form, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-medium">{title}</h2>
        {form}
        <button
          type="button"
          onClick={onSubmit}
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-700 py-2 px-4 rounded mt-4 ml-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EntityModal;
