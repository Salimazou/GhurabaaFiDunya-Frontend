import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/auth/AuthContext'
import { AdminAuthProvider } from './admin/context/AdminAuthContext'
import { MemorizationProvider } from './context/MemorizationContext'
import LoginPage from './components/auth/LoginPage'
import Dashboard from './components/dashboard/Dashboard'
import AdminLayout from './admin/components/layout/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import UsersPage from './admin/pages/UsersPage'
import TodosPage from './admin/pages/TodosPage'
import MemorizationSetup from './components/quran/MemorizationSetup'
import './App.css'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-700"></div>
      </div>
    )
  }
  
  // We need to be more careful with redirects to avoid loops
  if (!isAuthenticated) {
    // Make sure we're not already on the login page
    if (window.location.pathname !== '/login') {
      return <Navigate to="/login" replace />
    }
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <MemorizationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              {/* Main application routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Quran routes */}
              <Route
                path="/quran/memorize"
                element={
                  <ProtectedRoute>
                    <MemorizationSetup />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="todos" element={<TodosPage />} />
                <Route path="statistics" element={<div>Statistics Dashboard</div>} />
                <Route path="content" element={<div>Content Management</div>} />
                <Route path="permissions" element={<div>Permissions Management</div>} />
                <Route path="settings" element={<div>Admin Settings</div>} />
              </Route>
              
              <Route 
                path="/" 
                element={<Navigate to="/dashboard" replace />} 
              />
            </Routes>
          </Router>
        </MemorizationProvider>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App
