import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  ClockIcon, 
  CalendarIcon, 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightStartOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

// Islamic arabesque pattern for sidebar header
const arabesquePattern = {
  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'44\' height=\'12\' viewBox=\'0 0 44 12\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 12v-2L0 0v10l4 2h16zm18 0l4-2V0L22 10v2h16zM20 0v8L4 0h16zm18 0L22 8V0h16z\' fill=\'%23FFFFFF\' fill-opacity=\'0.15\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
  backgroundSize: '30px auto'
};

export default function Sidebar({ user, onLogout, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Dashboard');

  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Handle navigation item click
  const handleNavItemClick = (itemName) => {
    setActiveItem(itemName);
    if (onNavigate) {
      onNavigate(itemName);
    }
    closeSidebar(); // Close sidebar after navigation on mobile
  };

  // Set body overflow when sidebar is open/closed
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const navigationItems = [
    { name: 'Dashboard', icon: HomeIcon, active: activeItem === 'Dashboard' },
    { name: 'Taken', icon: ClockIcon, active: activeItem === 'Taken' },
    { name: 'Koran', icon: BookOpenIcon, active: activeItem === 'Koran' },
    { name: 'Agenda', icon: CalendarIcon, active: activeItem === 'Agenda' },
    { name: 'Profiel', icon: UserIcon, active: activeItem === 'Profiel' },
    { name: 'Instellingen', icon: Cog6ToothIcon, active: activeItem === 'Instellingen' }
  ];

  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);

  // Convert first letter to uppercase
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <>
      {/* Mobile hamburger menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-emerald-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
          aria-controls="mobile-sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-30">
        <div className="flex justify-around">
          {navigationItems.slice(0, 5).map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavItemClick(item.name)}
              className={`flex flex-col items-center py-2 px-1 flex-1 transition-colors ${
                item.active ? 'text-emerald-600' : 'text-gray-600'
              }`}
              aria-label={item.name}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay for mobile menu - closes sidebar when clicked */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        id="mobile-sidebar"
        className={`
          bg-white shadow-xl fixed md:sticky top-0 h-screen z-40
          w-72 transform transition-transform duration-300 ease-in-out
          overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        aria-label="Sidebar navigation"
        initial={false}
      >
        {/* Close button for mobile - positioned at the top right */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-1 rounded-full bg-emerald-600 text-white md:hidden focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Sidebar header with Islamic pattern */}
        <div 
          className="h-40 md:h-48 bg-emerald-700 flex flex-col justify-end p-6 mt-0 md:mt-0"
          style={arabesquePattern}
        >
          <div className="text-white">
            <h2 className="text-2xl font-bold">{user.firstName || user.username}</h2>
            <p className="text-emerald-100 text-sm mt-1">{capitalizedDate}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 md:p-6" aria-label="Main navigation">
          <ul className="space-y-1 md:space-y-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleNavItemClick(item.name)}
                  className={`flex w-full items-center p-2 md:p-3 rounded-lg text-sm font-medium transition-colors
                    ${
                      item.active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100'
                    }`}
                  aria-current={item.active ? 'page' : undefined}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 pb-16 md:pb-6">
          <button
            onClick={onLogout}
            className="flex w-full items-center p-2 md:p-3 text-sm text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 active:bg-red-100"
            aria-label="Log out"
          >
            <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
            Uitloggen
          </button>
        </div>
      </motion.aside>
    </>
  );
} 