import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { 
  PencilIcon, 
  TrashIcon, 
  BookOpenIcon, 
  ClockIcon,
  CalendarIcon,
  BellIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import sharingService from '../../services/SharingService';
import notificationService from '../../services/NotificationService';

const AgendaItem = ({ item, duration, onUpdate, onDelete, view }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isCompleted, setIsCompleted] = useState(item.completed || false);
  const optionsRef = useRef(null);
  
  // Close options when clicking outside
  useEffect(() => {
    if (!showOptions) return;
    
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
        setShowAdvancedOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);
  
  // Style based on category
  const getItemStyle = () => {
    if (isCompleted) {
      return 'bg-gray-100 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600';
    }
    
    switch (item.category) {
      case 'quran':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800';
      case 'prayer':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
      case 'meeting':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800';
      case 'reminder':
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 dark:bg-slate-700/40 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600';
    }
  };
  
  // Icon based on category
  const ItemIcon = () => {
    switch (item.category) {
      case 'quran':
        return <BookOpenIcon className="h-4 w-4" />;
      case 'prayer':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'meeting':
        return <CalendarIcon className="h-4 w-4" />;
      case 'reminder':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };
  
  // Handle item edit
  const handleEdit = () => {
    // In a real implementation, this would show an edit modal
    // For now, simulate with a prompt
    const newTitle = prompt('Edit title:', item.title);
    if (newTitle && newTitle !== item.title) {
      onUpdate({ ...item, title: newTitle });
    }
    setShowOptions(false);
    setShowAdvancedOptions(false);
  };
  
  // Handle item delete
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this item?')) {
      // Cancel any notifications for this event before deleting
      if (item.enableNotification) {
        notificationService.cancelEventNotifications(item.id);
      }
      
      onDelete(item.id);
    }
    setShowOptions(false);
    setShowAdvancedOptions(false);
  };
  
  // Toggle completion status
  const handleToggleComplete = () => {
    setIsCompleted(!isCompleted);
    onUpdate({ ...item, completed: !isCompleted });
  };
  
  // Schedule notification for this event
  const handleScheduleNotification = async () => {
    const permissionGranted = await notificationService.requestPermission();
    
    if (permissionGranted) {
      // Default to 15 minutes before if not specified
      const minutesBefore = item.notifyBefore || 15;
      
      // Schedule the notification
      const notificationId = notificationService.scheduleNotification(
        item, 
        minutesBefore
      );
      
      if (notificationId) {
        // Update the event with notification info
        onUpdate({
          ...item,
          enableNotification: true,
          notifyBefore: minutesBefore,
          notificationId,
        });
        
        alert(`Notification scheduled for ${minutesBefore} minutes before event`);
      } else {
        alert('Unable to schedule notification. The event might be in the past.');
      }
    } else {
      alert('Notification permission not granted');
    }
    
    setShowAdvancedOptions(false);
  };
  
  // Share event via email
  const handleShareEvent = () => {
    // For demo purposes, share with a fixed email
    const demoEmail = prompt('Enter email address to share with:');
    
    if (demoEmail && demoEmail.includes('@')) {
      sharingService.shareEvent(item, [demoEmail])
        .then(result => {
          if (result.success) {
            // Show shareable link
            prompt('Event shared! You can also share this link:', result.shareableLink);
            
            // Update event with shared status
            onUpdate({
              ...item,
              isShared: true,
              sharedWith: [...(item.sharedWith || []), demoEmail],
            });
          } else {
            alert('Failed to share event: ' + result.message);
          }
        });
    }
    
    setShowAdvancedOptions(false);
  };
  
  // Export event to iCal
  const handleExportEvent = () => {
    sharingService.downloadEventAsIcal(item);
    setShowAdvancedOptions(false);
  };
  
  // Share using native share API if available
  const handleNativeShare = async () => {
    const success = await sharingService.shareEventNatively(item);
    
    if (!success) {
      // Fallback to copy link
      const link = sharingService.generateShareableLink(item);
      navigator.clipboard.writeText(link)
        .then(() => alert('Shareable link copied to clipboard'))
        .catch(() => prompt('Copy this link to share:', link));
    }
    
    setShowAdvancedOptions(false);
  };
  
  // Show recurring event info
  const getRecurringBadge = () => {
    if (!item.isRecurring && !item.isRecurringInstance) return null;
    
    return (
      <span className="absolute top-1 right-1 bg-white dark:bg-slate-800 rounded-full px-1 py-0.5 text-[8px] font-medium text-blue-600 dark:text-blue-400">
        recurring
      </span>
    );
  };
  
  // Show notifications badge
  const getNotificationBadge = () => {
    if (!item.enableNotification) return null;
    
    return (
      <span className="absolute bottom-1 right-1 text-blue-500 dark:text-blue-400">
        <BellIcon className="h-3 w-3" />
      </span>
    );
  };
  
  // Show shared badge
  const getSharedBadge = () => {
    if (!item.isShared && !(item.sharedWith && item.sharedWith.length > 0)) return null;
    
    return (
      <span className="absolute bottom-1 left-1 text-purple-500 dark:text-purple-400">
        <UserGroupIcon className="h-3 w-3" />
      </span>
    );
  };
  
  return (
    <motion.div
      className={`absolute left-0 right-0 m-1 p-2 rounded-lg shadow-sm border ${getItemStyle()} 
        ${view === 'week' ? 'text-xs' : 'text-sm'} 
        cursor-pointer overflow-hidden ${isCompleted ? 'opacity-75' : ''}`}
      style={{ 
        height: `${Math.min(duration * 6, 24)}rem`,
        maxHeight: `${(duration * 6) - 0.5}rem`
      }}
      whileHover={{ scale: 1.02 }}
      onClick={() => setShowOptions(!showOptions)}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {getRecurringBadge()}
      {getNotificationBadge()}
      {getSharedBadge()}
      
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 mb-1">
            <ItemIcon />
            <span className="text-xs opacity-80">
              {format(parseISO(item.startTime), 'HH:mm', { locale: nl })}
              {' - '}
              {format(parseISO(item.endTime), 'HH:mm', { locale: nl })}
            </span>
          </div>
          
          <h4 className={`font-medium truncate ${view === 'week' ? 'text-xs' : 'text-sm'} ${isCompleted ? 'line-through' : ''}`}>
            {item.title}
          </h4>
          
          {view !== 'week' && (
            <p className={`text-xs mt-1 opacity-80 line-clamp-2 ${isCompleted ? 'line-through' : ''}`}>
              {item.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Options when clicked */}
      {showOptions && (
        <AnimatePresence>
          <motion.div
            ref={optionsRef}
            className="absolute bottom-0 right-0 p-1 flex flex-col items-end space-y-1 z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Main options */}
            <div className="flex space-x-1">
              {!item.isReadOnly && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={handleToggleComplete}
                    title={isCompleted ? "Mark as incomplete" : "Mark as completed"}
                  >
                    <CheckCircleIcon className={`h-3.5 w-3.5 ${isCompleted ? 'text-green-500 dark:text-green-400' : 'text-slate-400 dark:text-slate-600'}`} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={handleEdit}
                    title="Edit"
                  >
                    <PencilIcon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleDelete}
                    title="Delete"
                  >
                    <TrashIcon className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                  </motion.button>
                </>
              )}
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdvancedOptions(!showAdvancedOptions);
                }}
                title="More options"
              >
                <svg className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>
            
            {/* Advanced options */}
            {showAdvancedOptions && (
              <motion.div
                className="flex space-x-1 mt-1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScheduleNotification();
                  }}
                  title="Set notification"
                >
                  <BellIcon className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareEvent();
                  }}
                  title="Share via email"
                >
                  <ShareIcon className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNativeShare();
                  }}
                  title="Share link"
                >
                  <svg className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportEvent();
                  }}
                  title="Export to calendar"
                >
                  <ArrowDownTrayIcon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default AgendaItem; 