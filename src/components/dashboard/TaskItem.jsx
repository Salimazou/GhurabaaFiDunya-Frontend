import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckIcon, 
  TrashIcon, 
  PencilIcon, 
  ClockIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  TagIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

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

// Check if a todo is overdue
const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

// Get category color
const getCategoryColor = (category) => {
  const categoryColors = {
    "werk": "bg-blue-100 text-blue-800",
    "persoonlijk": "bg-purple-100 text-purple-800",
    "familie": "bg-pink-100 text-pink-800",
    "studie": "bg-indigo-100 text-indigo-800",
    "gezondheid": "bg-green-100 text-green-800",
    "financiën": "bg-amber-100 text-amber-800",
    "huis": "bg-orange-100 text-orange-800",
    "worship": "bg-teal-100 text-teal-800"
  };
  
  return categoryColors[category?.toLowerCase()] || "bg-gray-100 text-gray-800";
};

// Get priority class
const getPriorityClass = (priority) => {
  switch (priority) {
    case 2: return "border-red-500 bg-red-50";
    case 1: return "border-amber-500 bg-amber-50";
    default: return "border-emerald-500 bg-emerald-50";
  }
};

const getPriorityText = (priority) => {
  switch (priority) {
    case 2: return "Hoog";
    case 1: return "Middel"; 
    default: return "Laag";
  }
};

export default function TaskItem({ 
  todo, 
  onComplete, 
  onDelete, 
  onUpdate, 
  index, 
  isCompleted = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description || "");
  const titleInputRef = useRef(null);
  
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);
  
  const handleToggleExpand = () => {
    if (!isCompleted) {
      setIsExpanded(!isExpanded);
    }
  };
  
  const handleStartEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  
  const handleSaveEdit = (e) => {
    e.preventDefault();
    
    if (editedTitle.trim()) {
      onUpdate(todo.id, {
        ...todo,
        title: editedTitle.trim(),
        description: editedDescription.trim()
      });
      setIsEditing(false);
    }
  };
  
  const handleComplete = (e) => {
    e.stopPropagation();
    onComplete(todo.id);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(todo.id);
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30, 
        mass: 1,
        delay: index * 0.05
      }}
      className={`relative rounded-lg overflow-hidden shadow-sm bg-white border-l-4 ${
        isCompleted ? "border-gray-200 opacity-75" : getPriorityClass(todo.priority)
      }`}
    >
      {/* Main content */}
      <div 
        className={`py-3 px-4 cursor-pointer transition-colors ${
          !isCompleted && !isEditing ? "hover:bg-gray-50" : ""
        }`}
        onClick={handleToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1 min-w-0 mr-2">
            {/* Completion Toggle Button */}
            {isCompleted ? (
              <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5 hover:border-emerald-500 transition-colors"
                aria-label="Mark as completed"
              />
            )}
            
            {/* Title and Details */}
            <div className="ml-3 flex-1 min-w-0">
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-2">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Taak titel"
                    required
                    onClick={e => e.stopPropagation()}
                  />
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Beschrijving (optioneel)"
                    rows={2}
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(false);
                        setEditedTitle(todo.title);
                        setEditedDescription(todo.description || "");
                      }}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 mr-2"
                    >
                      Annuleren
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors"
                    >
                      Opslaan
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h3 className={`text-sm font-medium ${isCompleted ? "line-through text-gray-500" : "text-gray-900"}`}>
                    {todo.title}
                  </h3>
                  
                  {/* Task metadata */}
                  <div className="flex flex-wrap items-center mt-1 space-x-2">
                    {/* Due date */}
                    {todo.dueDate && (
                      <div className={`flex items-center text-xs ${
                        isOverdue(todo.dueDate) && !isCompleted 
                          ? "text-red-600" 
                          : "text-gray-500"
                      }`}>
                        {isOverdue(todo.dueDate) && !isCompleted ? (
                          <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ClockIcon className="h-3 w-3 mr-1" />
                        )}
                        <span>
                          {isOverdue(todo.dueDate) && !isCompleted ? "Te laat: " : ""}
                          {formatDate(todo.dueDate)}
                        </span>
                      </div>
                    )}
                    
                    {/* Category tag */}
                    {todo.category && (
                      <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded ${getCategoryColor(todo.category)}`}>
                        <TagIcon className="h-3 w-3 mr-1" />
                        {todo.category}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          {!isEditing && !isCompleted && (
            <div className="flex items-center space-x-0.5">
              <button
                type="button"
                onClick={handleStartEdit}
                className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                aria-label="Edit task"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                aria-label="Delete task"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              
              {!isCompleted && (
                <button
                  type="button"
                  onClick={handleToggleExpand}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          )}
          
          {/* Simple delete button for completed tasks */}
          {isCompleted && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
              aria-label="Delete task"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Expanded content */}
        {isExpanded && !isEditing && !isCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pl-8"
          >
            {todo.description ? (
              <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                {todo.description}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic mb-2">
                Geen beschrijving
              </p>
            )}
            
            {todo.dueDate && (
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                <span>
                  Deadline: {formatDate(todo.dueDate)}
                </span>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Prioriteit: <span className="font-medium">{getPriorityText(todo.priority)}</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 