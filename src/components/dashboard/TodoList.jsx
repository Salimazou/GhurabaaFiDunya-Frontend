import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  PencilIcon, 
  TrashIcon, 
  ChevronUpIcon,
  ChevronDownIcon,
  CalendarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

// Helper to format date in Dutch style
const formatDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get color based on priority
const getPriorityColor = (priority) => {
  switch (priority) {
    case 2: return 'text-red-600';
    case 1: return 'text-amber-500';
    default: return 'text-emerald-600';
  }
};

// Get text based on priority
const getPriorityText = (priority) => {
  switch (priority) {
    case 2: return 'Hoog';
    case 1: return 'Middel';
    default: return 'Laag';
  }
};

// Check if a todo is overdue
const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export default function TodoList({ todos, onUpdateTodo, onCompleteTodo, onDeleteTodo }) {
  const [expandedTodoId, setExpandedTodoId] = useState(null);
  
  // Group todos by completion status
  const completedTodos = todos.filter(todo => todo.isCompleted);
  const activeTodos = todos.filter(todo => !todo.isCompleted);
  
  // Sort active todos by priority (high to low) and then by due date
  const sortedActiveTodos = [...activeTodos].sort((a, b) => {
    // First by priority (high to low)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    
    // Then by due date (soonest first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (a.dueDate) {
      return -1;
    } else if (b.dueDate) {
      return 1;
    }
    
    // Finally by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  const toggleExpand = (id) => {
    setExpandedTodoId(expandedTodoId === id ? null : id);
  };
  
  const todoItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };
  
  return (
    <div className="space-y-8">
      {/* Active Todos */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Actieve Taken ({sortedActiveTodos.length})
        </h3>

        <AnimatePresence>
          {sortedActiveTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-lg p-4 text-center text-gray-600"
            >
              Geen actieve taken. Goed gedaan!
            </motion.div>
          ) : (
            <div className="space-y-3">
              {sortedActiveTodos.map((todo, index) => (
                <motion.div
                  key={todo.id}
                  custom={index}
                  variants={todoItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`bg-white rounded-lg shadow-sm overflow-hidden 
                    ${isOverdue(todo.dueDate) && !todo.isCompleted ? 'border-l-4 border-red-500' : ''}`}
                >
                  {/* Todo Header */}
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex items-start flex-1 min-w-0">
                      <button
                        onClick={() => onCompleteTodo(todo.id)}
                        className="flex-shrink-0 h-5 w-5 mt-0.5 rounded-full border-2 border-gray-300 hover:border-emerald-500 transition-colors"
                        aria-label="Mark as completed"
                      />
                      
                      <div className="ml-3 flex-1 min-w-0" onClick={() => toggleExpand(todo.id)}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium text-gray-900 truncate">{todo.title}</h4>
                          
                          <div className="flex items-center ml-2">
                            {/* Priority indicator */}
                            <span className={`flex-shrink-0 ${getPriorityColor(todo.priority)} text-xs font-medium mr-2`}>
                              {getPriorityText(todo.priority)}
                            </span>
                            
                            {/* Expand/collapse indicator */}
                            {expandedTodoId === todo.id ? (
                              <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        {/* Due date */}
                        {todo.dueDate && (
                          <div className={`flex items-center mt-1 text-xs ${
                            isOverdue(todo.dueDate) && !todo.isCompleted ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {isOverdue(todo.dueDate) && !todo.isCompleted ? (
                              <ExclamationCircleIcon className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                            )}
                            <span>
                              {isOverdue(todo.dueDate) && !todo.isCompleted ? 'Te laat: ' : ''}
                              {formatDate(todo.dueDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedTodoId === todo.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 pb-4 pt-2">
                        {todo.description ? (
                          <p className="text-sm text-gray-600 mb-4">{todo.description}</p>
                        ) : (
                          <p className="text-sm text-gray-400 italic mb-4">Geen beschrijving</p>
                        )}
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => onDeleteTodo(todo.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              // In a real app, you might want to open an edit form
                              alert('Edit functionality would be implemented here');
                            }}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </section>
      
      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Voltooide Taken ({completedTodos.length})
          </h3>
          
          <div className="space-y-2">
            {completedTodos.map((todo, index) => (
              <motion.div
                key={todo.id}
                custom={index}
                variants={todoItemVariants}
                initial="hidden"
                animate="visible"
                className="bg-gray-50 rounded-lg p-3 flex items-center"
              >
                <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-3" />
                <span className="text-gray-500 line-through truncate flex-1">
                  {todo.title}
                </span>
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 