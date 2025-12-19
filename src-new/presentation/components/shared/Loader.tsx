import React from 'react';

const Loader: React.FC = () => (
  <div className="flex items-center justify-center py-10">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-brand-600" />
  </div>
);

export default Loader;
