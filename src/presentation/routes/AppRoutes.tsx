import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute, PrivilegedRoute } from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import {
  LoginPage,
  ProductsPage,
  StockPage,
  UsersPage,
  ProfilePage,
  ActivitiesPage,
} from '../pages';

import ClientsBusinessesPage from '../pages/ClientsBusinessesPage';
import AreasPage from '../pages/AreasPage';
import RoutesPage from '../pages/RoutesPage';
import { PresalesPage } from '../pages/PresalesPage';
import { useAuth } from '../providers/AuthProvider';
import { hasPrivilegedRole } from './ProtectedRoute';

const LayoutWrapper: React.FC = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (hasPrivilegedRole(user?.role)) {
    return <Navigate to="/users" replace />;
  }
  return <Navigate to="/profile" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/" element={<RootRedirect />} />

          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<PrivilegedRoute />}>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/clients" element={<ClientsBusinessesPage />} />
            <Route path="/businesses" element={<ClientsBusinessesPage />} />
            <Route path="/areas" element={<AreasPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/presales" element={<PresalesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};