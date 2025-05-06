import React from 'react';
import { AnimatedCard, Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAdminAuth } from '../context/AdminAuthContext';
import Header from '../components/layout/Header';

export default function AdminDashboard() {
  const { adminUser } = useAdminAuth();

  return (
    <div className="p-6">
      <Header title="Admin Dashboard" breadcrumbs={['Home', 'Dashboard']} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <AnimatedCard 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardHeader>
            <CardTitle>Welcome, {adminUser?.firstName || adminUser?.username || 'Admin'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              You are logged in with {adminUser?.roles?.[0] || 'Admin'} privileges.
            </p>
          </CardContent>
        </AnimatedCard>
        
        <AnimatedCard 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              View application statistics and analytics.
            </p>
          </CardContent>
        </AnimatedCard>
        
        <AnimatedCard 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              No recent activity to display.
            </p>
          </CardContent>
        </AnimatedCard>
      </div>
    </div>
  );
} 