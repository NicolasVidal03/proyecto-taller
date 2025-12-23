import React from 'react';

interface Props {
  message: string;
}

const ErrorMessage: React.FC<Props> = ({ message }) => (
  <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
    {message}
  </div>
);

export default ErrorMessage;
