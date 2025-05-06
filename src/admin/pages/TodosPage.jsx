import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCard, Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Header from '../components/layout/Header';
import { todoAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  TrashIcon,
  PencilIcon,
  FlagIcon,
  ArrowPathIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function TodosPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAdminAuth();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load all todos
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        // Use the real API endpoint to get all todos
        const data = await todoAPI.getAllTodos();
        setTodos(data);
      } catch (error) {
        console.error('Failed to fetch todos:', error);
        toast.error('Failed to load todos');
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  // Filter todos based on filter and search term
  const filteredTodos = todos.filter(todo => {
    // Apply filter
    if (filter === 'completed' && !todo.isCompleted) return false;
    if (filter === 'active' && todo.isCompleted) return false;
    if (filter === 'high' && todo.priority !== 3) return false;
    if (filter === 'medium' && todo.priority !== 2) return false;
    if (filter === 'low' && todo.priority !== 1) return false;
    
    if (filter !== 'all' && filter !== 'completed' && filter !== 'active' && 
        filter !== 'high' && filter !== 'medium' && filter !== 'low') {
      // Filter by category
      if (todo.category?.toLowerCase() !== filter.toLowerCase()) return false;
    }

    // Apply search
    const searchTermLower = searchTerm.toLowerCase();
    return (
      todo.title?.toLowerCase().includes(searchTermLower) ||
      todo.description?.toLowerCase().includes(searchTermLower) ||
      todo.username?.toLowerCase().includes(searchTermLower) ||
      todo.category?.toLowerCase().includes(searchTermLower)
    );
  });

  // Get all unique categories
  const categories = [...new Set(todos
    .filter(todo => todo.category)
    .map(todo => todo.category.toLowerCase())
  )];

  const handleDeleteTodo = async (todoId) => {
    try {
      if (window.confirm('Are you sure you want to delete this todo?')) {
        await todoAPI.deleteTodo(todoId);
        setTodos(todos.filter(todo => todo.id !== todoId));
        toast.success('Todo deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast.error('Failed to delete todo');
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const updatedTodo = await todoAPI.completeTodo(todo.id);
      setTodos(todos.map(t => (t.id === updatedTodo.id ? updatedTodo : t)));
      toast.success(`Todo marked as ${todo.isCompleted ? 'incomplete' : 'complete'}`);
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error('Failed to update todo status');
    }
  };

  const handleEditTodo = (todo) => {
    setSelectedTodo(todo);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTodo(null);
    setIsEditModalOpen(false);
  };

  const handleSaveTodo = async () => {
    try {
      const formData = {
        title: document.getElementById('todo-title').value,
        description: document.getElementById('todo-description').value,
        priority: parseInt(document.getElementById('todo-priority').value),
        isCompleted: document.getElementById('todo-status').value === 'completed',
        category: document.getElementById('todo-category')?.value || selectedTodo.category,
        dueDate: document.getElementById('todo-duedate').value ? new Date(document.getElementById('todo-duedate').value).toISOString() : null
      };

      const updatedTodo = await todoAPI.updateTodo(selectedTodo.id, formData);
      setTodos(todos.map(t => (t.id === updatedTodo.id ? updatedTodo : t)));
      toast.success('Todo updated successfully');
      handleCloseModal();
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error('Failed to update todo');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 3:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">High</span>;
      case 2:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Medium</span>;
      case 1:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Low</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">None</span>;
    }
  };

  return (
    <div className="p-6">
      <Header title="Todo Management" breadcrumbs={['Admin', 'Todos']} />

      {/* Filters and search */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'active' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button 
            variant={filter === 'completed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
          <Button 
            variant={filter === 'high' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('high')}
          >
            High Priority
          </Button>
          {categories.map(category => (
            <Button 
              key={category}
              variant={filter === category ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search todos..."
            className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Todos list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo, index) => (
              <motion.div 
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card variant={todo.isCompleted ? 'outline' : 'default'} className="overflow-hidden">
                  <div className="flex items-start p-4">
                    <div className="mr-4">
                      <button
                        onClick={() => handleToggleComplete(todo)}
                        className={`h-6 w-6 rounded-full flex items-center justify-center ${
                          todo.isCompleted 
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' 
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {todo.isCompleted ? <CheckCircleIcon className="h-5 w-5" /> : null}
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <h3 className={`text-lg font-medium ${todo.isCompleted ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                          {todo.title}
                        </h3>
                        <div className="flex items-center mt-2 sm:mt-0 space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            <UserIcon className="h-3 w-3 mr-1" />
                            {todo.username}
                          </span>
                          {getPriorityBadge(todo.priority)}
                          {todo.category && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                              {todo.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {todo.description && (
                        <p className={`mt-1 text-sm ${todo.isCompleted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                          {todo.description}
                        </p>
                      )}
                      
                      <div className="mt-3 flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                        {todo.dueDate && (
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Due: {formatDate(todo.dueDate)}
                          </div>
                        )}
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Created: {formatDate(todo.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex items-start space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditTodo(todo)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No todos found matching your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Todo Modal */}
      {isEditModalOpen && selectedTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AnimatedCard 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4"
          >
            <CardHeader>
              <CardTitle>Edit Todo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    id="todo-title"
                    type="text"
                    defaultValue={selectedTodo.title}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="todo-description"
                    defaultValue={selectedTodo.description || ''}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <select
                      id="todo-priority"
                      defaultValue={selectedTodo.priority}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800"
                    >
                      <option value={1}>Low</option>
                      <option value={2}>Medium</option>
                      <option value={3}>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      id="todo-status"
                      defaultValue={selectedTodo.isCompleted ? "completed" : "active"}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <input
                    id="todo-category"
                    type="text"
                    defaultValue={selectedTodo.category || ''}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Date
                  </label>
                  <input
                    id="todo-duedate"
                    type="date"
                    defaultValue={selectedTodo.dueDate ? new Date(selectedTodo.dueDate).toISOString().split('T')[0] : ''}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button variant="success" onClick={handleSaveTodo}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
} 