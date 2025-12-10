import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@modules/auth/providers/AuthProvider';
import { ENV } from '@shared/config/env';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

export default AppProviders;
