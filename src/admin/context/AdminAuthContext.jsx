import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

// Define user roles and their hierarchy
export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer'
};

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.EDITOR]: 2,
  [ROLES.VIEWER]: 1
};

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user has admin access on mount
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // This would be replaced with a specific admin check endpoint
        const userData = await authAPI.getCurrentUser();
        
        // Check if user has any admin role
        if (userData && userData.roles && userData.roles.some(role => 
          [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER].includes(role)
        )) {
          setAdminUser(userData);
        }
      } catch (err) {
        console.error('Admin authentication check failed:', err);
        setError('Toegang geweigerd tot admin portal');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  // Check if user has required permission level
  const hasPermission = (requiredRole) => {
    if (!adminUser || !adminUser.roles) return false;
    
    const userHighestRole = adminUser.roles.reduce((highest, role) => {
      const roleValue = ROLE_HIERARCHY[role] || 0;
      return roleValue > highest ? roleValue : highest;
    }, 0);
    
    const requiredValue = ROLE_HIERARCHY[requiredRole] || 0;
    return userHighestRole >= requiredValue;
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!adminUser || !adminUser.roles) return false;
    return adminUser.roles.includes(role);
  };

  // Logout function
  const logoutAdmin = () => {
    // This only logs out of admin portal, not the main app
    setAdminUser(null);
    toast.success('Uitgelogd uit admin portal');
  };

  const value = {
    adminUser,
    loading,
    error,
    hasPermission,
    hasRole,
    logoutAdmin,
    isAdminAuthenticated: !!adminUser,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}; 