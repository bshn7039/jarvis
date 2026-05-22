import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';

const EntityLinkSelector = ({ onAddLink }) => {
  const [linkType, setLinkType] = useState('');
  const [linkId, setLinkId] = useState('');

  const handleAddLink = () => {
    onAddLink(linkType, linkId);
    setLinkType('');
    setLinkId('');
  };

  return (
    <div>
      <select
        value={linkType}
        onChange={(e) => setLinkType(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
      >
        <option value="">Select Link Type</option>
        {/* Add options for different link types */}
      </select>
      <input
        type="text"
        id="linkId"
        name="linkId"
        value={linkId}
        onChange={(e) => setLinkId(e.target.value)}
        required
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
      />
      <button type="button" onClick={handleAddLink} className="bg-blue-500 text-white py-2 px-4 rounded mt-4">
        Add Link
      </button>
    </div>
  );
};

export default EntityLinkSelector;
