import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCard, Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Header from '../components/layout/Header';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission, adminUser } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Use the real API endpoint to get all users
        const data = await authAPI.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchTermLower) ||
      user.email?.toLowerCase().includes(searchTermLower) ||
      user.firstName?.toLowerCase().includes(searchTermLower) ||
      user.lastName?.toLowerCase().includes(searchTermLower) ||
      user.roles?.some(role => role.toLowerCase().includes(searchTermLower))
    );
  });

  const handleDeleteUser = async (userId) => {
    try {
      // Prevent deleting own account
      if (userId === adminUser?.id) {
        toast.error("You cannot delete your own account");
        return;
      }
      
      if (window.confirm('Are you sure you want to delete this user?')) {
        await authAPI.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
  };

  const handleRoleToggle = async (user, role) => {
    try {
      // Create updated roles array
      const updatedRoles = user.roles.includes(role)
        ? user.roles.filter(r => r !== role)
        : [...user.roles, role];
      
      // Call API to update user roles
      await authAPI.updateUserRoles(user.id, updatedRoles);
      
      // Update local state
      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          return { ...u, roles: updatedRoles };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      toast.success(`Role ${role} updated for user ${user.username}`);
    } catch (error) {
      console.error('Failed to update user roles:', error);
      toast.error('Failed to update user roles');
    }
  };

  const handleSaveUserChanges = async () => {
    try {
      // In a real implementation, you would collect all form data
      // and send it to the server
      toast.success('User updated successfully');
      handleCloseModal();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="p-6">
      <Header title="Users Management" breadcrumbs={['Admin', 'Users']} />

      {/* Search and controls */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        <Button variant="success" className="w-full sm:w-auto">
          Add New User
        </Button>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Roles
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user, index) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map(role => (
                          <span 
                            key={role} 
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                       ${role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                                         role === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                         role === 'Editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                         'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Regular User
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      disabled={user.id === adminUser?.id}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role management modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AnimatedCard 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4"
          >
            <CardHeader>
              <CardTitle>Edit User: {selectedUser.username}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assign Roles
                  </label>
                  <div className="mt-2 space-y-2">
                    {Object.values({ SuperAdmin: 'Super Admin', Admin: 'Admin', Editor: 'Editor', Viewer: 'Viewer' }).map((role) => (
                      <div key={role} className="flex items-center">
                        <button
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            selectedUser.roles?.includes(role) ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                          onClick={() => handleRoleToggle(selectedUser, role)}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              selectedUser.roles?.includes(role) ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="ml-3 text-sm">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSaveUserChanges}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
} 