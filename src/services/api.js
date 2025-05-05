import axios from 'axios';
import config from '../config';
import { quranAPI } from './quranAPI';

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
    const response = await apiClient.get('/auth/me');
    return response.data;
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

// MongoDB connection test
export const mongoAPI = {
  ping: async () => {
    const response = await apiClient.get('/mongodb/ping');
    return response.data;
  },
};

export default {
  auth: authAPI,
  todos: todoAPI,
  mongo: mongoAPI,
  quran: quranAPI
}; 