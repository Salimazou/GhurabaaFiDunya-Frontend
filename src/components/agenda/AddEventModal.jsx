import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addHours, parseISO } from 'date-fns';
import { XMarkIcon, BellIcon, UserPlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const AddEventModal = ({ onClose, onAddEvent, userId }) => {
  const now = new Date();
  const oneHourLater = addHours(now, 1);
  
  // Format current date and time for input default values
  const formatDateTimeForInput = (date) => {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: formatDateTimeForInput(now),
    endTime: formatDateTimeForInput(oneHourLater),
    category: 'quran',
    userId: userId,
    isRecurring: false,
    recurrencePattern: 'daily',
    recurrenceEndDate: format(addHours(now, 24 * 30), "yyyy-MM-dd"),
    notifyBefore: 15, // minutes
    enableNotification: false,
    isShared: false,
    sharedWith: []
  });
  
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [showNotificationOptions, setShowNotificationOptions] = useState(false);
  const [showSharingOptions, setShowSharingOptions] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };
  
  const handleAddShare = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      return;
    }
    
    if (!formData.sharedWith.includes(inviteEmail)) {
      setFormData(prev => ({
        ...prev,
        isShared: true,
        sharedWith: [...prev.sharedWith, inviteEmail]
      }));
      setInviteEmail('');
    }
  };
  
  const handleRemoveShare = (email) => {
    setFormData(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.filter(e => e !== email),
      isShared: prev.sharedWith.filter(e => e !== email).length > 0
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    
    if (endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }
    
    // Create event(s)
    if (formData.isRecurring) {
      // If recurring, generate a series of events
      generateRecurringEvents(formData);
    } else {
      // Add single event
      onAddEvent(formData);
    }
  };
  
  const generateRecurringEvents = (baseEvent) => {
    // Start with the first occurrence
    const events = [baseEvent];
    
    const startDate = new Date(baseEvent.startTime);
    const endDate = new Date(baseEvent.endTime);
    const duration = endDate - startDate; // event duration in ms
    const recurrenceEndDate = new Date(baseEvent.recurrenceEndDate);
    
    let currentDate = new Date(startDate);
    
    // Generate subsequent occurrences
    while (true) {
      // Move to next occurrence based on pattern
      if (baseEvent.recurrencePattern === 'daily') {
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      } else if (baseEvent.recurrencePattern === 'weekly') {
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
      } else if (baseEvent.recurrencePattern === 'monthly') {
        currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      }
      
      // Stop if we've reached the end date
      if (currentDate > recurrenceEndDate) {
        break;
      }
      
      // Create a new event instance
      const nextStartTime = new Date(currentDate);
      const nextEndTime = new Date(nextStartTime.getTime() + duration);
      
      events.push({
        ...baseEvent,
        startTime: nextStartTime.toISOString(),
        endTime: nextEndTime.toISOString(),
        id: Date.now() + '-' + events.length, // Ensure unique ID
        isRecurringInstance: true,
        originalEventId: baseEvent.id || Date.now().toString()
      });
    }
    
    // Add all events
    events.forEach(event => {
      onAddEvent(event);
    });
  };
  
  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Toggle advanced option sections
  const toggleSection = (section) => {
    if (section === 'recurring') {
      setShowRecurringOptions(!showRecurringOptions);
      if (!showRecurringOptions) {
        setFormData(prev => ({ ...prev, isRecurring: true }));
      }
    } else if (section === 'notification') {
      setShowNotificationOptions(!showNotificationOptions);
      if (!showNotificationOptions) {
        setFormData(prev => ({ ...prev, enableNotification: true }));
      }
    } else if (section === 'sharing') {
      setShowSharingOptions(!showSharingOptions);
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-md w-full overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-medium">Add New Event</h2>
            <button 
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={onClose}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                placeholder="Event title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                placeholder="Event description"
                rows="3"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              >
                <option value="quran">Quran Study</option>
                <option value="prayer">Prayer</option>
                <option value="meeting">Meeting</option>
                <option value="reminder">Reminder</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Advanced Options */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col gap-2">
                {/* Recurring Option Button */}
                <button
                  type="button"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm
                    ${formData.isRecurring ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-700'}
                  `}
                  onClick={() => toggleSection('recurring')}
                >
                  <div className="flex items-center">
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    <span>Recurring Event</span>
                  </div>
                  <div className={`text-xs ${formData.isRecurring ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {formData.isRecurring ? 'Enabled' : 'Disabled'}
                  </div>
                </button>
                
                {/* Recurring Options */}
                {showRecurringOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-4 ml-2 border-l-2 border-slate-200 dark:border-slate-700 space-y-3 py-2"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="isRecurring" className="text-sm">Enable recurring event</label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Recurrence Pattern</label>
                      <select
                        name="recurrencePattern"
                        value={formData.recurrencePattern}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                        disabled={!formData.isRecurring}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input
                        type="date"
                        name="recurrenceEndDate"
                        value={formData.recurrenceEndDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                        disabled={!formData.isRecurring}
                      />
                    </div>
                  </motion.div>
                )}
                
                {/* Notification Option Button */}
                <button
                  type="button"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm
                    ${formData.enableNotification ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'bg-slate-50 dark:bg-slate-700'}
                  `}
                  onClick={() => toggleSection('notification')}
                >
                  <div className="flex items-center">
                    <BellIcon className="h-4 w-4 mr-2" />
                    <span>Notifications</span>
                  </div>
                  <div className={`text-xs ${formData.enableNotification ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {formData.enableNotification ? 'Enabled' : 'Disabled'}
                  </div>
                </button>
                
                {/* Notification Options */}
                {showNotificationOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-4 ml-2 border-l-2 border-slate-200 dark:border-slate-700 space-y-3 py-2"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableNotification"
                        name="enableNotification"
                        checked={formData.enableNotification}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="enableNotification" className="text-sm">Enable notifications</label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Notify Before</label>
                      <select
                        name="notifyBefore"
                        value={formData.notifyBefore}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                        disabled={!formData.enableNotification}
                      >
                        <option value="5">5 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="1440">1 day</option>
                      </select>
                    </div>
                  </motion.div>
                )}
                
                {/* Sharing Option Button */}
                <button
                  type="button"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm
                    ${formData.isShared ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'bg-slate-50 dark:bg-slate-700'}
                  `}
                  onClick={() => toggleSection('sharing')}
                >
                  <div className="flex items-center">
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    <span>Share Event</span>
                  </div>
                  <div className={`text-xs ${formData.isShared ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {formData.sharedWith.length > 0 ? `Shared with ${formData.sharedWith.length}` : 'Not shared'}
                  </div>
                </button>
                
                {/* Sharing Options */}
                {showSharingOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-4 ml-2 border-l-2 border-slate-200 dark:border-slate-700 space-y-3 py-2"
                  >
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Share with others</label>
                      
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="Email address"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddShare}
                          className="px-3 py-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 rounded-lg text-sm"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Shared users list */}
                      {formData.sharedWith.length > 0 && (
                        <div className="mt-2">
                          <label className="text-sm font-medium mb-1">Shared with:</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.sharedWith.map((email, index) => (
                              <div 
                                key={index}
                                className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs flex items-center"
                              >
                                {email}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveShare(email)}
                                  className="ml-2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                onClick={onClose}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Add Event
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddEventModal; 