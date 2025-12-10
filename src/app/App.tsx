import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@modules/auth/pages/LoginPage';
import SuperAdminPage from '@modules/auth/pages/SuperAdminPage';
import UsersPage from '@modules/users/pages/UsersPage';
import ProtectedRoute from './guards/ProtectedRoute';

const App: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/users"
      element={(
        <ProtectedRoute>
          <UsersPage />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/super-admin"
      element={(
        <ProtectedRoute>
          <SuperAdminPage />
        </ProtectedRoute>
      )}
    />
    <Route path="/" element={<Navigate to="/users" replace />} />
    <Route path="*" element={<div className="p-6">404</div>} />
  </Routes>
);

export default App;
