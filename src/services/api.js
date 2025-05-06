import axios from 'axios';
import config from '../config';
import { quranAPI } from './quranAPI';
import { toast } from 'react-hot-toast';

// Use API URL from configuration
const API_URL = config.apiUrl;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Prevent redirect loops
let isRedirecting = false;

// List of API paths that should handle 401 errors silently (no redirect)
const silentAuthPaths = [
  '/memorizationplans',
  '/stats'
];

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle expired tokens or unauthorized access
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const isLoginOrRegister = 
        error.config.url.includes('/auth/login') || 
        error.config.url.includes('/auth/register');
      
      // Check if this is a path we should handle silently
      const isSilentPath = silentAuthPaths.some(path => 
        error.config.url.includes(path)
      );
      
      // Don't show token expiration message for login/register endpoints or silent paths
      if (!isLoginOrRegister && !isSilentPath) {
        // Only clear token on 401 (unauthorized) not on 403 (forbidden)
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          toast.error('Je sessie is verlopen. Log opnieuw in.', { id: 'session-expired' });
          
          // Redirect to login page, but only if not already redirecting
          if (!isRedirecting) {
            isRedirecting = true;
            setTimeout(() => {
              window.location.href = '/login';
              // Reset the flag after a delay to prevent potential issues
              setTimeout(() => {
                isRedirecting = false;
              }, 2000);
            }, 100);
          }
        } else {
          toast.error('Je hebt geen toegang tot deze functie.', { id: 'forbidden-access' });
        }
      } else if (error.response.status === 401) {
        // For silent paths, just clear the token without redirecting
        localStorage.removeItem('token');
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    if (response.ok) {
      return await response.json();
    }
    
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  
  return await response.text();
};

// Authentication API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      // If the token is invalid or expired, clear it
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Admin users management
  getAllUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  updateUserRoles: async (userId, roles) => {
    const response = await apiClient.put(`/users/${userId}/roles`, { roles });
    return response.data;
  },

  deleteUser: async (userId) => {
    await apiClient.delete(`/users/${userId}`);
  },
};

// Todo API calls
export const todoAPI = {
  getAllTodos: async () => {
    const response = await apiClient.get('/todos');
    return response.data;
  },
  
  getUserTodos: async (userId) => {
    const response = await apiClient.get(`/todos/user/${userId}`);
    return response.data;
  },
  
  createTodo: async (todoData) => {
    const response = await apiClient.post('/todos', todoData);
    return response.data;
  },
  
  updateTodo: async (id, todoData) => {
    const response = await apiClient.put(`/todos/${id}`, todoData);
    return response.data;
  },
  
  completeTodo: async (id) => {
    const response = await apiClient.patch(`/todos/${id}/complete`);
    return response.data;
  },
  
  deleteTodo: async (id) => {
    await apiClient.delete(`/todos/${id}`);
  },
};

// Memorization Plan API calls
export const memorizationAPI = {
  getCurrentPlan: async () => {
    const response = await apiClient.get('/memorizationplans');
    return response.data;
  },
  
  createPlan: async (planData) => {
    const response = await apiClient.post('/memorizationplans', planData);
    return response.data;
  },
  
  updatePlan: async (id, planData) => {
    const response = await apiClient.put(`/memorizationplans/${id}`, planData);
    return response.data;
  },
  
  updateProgress: async (id, progressData) => {
    const response = await apiClient.put(`/memorizationplans/${id}/progress`, progressData);
    return response.data;
  },
  
  markPageCompleted: async (id) => {
    const response = await apiClient.put(`/memorizationplans/${id}/page-completed`);
    return response.data;
  },
  
  markPageRevised: async (id, pageNumber) => {
    const response = await apiClient.put(`/memorizationplans/${id}/page-revised/${pageNumber}`);
    return response.data;
  },
  
  deletePlan: async (id) => {
    await apiClient.delete(`/memorizationplans/${id}`);
  },
  
  resetPlan: async () => {
    await apiClient.delete('/memorizationplans');
  }
};

// MongoDB API calls (for dashboard data)
export const mongoAPI = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/stats/dashboard');
    return response.data;
  }
};

export default {
  auth: authAPI,
  todos: todoAPI,
  mongo: mongoAPI,
  quran: quranAPI,
  memorization: memorizationAPI
};