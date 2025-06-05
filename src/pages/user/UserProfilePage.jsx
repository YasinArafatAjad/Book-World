import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { User, Key, AlertTriangle, Image } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import { uploadImage } from '../../utils/cloudinary';
import { updateSiteLogo } from '../../utils/firebase';

const UserProfilePage = () => {
  const { currentUser, updateUserProfile, deleteAccount, changePassword, isAdmin, isDeveloper } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, JPG, PNG, GIF)');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error('Please select a logo image');
      return;
    }

    try {
      setLoading(true);
      const data = await uploadImage(logoFile);
      if (!data || !data.url) {
        throw new Error('Failed to upload logo');
      }

      await updateSiteLogo(data.url);
      toast.success('Logo updated successfully');
      window.location.reload(); // Refresh to show new logo
    } catch (error) {
      console.error('Error updating logo:', error);
      toast.error('Failed to update logo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile name if changed
      if (formData.name !== currentUser.displayName) {
        await updateUserProfile(formData.name);
        toast.success('Profile updated successfully');
      }

      // Handle password change if new password is provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('New passwords do not match');
          return;
        }
        
        await changePassword(formData.currentPassword, formData.newPassword);
        toast.success('Password updated successfully');
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await deleteAccount(deletePassword);
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please check your password and try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Profile Settings
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Profile Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="mr-2" size={20} />
                    Profile Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label 
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label 
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Key className="mr-2" size={20} />
                    Change Password
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label 
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label 
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label 
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Change Section (Admin Only) */}
                {isAdmin || isDeveloper && (
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Image className="mr-2" size={20} />
                      Change Site Logo
                    </h2>
                    <div className="space-y-4">
                      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                        {logoPreview ? (
                          <div className="relative">
                            <img
                              src={logoPreview}
                              alt="New logo preview"
                              className="h-32 w-32 object-contain mx-auto"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview('');
                              }}
                              className="absolute top-0 right-0 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md"
                            >
                              <AlertTriangle size={16} className="text-error-500" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Image className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Click or drag to upload a new logo
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          style={{ height: 'auto', minHeight: '100%' }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleLogoUpload}
                        disabled={!logoFile || loading}
                        loading={loading}
                      >
                        Update Logo
                      </Button>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recommended size: 200x200 pixels
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>

              {/* Delete Account Section */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-error-600 dark:text-error-400 mb-4 flex items-center">
                  <AlertTriangle className="mr-2" size={20} />
                  Delete Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
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
                    <AlertTriangle className="h-6 w-6 text-error-600 dark:text-error-400"  />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Delete Account
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete your account? All of your data will be permanently removed.
                        This action cannot be undone.
                      </p>
                      <div className="mt-4">
                        <label 
                          htmlFor="deletePassword"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Enter your password to confirm
                        </label>
                        <input
                          type="password"
                          id="deletePassword"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-error-500 focus:border-error-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter your password"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  type="button"
                  variant="danger"
                  className="w-full sm:w-auto sm:ml-3"
                  onClick={handleDeleteAccount}
                  loading={loading}
                >
                  Delete Account
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3 w-full sm:w-auto sm:mt-0"
                  onClick={() => setShowDeleteConfirm(false)}
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

export default UserProfilePage;