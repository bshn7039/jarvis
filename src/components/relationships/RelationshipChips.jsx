import React from 'react';

const RelationshipChips = ({ links }) => {
  return (
    <div className="mt-4">
      {links.map((link) => (
        <span key={link.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
          {link.title}
        </span>
      ))}
    </div>
  );
};

export default RelationshipChips;
