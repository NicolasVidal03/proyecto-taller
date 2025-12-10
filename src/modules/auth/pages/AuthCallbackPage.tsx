import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@shared/components/Loader';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Loader />
    </div>
  );
};

export default AuthCallbackPage;
