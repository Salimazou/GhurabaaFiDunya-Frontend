import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Header({ title, breadcrumbs = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { adminUser } = useAdminAuth();

  useEffect(() => {
    // Mock notifications data - in real app this would come from an API
    setNotifications([
      { id: 1, message: 'Nieuwe gebruiker geregistreerd', time: '5 min geleden' },
      { id: 2, message: 'Systeem update beschikbaar', time: '1 uur geleden' },
    ]);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-30 w-full transition-all duration-200 bg-white dark:bg-gray-800",
        { "shadow-md": scrolled }
      )}
    >
      <div className="px-4 py-3 md:px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {/* Left side - Title & Breadcrumbs */}
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h1>
          
          {breadcrumbs.length > 0 && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  <span className={index === breadcrumbs.length - 1 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                    {crumb}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side - Search, Notifications, User */}
        <div className="flex items-center space-x-4">
          {/* Search button */}
          <div className="hidden md:flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-1.5">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input 
              type="text" 
              placeholder="Zoeken..." 
              className="bg-transparent border-0 outline-none text-sm ml-2 w-40 focus:w-52 transition-all"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleNotifications} 
              className="relative"
            >
              <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              )}
            </Button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium">Notificaties</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="text-sm">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center">
                  <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                    Alle notificaties bekijken
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* User dropdown */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-medium">
              {adminUser?.firstName?.[0] || adminUser?.username?.[0] || 'A'}
            </div>
            <div className="ml-2 hidden md:block">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {adminUser?.firstName || adminUser?.username}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {adminUser?.roles?.[0] || 'Admin'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 