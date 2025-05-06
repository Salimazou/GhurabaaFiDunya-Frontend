import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDaysIcon, 
  SunIcon, 
  MoonIcon,
  PlusIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MapPinIcon,
  BookOpenIcon,
  BellIcon,
  ShareIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import AddEventModal from './AddEventModal';
import { useAuth } from '../../components/auth/AuthContext';
import { useQuranMemorization } from '../../context/QuranMemorizationContext';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { nl } from 'date-fns/locale';
import PrayerTimesService from '../../services/PrayerTimesService';
import notificationService from '../../services/NotificationService';
import sharingService from '../../services/SharingService';

const AgendaApp = () => {
  const { user } = useAuth();
  const { getMemorizationAgendaItems, activeMemorizationPlan } = useQuranMemorization();
  const [view, setView] = useState('week'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [agendaItems, setAgendaItems] = useState([]);
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingPrayerTimes, setLoadingPrayerTimes] = useState(false);
  const [showPrayerTimes, setShowPrayerTimes] = useState(true);
  const [showMemorizationPlan, setShowMemorizationPlan] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLink, setImportLink] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  // Get user location on component mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await PrayerTimesService.getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };
    
    getLocation();
  }, []);
  
  // Fetch prayer times when location is available and date changes
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      if (!userLocation) return;
      
      setLoadingPrayerTimes(true);
      try {
        // Fetch prayer times based on current view
        if (view === 'day') {
          const times = await PrayerTimesService.getPrayerTimes(currentDate, userLocation);
          setPrayerTimes(Object.values(times).filter(item => typeof item === 'object'));
        } else if (view === 'week' || view === 'month') {
          const month = currentDate.getMonth() + 1;
          const year = currentDate.getFullYear();
          const monthlyTimes = await PrayerTimesService.getMonthlyPrayerTimes(userLocation, month, year);
          
          // Flatten the array of prayer times
          const allPrayerTimes = monthlyTimes.flatMap(day => 
            Object.values(day).filter(item => typeof item === 'object' && item.category === 'prayer')
          );
          
          setPrayerTimes(allPrayerTimes);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      } finally {
        setLoadingPrayerTimes(false);
      }
    };
    
    fetchPrayerTimes();
  }, [userLocation, currentDate, view]);
  
  // Load persisted events from localStorage on component mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem('agendaItems');
      if (savedEvents) {
        setAgendaItems(JSON.parse(savedEvents));
      }
      
      // Load persisted notifications
      notificationService.loadPersistedNotifications();
      
      // Request notification permission if needed
      notificationService.requestPermission();
      
      // Check URL for shared event
      const urlParams = new URLSearchParams(window.location.search);
      const sharedEventParam = urlParams.get('share');
      
      if (sharedEventParam) {
        try {
          const importedEvent = sharingService.importSharedEvent(sharedEventParam);
          if (importedEvent) {
            handleAddEvent(importedEvent);
            
            // Remove the share parameter from URL to avoid reimporting
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            
            // Show a notification
            addNotification('Event imported successfully!', 'success');
          }
        } catch (error) {
          console.error('Error importing shared event:', error);
          addNotification('Failed to import shared event', 'error');
        }
      }
    } catch (error) {
      console.error('Error loading saved events:', error);
    }
  }, []);
  
  // Save events to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('agendaItems', JSON.stringify(agendaItems));
    } catch (error) {
      console.error('Error saving events:', error);
    }
  }, [agendaItems]);
  
  // Schedule notifications for new events with notifications enabled
  useEffect(() => {
    // Find events with enableNotification=true but no notification scheduled
    const eventsNeedingNotifications = agendaItems.filter(
      item => item.enableNotification && !item.notificationId
    );
    
    if (eventsNeedingNotifications.length > 0) {
      const notificationMap = notificationService.scheduleEventNotifications(eventsNeedingNotifications);
      
      // Update events with notification IDs
      setAgendaItems(prev => prev.map(item => {
        if (notificationMap[item.id]) {
          return { ...item, notificationId: notificationMap[item.id] };
        }
        return item;
      }));
    }
  }, [agendaItems]);
  
  // Get memorization assignments when active plan changes
  const memorizationItems = showMemorizationPlan ? getMemorizationAgendaItems() : [];
  
  // Combine regular agenda items with prayer times and memorization assignments if enabled
  const combinedAgendaItems = [
    ...agendaItems,
    ...(showPrayerTimes ? prayerTimes : []),
    ...(showMemorizationPlan ? memorizationItems : [])
  ];
  
  // Function to add temporary notification messages
  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timeout: setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000)
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };
  
  // Functie om door de tijd te navigeren
  const navigateDate = (direction) => {
    if (direction === 'next') {
      if (view === 'day') setCurrentDate(addDays(currentDate, 1));
      if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
      if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    } else {
      if (view === 'day') setCurrentDate(subDays(currentDate, 1));
      if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
      if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    }
  };
  
  // Naar vandaag gaan
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Titel voor de header op basis van huidige view en datum
  const getHeaderTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE d MMMM yyyy', { locale: nl });
      case 'week':
        return `Week ${format(currentDate, 'w')} - ${format(currentDate, 'MMMM yyyy', { locale: nl })}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: nl });
      default:
        return '';
    }
  };
  
  // Event toevoegen
  const handleAddEvent = (newEvent) => {
    // Generate ID if not present
    const eventWithId = {
      ...newEvent,
      id: newEvent.id || Date.now().toString(),
      userId: newEvent.userId || user?.id || 'anonymous',
      addedAt: new Date().toISOString()
    };
    
    setAgendaItems(prev => [...prev, eventWithId]);
    setShowAddModal(false);
    
    // Schedule notification if enabled
    if (eventWithId.enableNotification) {
      const notificationId = notificationService.scheduleNotification(
        eventWithId,
        eventWithId.notifyBefore || 15
      );
      
      if (notificationId) {
        // Update the event with the notification ID
        setAgendaItems(prev => 
          prev.map(item => 
            item.id === eventWithId.id
              ? { ...item, notificationId }
              : item
          )
        );
      }
    }
    
    // Show notification
    addNotification(`Event "${eventWithId.title}" added`, 'success');
  };
  
  // Event verwijderen
  const handleDeleteEvent = (id) => {
    // Don't allow deletion of prayer times (they're read-only)
    if (id.startsWith('prayer-')) return;
    
    // Don't delete memorization items directly (they should be managed through the memorization context)
    if (id.startsWith('memorization-')) {
      // Could display a message: "Memorization items can only be managed in the Quran study section"
      addNotification('Memorization items can only be managed in the Quran study section', 'info');
      return;
    }
    
    // Find the event to show its title in the notification
    const eventToDelete = agendaItems.find(item => item.id === id);
    
    // Cancel any notifications for this event
    notificationService.cancelEventNotifications(id);
    
    setAgendaItems(agendaItems.filter(item => item.id !== id));
    
    // Show notification
    if (eventToDelete) {
      addNotification(`Event "${eventToDelete.title}" deleted`, 'info');
    }
  };
  
  // Event bijwerken
  const handleUpdateEvent = (updatedEvent) => {
    // Don't allow updating prayer times (they're read-only)
    if (updatedEvent.id.startsWith('prayer-')) return;
    
    // Don't update memorization items directly
    if (updatedEvent.id.startsWith('memorization-')) return;
    
    setAgendaItems(agendaItems.map(item => 
      item.id === updatedEvent.id ? updatedEvent : item
    ));
    
    // Update notification if needed
    if (updatedEvent.enableNotification) {
      // Cancel existing notification if any
      if (updatedEvent.notificationId) {
        notificationService.cancelNotification(updatedEvent.notificationId);
      }
      
      // Schedule new notification
      const notificationId = notificationService.scheduleNotification(
        updatedEvent,
        updatedEvent.notifyBefore || 15
      );
      
      if (notificationId) {
        // Update the event with the new notification ID
        setAgendaItems(prev => 
          prev.map(item => 
            item.id === updatedEvent.id
              ? { ...item, notificationId }
              : item
          )
        );
      }
    } else if (updatedEvent.notificationId) {
      // Notification was disabled, cancel it
      notificationService.cancelNotification(updatedEvent.notificationId);
      
      // Remove notification ID from event
      setAgendaItems(prev => 
        prev.map(item => 
          item.id === updatedEvent.id
            ? { ...item, notificationId: null }
            : item
        )
      );
    }
  };
  
  // Toggle prayer times display
  const togglePrayerTimes = () => {
    setShowPrayerTimes(!showPrayerTimes);
  };
  
  // Toggle memorization plan display
  const toggleMemorizationPlan = () => {
    setShowMemorizationPlan(!showMemorizationPlan);
  };
  
  // Import event from a shared link
  const handleImportEvent = () => {
    try {
      // Extract the code from the link
      let shareCode = importLink.trim();
      
      // If it's a full URL, extract the share parameter
      if (shareCode.includes('?share=')) {
        shareCode = shareCode.split('?share=')[1].split('&')[0];
      }
      
      const importedEvent = sharingService.importSharedEvent(shareCode);
      
      if (importedEvent) {
        handleAddEvent(importedEvent);
        setImportLink('');
        setShowImportModal(false);
        addNotification('Event imported successfully!', 'success');
      } else {
        throw new Error('Invalid share link');
      }
    } catch (error) {
      console.error('Error importing event:', error);
      addNotification('Failed to import event: Invalid share link', 'error');
    }
  };
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} transition-colors duration-300`}>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`px-4 py-2 rounded-lg shadow-lg text-white ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' :
              'bg-blue-500'
            }`}
          >
            {notification.message}
          </motion.div>
        ))}
      </div>
      
      {/* Hoofdcontainer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header met navigatie */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Agenda</h1>
            <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                className={`px-3 py-1 rounded-md text-sm ${view === 'day' ? 'bg-emerald-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                onClick={() => setView('day')}
              >
                Dag
              </button>
              <button 
                className={`px-3 py-1 rounded-md text-sm ${view === 'week' ? 'bg-emerald-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                onClick={() => setView('week')}
              >
                Week
              </button>
              <button 
                className={`px-3 py-1 rounded-md text-sm ${view === 'month' ? 'bg-emerald-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                onClick={() => setView('month')}
              >
                Maand
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto space-x-2">
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              <button 
                className="px-3 py-1 text-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 rounded-md"
                onClick={goToToday}
              >
                Vandaag
              </button>
              
              <button 
                className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                onClick={() => navigateDate('next')}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            
            <button
              className={`p-1.5 rounded-md ${showPrayerTimes ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              onClick={togglePrayerTimes}
              title={showPrayerTimes ? 'Hide prayer times' : 'Show prayer times'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </button>
            
            {activeMemorizationPlan && (
              <button
                className={`p-1.5 rounded-md ${showMemorizationPlan ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                onClick={toggleMemorizationPlan}
                title={showMemorizationPlan ? 'Hide memorization plan' : 'Show memorization plan'}
              >
                <BookOpenIcon className="h-5 w-5" />
              </button>
            )}
            
            <button
              className="p-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-800 dark:text-purple-300"
              onClick={() => setShowImportModal(true)}
              title="Import shared event"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
            </button>
            
            <button 
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          </div>
        </header>
        
        {/* Information display */}
        <div className="flex flex-col items-center space-y-2 mb-6">
          {/* Location indicator */}
          {userLocation && (
            <div className="text-center flex justify-center items-center text-xs text-slate-500 dark:text-slate-400">
              <MapPinIcon className="h-3 w-3 mr-1" />
              <span>
                {loadingPrayerTimes ? 'Loading prayer times...' : `Prayer times for: ${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}`}
              </span>
            </div>
          )}
          
          {/* Active memorization plan */}
          {activeMemorizationPlan && showMemorizationPlan && (
            <div className="text-center flex justify-center items-center text-xs text-emerald-600 dark:text-emerald-400">
              <BookOpenIcon className="h-3 w-3 mr-1" />
              <span>
                Active plan: {activeMemorizationPlan.title} (Day {activeMemorizationPlan.currentDay} of {activeMemorizationPlan.duration})
              </span>
            </div>
          )}
          
          {/* Huidige datum weergave */}
          <div>
            <h2 className="text-xl font-medium">{getHeaderTitle()}</h2>
          </div>
        </div>
        
        {/* Kalender weergave */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden">
          {view === 'day' && <DayView 
            currentDate={currentDate} 
            agendaItems={combinedAgendaItems}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />}
          
          {view === 'week' && <WeekView 
            currentDate={currentDate} 
            agendaItems={combinedAgendaItems}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />}
          
          {view === 'month' && <MonthView 
            currentDate={currentDate} 
            agendaItems={combinedAgendaItems}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
            onViewChange={(date) => {
              setCurrentDate(date);
              setView('day');
            }}
          />}
        </div>
        
        {/* Zwevende actieknop */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          className="fixed bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-full shadow-lg"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="h-6 w-6" />
        </motion.button>
      </div>
      
      {/* Modal voor het toevoegen van events */}
      {showAddModal && (
        <AddEventModal 
          onClose={() => setShowAddModal(false)} 
          onAddEvent={handleAddEvent}
          userId={user?.id || 'anonymous'}
        />
      )}
      
      {/* Modal voor het importeren van events */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-medium">Import Shared Event</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Paste shared event link or code</label>
              <input 
                type="text" 
                value={importLink} 
                onChange={(e) => setImportLink(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                placeholder="https://example.com/agenda?share=..."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              
              <button
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                onClick={handleImportEvent}
                disabled={!importLink.trim()}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaApp; 