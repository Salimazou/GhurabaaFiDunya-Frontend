import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import TaskItem from './TaskItem';

export default function EnhancedTodoList({ 
  todos, 
  onUpdateTodo, 
  onCompleteTodo, 
  onDeleteTodo,
  onAddTodo 
}) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [showFilters, setShowFilters] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 0,
    category: '',
    dueDate: ''
  });
  
  const titleInputRef = useRef(null);
  
  // Group and filter todos
  const completedTodos = todos.filter(todo => todo.isCompleted);
  const activeTodos = todos.filter(todo => !todo.isCompleted);
  
  // Apply filters
  const filteredTodos = (() => {
    let filtered = [...activeTodos];
    
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(todo => {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
    } else if (filter === 'week') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      filtered = filtered.filter(todo => {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        return dueDate >= today && dueDate <= nextWeek;
      });
    } else if (filter === 'overdue') {
      const now = new Date();
      
      filtered = filtered.filter(todo => {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        return dueDate < now;
      });
    } else if (filter !== 'all' && filter !== 'completed') {
      // Filter by category
      filtered = filtered.filter(todo => 
        todo.category && todo.category.toLowerCase() === filter.toLowerCase()
      );
    }
    
    return filtered;
  })();
  
  // Apply sorting
  const sortedTodos = (() => {
    const sorted = [...filteredTodos];
    
    if (sortBy === 'priority') {
      return sorted.sort((a, b) => b.priority - a.priority);
    } else if (sortBy === 'dueDate') {
      return sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sortBy === 'alphabetical') {
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'created') {
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return sorted;
  })();
  
  // Get all unique categories
  const categories = [...new Set(todos
    .filter(todo => todo.category)
    .map(todo => todo.category.toLowerCase())
  )];
  
  // Handle add new task
  const handleAddTask = (e) => {
    e.preventDefault();
    
    if (newTask.title.trim()) {
      onAddTodo({
        ...newTask,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: Number(newTask.priority)
      });
      
      setNewTask({
        title: '',
        description: '',
        priority: 0,
        category: '',
        dueDate: ''
      });
      
      setNewTaskOpen(false);
    }
  };
  
  // Toggle new task form
  const toggleNewTaskForm = () => {
    setNewTaskOpen(!newTaskOpen);
    
    if (!newTaskOpen) {
      // Focus on title input when form opens
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-5 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Mijn Taken</h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-emerald-600 rounded-full transition-colors"
              aria-label="Filter taken"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={toggleNewTaskForm}
              className="bg-white text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center transition-colors"
              aria-label="Nieuwe taak toevoegen"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Nieuwe Taak</span>
            </button>
          </div>
        </div>
        
        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-emerald-800 bg-opacity-30 rounded-lg p-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-emerald-100 text-sm mb-1">
                    Filter op
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1 rounded-full text-xs ${
                        filter === 'all' 
                          ? 'bg-white text-emerald-800 font-medium' 
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      Alle
                    </button>
                    <button
                      onClick={() => setFilter('today')}
                      className={`px-3 py-1 rounded-full text-xs ${
                        filter === 'today' 
                          ? 'bg-white text-emerald-800 font-medium' 
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      Vandaag
                    </button>
                    <button
                      onClick={() => setFilter('week')}
                      className={`px-3 py-1 rounded-full text-xs ${
                        filter === 'week' 
                          ? 'bg-white text-emerald-800 font-medium' 
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      Deze Week
                    </button>
                    <button
                      onClick={() => setFilter('overdue')}
                      className={`px-3 py-1 rounded-full text-xs ${
                        filter === 'overdue' 
                          ? 'bg-white text-emerald-800 font-medium' 
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      Te Laat
                    </button>
                    <button
                      onClick={() => setFilter('completed')}
                      className={`px-3 py-1 rounded-full text-xs ${
                        filter === 'completed' 
                          ? 'bg-white text-emerald-800 font-medium' 
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      Voltooid
                    </button>
                  </div>
                  
                  {/* Categories */}
                  {categories.length > 0 && (
                    <div className="mt-2">
                      <label className="block text-emerald-100 text-xs mb-1">
                        Categorieën
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                          <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={`px-3 py-1 rounded-full text-xs ${
                              filter === category 
                                ? 'bg-white text-emerald-800 font-medium' 
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-emerald-100 text-sm mb-1">
                    Sorteren
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSortBy('priority')}
                      className={`px-3 py-1 rounded-full text-xs ${
                        sortBy === 'priority' 
                          ? 'bg-white text-emerald-800 font-medium' 
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      Prioriteit
                    </button>
                    <button
                      onClick={() => setSortBy('dueDate')}
                      className={`px-3 py-1 rounded-full text-xs ${
                        sortBy === 'dueDate' 
                          ? 'bg-white text-emerald-800 font-medium' 
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      Deadline
                    </button>
                    <button
                      onClick={() => setSortBy('alphabetical')}
                      className={`px-3 py-1 rounded-full text-xs ${
                        sortBy === 'alphabetical' 
                          ? 'bg-white text-emerald-800 font-medium' 
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      Alfabetisch
                    </button>
                    <button
                      onClick={() => setSortBy('created')}
                      className={`px-3 py-1 rounded-full text-xs ${
                        sortBy === 'created' 
                          ? 'bg-white text-emerald-800 font-medium' 
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      Laatst Toegevoegd
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* New Task Form */}
      <AnimatePresence>
        {newTaskOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-200"
          >
            <form onSubmit={handleAddTask} className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-800">Nieuwe Taak</h3>
                <button
                  type="button"
                  onClick={toggleNewTaskForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Taak titel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Beschrijving (optioneel)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Prioriteit</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="0">Laag</option>
                      <option value="1">Middel</option>
                      <option value="2">Hoog</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Categorie</label>
                    <input
                      type="text"
                      value={newTask.category}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                      placeholder="bijv. Werk, Familie"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      list="categories"
                    />
                    {categories.length > 0 && (
                      <datalist id="categories">
                        {categories.map(category => (
                          <option key={category} value={category} />
                        ))}
                      </datalist>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Deadline</label>
                    <input
                      type="datetime-local"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Taak Toevoegen
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Todo lists */}
      <div className="max-h-[60vh] overflow-y-auto p-4">
        {/* Filtered list indicator */}
        {filter !== 'all' && (
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="text-sm text-gray-600">
              Gefilterd op: <span className="font-medium text-emerald-700 capitalize">{filter}</span>
            </div>
            <button
              onClick={() => setFilter('all')}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center"
            >
              <XMarkIcon className="h-3 w-3 mr-1" />
              Filter wissen
            </button>
          </div>
        )}
        
        {/* Active todos section */}
        {filter !== 'completed' && (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {sortedTodos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 px-4"
                >
                  <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-full mb-3">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="text-gray-800 font-medium mb-1">Alle taken voltooid</h3>
                  <p className="text-gray-500 text-sm">
                    Je hebt momenteel geen actieve taken
                    {filter !== 'all' ? ' met deze filter' : ''}
                  </p>
                </motion.div>
              ) : (
                sortedTodos.map((todo, index) => (
                  <TaskItem
                    key={todo.id}
                    todo={todo}
                    index={index}
                    onComplete={onCompleteTodo}
                    onDelete={onDeleteTodo}
                    onUpdate={onUpdateTodo}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        )}
        
        {/* Completed todos section */}
        {(filter === 'all' || filter === 'completed') && completedTodos.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Voltooide Taken ({completedTodos.length})
              </h3>
              <ChevronDownIcon className="h-4 w-4 text-gray-400 ml-1" />
            </div>
            
            <div className="space-y-2 opacity-75">
              <AnimatePresence initial={false}>
                {completedTodos.slice(0, 5).map((todo, index) => (
                  <TaskItem
                    key={todo.id}
                    todo={todo}
                    index={index}
                    onDelete={onDeleteTodo}
                    onUpdate={onUpdateTodo}
                    isCompleted={true}
                  />
                ))}
              </AnimatePresence>
              
              {completedTodos.length > 5 && (
                <div className="text-center pt-2">
                  <button className="text-xs text-emerald-600 hover:text-emerald-700">
                    Toon {completedTodos.length - 5} meer voltooide taken
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Stats footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap justify-between text-sm gap-y-2">
          <div className="text-gray-500">
            <span className="font-medium text-gray-700">{activeTodos.length}</span> actieve taken
          </div>
          <div className="text-gray-500">
            <span className="font-medium text-emerald-700">{completedTodos.length}</span> voltooide taken
          </div>
          <div className="text-gray-500">
            <span className="font-medium text-gray-700">{todos.length}</span> taken totaal
          </div>
        </div>
      </div>
    </div>
  );
} 