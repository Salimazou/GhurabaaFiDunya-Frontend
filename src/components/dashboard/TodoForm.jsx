import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function TodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(0); // 0 = Low, 1 = Medium, 2 = High
  const [dueDate, setDueDate] = useState('');
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const newTodo = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      isCompleted: false
    };
    
    onAddTodo(newTodo);
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority(0);
    setDueDate('');
    setIsFormExpanded(false);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Voeg een nieuwe taak toe..."
            className="w-full px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            onFocus={() => setIsFormExpanded(true)}
          />
        </div>
        
        {isFormExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Beschrijving
              </label>
              <textarea
                id="description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Beschrijf uw taak (optioneel)"
              ></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="mb-4 sm:mb-0 sm:w-1/2">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Prioriteit
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full px-4 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={0}>Laag</option>
                  <option value={1}>Middel</option>
                  <option value={2}>Hoog</option>
                </select>
              </div>
              
              <div className="sm:w-1/2">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>Deadline</span>
                  </div>
                </label>
                <input
                  id="dueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </motion.div>
        )}
        
        <div className={`flex justify-end mt-${isFormExpanded ? '6' : '0'}`}>
          {isFormExpanded && (
            <button
              type="button"
              onClick={() => setIsFormExpanded(false)}
              className="px-4 py-2 mr-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Annuleren
            </button>
          )}
          
          <button
            type="submit"
            disabled={!title.trim()}
            className={`
              px-6 py-2 rounded-lg text-white font-medium
              ${!title.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}
              transition duration-200
            `}
          >
            Toevoegen
          </button>
        </div>
      </form>
    </motion.div>
  );
} 