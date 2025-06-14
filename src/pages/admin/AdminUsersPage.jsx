import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Search, 
  UserCog,
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Ban,
  Trash2,
  Lock
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ROLES = {
  admin: {
    label: 'Admin',
    color: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    canAssign: ['admin','developer', 'moderator', 'user'],
    isSenior: true
  },
  moderator: {
    label: 'Moderator',
    color: 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200',
    canAssign: ['moderator', 'user'],
    isSenior: true
  },
  developer: {
    label: 'Developer',
    color: 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200',
    canAssign: ['developer', 'moderator', 'user'],
    isSenior: true
  },
  user: {
    label: 'User',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    canAssign: [],
    isSenior: false
  }
};

const AdminUsersPage = () => {
  const { currentUser, userRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Function to get available roles based on current user's role
  const getAvailableRoles = () => {
    const roleObj = ROLES[userRole];
    if (!roleObj) return ['user'];
    return roleObj.canAssign;
  };

  // Function to check if current user can change a specific user's role
  const canChangeUserRole = (targetUser) => {
    // Users cannot change their own role
    if (targetUser.id === currentUser.uid) return false;
    
    // Get available roles for current user
    const availableRoles = getAvailableRoles();
    
    // Check if the target user's current role is something the current user can manage
    // or if there are roles the current user can assign
    return availableRoles.length > 0;
  };

  // Function to check if current user has permission to manage a specific user's role
  const hasRolePermission = (targetUser) => {
    // Users cannot change their own role
    if (targetUser.id === currentUser.uid) return false;
    
    // Check if target user has a senior role and current user doesn't have sufficient permissions
    const targetRole = ROLES[targetUser.role];
    const currentRole = ROLES[userRole];
    
    // If target user has a senior role, only allow changes if:
    // 1. Current user is developer (can manage all)
    // 2. Current user is admin and target is not developer
    // 3. Target user is not a senior role
    if (targetRole?.isSenior) {
      if (userRole === 'admin') {
        // admin can manage all roles
        return true;
      } else if (userRole === 'developer' && targetUser.role !== 'admin') {
        // developer can manage moderator and user roles, but not developer
        return true;
      } else {
        // Moderator or lower cannot manage senior roles
        return false;
      }
    }
    
    // For non-senior roles, check if current user has available roles to assign
    const availableRoles = getAvailableRoles();
    return availableRoles.some(role => role !== targetUser.role);
  };

  // Function to get the reason why role cannot be changed
  const getRoleChangeReason = (targetUser) => {
    if (targetUser.id === currentUser.uid) {
      return 'Own role';
    }
    
    const targetRole = ROLES[targetUser.role];
    if (targetRole?.isSenior) {
      if (userRole === 'moderator') {
        return 'Senior role';
      } else if (userRole === 'admin' && targetUser.role === 'developer') {
        return 'Developer role';
      }
    }
    
    return 'No permission';
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(true);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, role: newRole }
            : user
        )
      );
      
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: newStatus }
            : user
        )
      );
      
      toast.success(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const userRef = doc(db, 'users', selectedUser.id);
      await deleteDoc(userRef);
      
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manage Users
            </h1>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              />
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" 
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <UserCog className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                                {user.id === currentUser.uid && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasRolePermission(user) ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              disabled={actionLoading}
                              className={`rounded-full text-sm font-medium px-3 py-1 border-0 focus:ring-2 focus:ring-primary-500 ${ROLES[user.role]?.color || ROLES.user.color}`}
                            >
                              {/* Show current role */}
                              <option value={user.role}>
                                {ROLES[user.role]?.label || 'User'}
                              </option>
                              {/* Show only roles that current user can assign */}
                              {getAvailableRoles().map(role => (
                                user.role !== role && (
                                  <option key={role} value={role}>
                                    {ROLES[role].label}
                                  </option>
                                )
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center">
                              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${ROLES[user.role]?.color || ROLES.user.color}`}>
                                {ROLES[user.role]?.label || 'User'}
                              </span>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                <Lock size={12} className="mr-1" />
                                {getRoleChangeReason(user)}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(user.createdAt?.toDate()).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(user.updatedAt?.toDate()).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'No users match your search criteria' : 'No users found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastUser, filteredUsers.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredUsers.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {[...Array(totalPages).keys()].map((number) => (
                        <button
                          key={number + 1}
                          onClick={() => setCurrentPage(number + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === number + 1
                              ? 'z-10 bg-primary-50 dark:bg-primary-900 border-primary-500 dark:border-primary-500 text-primary-600 dark:text-primary-300'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          } text-sm font-medium`}
                        >
                          {number + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-error-100 dark:bg-error-900 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-error-600 dark:text-error-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Delete User Account
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete the account for {selectedUser.email}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  type="button"
                  variant="danger"
                  className="w-full sm:w-auto sm:ml-3"
                  onClick={handleDeleteUser}
                  loading={actionLoading}
                >
                  Delete User
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3 w-full sm:w-auto sm:mt-0"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;