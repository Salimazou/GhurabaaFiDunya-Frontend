import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const { adminUser, loading, error } = useAdminAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  // Redirect to dashboard if user doesn't have admin access
  if (!adminUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 md:ml-64 relative overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </ThemeProvider>
  );
} 