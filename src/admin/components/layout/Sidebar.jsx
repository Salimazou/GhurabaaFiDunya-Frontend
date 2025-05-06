import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ROLES } from '../../context/AdminAuthContext';

// Import Heroicons
import {
  HomeIcon,
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const navItems = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: HomeIcon,
    requiredRole: ROLES.VIEWER,
  },
  {
    name: 'Todos',
    path: '/admin/todos',
    icon: ClipboardDocumentListIcon,
    requiredRole: ROLES.VIEWER,
  },
  {
    name: 'Users',
    path: '/admin/users',
    icon: UsersIcon,
    requiredRole: ROLES.ADMIN,
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: Cog6ToothIcon,
    requiredRole: ROLES.ADMIN,
  },
  {
    name: 'Analytics',
    path: '/admin/analytics',
    icon: ChartBarIcon,
    requiredRole: ROLES.EDITOR,
  },
  {
    name: 'Content',
    path: '/admin/content',
    icon: DocumentTextIcon,
    requiredRole: ROLES.EDITOR,
  },
  {
    name: 'Permissions',
    path: '/admin/permissions',
    icon: ShieldCheckIcon,
    requiredRole: ROLES.SUPER_ADMIN,
  }
];

// Sidebar component with animations
export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { adminUser, hasPermission, logout } = useAdminAuth();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter(item => hasPermission(item.requiredRole));

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="fixed top-4 left-4 z-40 lg:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-30 bg-white dark:bg-gray-900 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <span className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </span>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">Admin Portal</span>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <nav className="mt-4 px-4 space-y-1">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      item.path === location.pathname
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                      "group flex items-center px-4 py-3 text-base font-medium rounded-md"
                    )}
                    onClick={toggleMobileMenu}
                  >
                    <item.icon
                      className={cn(
                        item.path === location.pathname
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400",
                        "mr-4 h-6 w-6"
                      )}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    {theme === 'dark' ? (
                      <>
                        <SunIcon className="h-5 w-5 mr-2" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <MoonIcon className="h-5 w-5 mr-2" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={logout}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <div>Logged in as:</div>
                  <div className="font-semibold text-gray-700 dark:text-gray-300">
                    {adminUser?.firstName || adminUser?.username || 'Admin User'}
                  </div>
                  <div className="text-xs mt-1 flex flex-wrap gap-1">
                    {adminUser?.roles?.map(role => (
                      <span 
                        key={role}
                        className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded px-2 py-1"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        className={cn(
          "hidden lg:flex h-full flex-col fixed left-0 top-0 z-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-20"
        )}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-gray-700">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-3">
              <span className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </span>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">Admin</span>
            </div>
          ) : (
            <span className="h-8 w-8 mx-auto rounded-full bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className={cn("p-1 rounded-md focus:outline-none", isSidebarOpen ? "" : "hidden")}
          >
            <svg
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <nav className="mt-4 px-2 space-y-1 overflow-y-auto flex-grow">
          {filteredNavItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                item.path === location.pathname
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                "group flex items-center px-2 py-2 text-base font-medium rounded-md"
              )}
            >
              <item.icon
                className={cn(
                  item.path === location.pathname
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400",
                  "mr-3 h-6 w-6 flex-shrink-0"
                )}
              />
              <AnimatePresence initial={false}>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={toggleTheme}
              className={cn(
                "flex items-center text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400",
                !isSidebarOpen && "mx-auto"
              )}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <>
                  <SunIcon className="h-5 w-5" />
                  {isSidebarOpen && <span className="ml-2">Light Mode</span>}
                </>
              ) : (
                <>
                  <MoonIcon className="h-5 w-5" />
                  {isSidebarOpen && <span className="ml-2">Dark Mode</span>}
                </>
              )}
            </button>
            {isSidebarOpen && (
              <button
                onClick={logout}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                <span>Logout</span>
              </button>
            )}
          </div>

          {isSidebarOpen && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <div>Logged in as:</div>
              <div className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                {adminUser?.firstName || adminUser?.username || 'Admin User'}
              </div>
              <div className="text-xs mt-1 flex flex-wrap gap-1">
                {adminUser?.roles?.map(role => (
                  <span 
                    key={role}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded px-2 py-1"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
} 