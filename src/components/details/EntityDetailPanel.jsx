import React from 'react';
import { useTaskStore } from '../store/taskStore';

const EntityDetailPanel = () => {
  const selectedEntity = useTaskStore((s) => s.selectedEntity);

  if (!selectedEntity) return null;

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-medium">{selectedEntity.title}</h2>
      <p>{selectedEntity.description}</p>
      <p>Status: {selectedEntity.status}</p>
      <p>Progress: {selectedEntity.progress}%</p>
      <p>Priority: {selectedEntity.priority}</p>
      <p>Energy: {selectedEntity.energy}</p>
      <p>Due Date: {selectedEntity.deadline}</p>
      <p>Created Date: {selectedEntity.createdAt}</p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default EntityDetailPanel;
