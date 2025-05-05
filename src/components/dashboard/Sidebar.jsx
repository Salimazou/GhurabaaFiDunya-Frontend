import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  ClockIcon, 
  CalendarIcon, 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightStartOnRectangleIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

// Islamic arabesque pattern for sidebar header
const arabesquePattern = {
  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'44\' height=\'12\' viewBox=\'0 0 44 12\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 12v-2L0 0v10l4 2h16zm18 0l4-2V0L22 10v2h16zM20 0v8L4 0h16zm18 0L22 8V0h16z\' fill=\'%23FFFFFF\' fill-opacity=\'0.15\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
  backgroundSize: '30px auto'
};

export default function Sidebar({ user, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    { name: 'Dashboard', icon: HomeIcon, active: true },
    { name: 'Taken', icon: ClockIcon, active: false },
    { name: 'Agenda', icon: CalendarIcon, active: false },
    { name: 'Profiel', icon: UserIcon, active: false },
    { name: 'Instellingen', icon: Cog6ToothIcon, active: false }
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
      {/* Mobile menu toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-emerald-600 text-white shadow-md"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar - desktop always visible, mobile conditionally */}
      <motion.aside 
        className={`
          bg-white shadow-xl fixed md:sticky top-0 h-screen z-40
          w-64 md:w-72 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Sidebar header with Islamic pattern */}
        <div 
          className="h-48 bg-emerald-700 flex flex-col justify-end p-6"
          style={arabesquePattern}
        >
          <div className="text-white">
            <h2 className="text-2xl font-bold">{user.firstName || user.username}</h2>
            <p className="text-emerald-100 text-sm mt-1">{capitalizedDate}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <a
                  href="#"
                  className={`flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={onLogout}
            className="flex w-full items-center p-3 text-sm text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
          >
            <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-3" />
            Uitloggen
          </button>
        </div>
      </motion.aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
} 