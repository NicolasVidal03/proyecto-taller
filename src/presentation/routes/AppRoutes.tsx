import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import {
  LoginPage,
  ProductsPage,
  SuppliersPage,
  InventoryPage,
  UsersPage,
  ProfilePage,
  ActivitiesPage,
} from '../pages';

import ClientsBusinessesPage from '../pages/ClientsBusinessesPage';
import AreasPage from '../pages/AreasPage';
import RoutesPage from '../pages/RoutesPage';

const LayoutWrapper: React.FC = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/clients" element={<ClientsBusinessesPage />} />
          <Route path="/businesses" element={<ClientsBusinessesPage />} />
          <Route path="/areas" element={<AreasPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
};
