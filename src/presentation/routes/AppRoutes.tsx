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
} from '../pages';

import { ClientsPage } from '../pages/ClientsPage';
import { NewClientPage } from '../pages/NewClientPage';
import { EditClientPage } from '../pages/EditClientPage';
import AreasPage from '../pages/areas/AreasPage';

const LayoutWrapper: React.FC = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes con layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/new" element={<NewClientPage />} />
          <Route path="/clients/edit/:id" element={<EditClientPage />} />
          <Route path="/areas" element={<AreasPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
};
