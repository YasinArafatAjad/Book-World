import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders } from '../../utils/firebase';
import { useState, useEffect } from 'react';
import { Package, User, ShoppingBag, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';

const UserDashboardPage = () => {
  const { currentUser, userStatus } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orders = await getUserOrders(currentUser.uid);
        setRecentOrders(orders.slice(0, 3)); // Get last 3 orders
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Check if the error is related to missing index
        if (error.message?.includes('index')) {
          setError('The system is being optimized for better performance. Please try again in a few minutes.');
        } else {
          setError('Unable to load your recent orders. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'blocked':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {currentUser.displayName || 'User'}!
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(userStatus)}`}>
                {userStatus === 'active' ? 'Active' : 'Account Blocked'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quick Actions
                  </h2>
                  <User className="text-primary-600 dark:text-primary-400" size={24} />
                </div>
                <div className="space-y-3">
                  <Button
                    to="/profile"
                    variant="outline"
                    fullWidth
                  >
                    Edit Profile
                  </Button>
                  <Button
                    to="/orders"
                    variant="outline"
                    fullWidth
                  >
                    View Orders
                  </Button>
                </div>
              </div>

              {/* Account Overview */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Account Overview
                  </h2>
                  <Shield className="text-primary-600 dark:text-primary-400" size={24} />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    Email: {currentUser.email}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Member since: {new Date(currentUser.metadata.creationTime).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Status: <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(userStatus)}`}>
                      {userStatus === 'active' ? 'Active' : 'Blocked'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order Summary
                  </h2>
                  <ShoppingBag className="text-primary-600 dark:text-primary-400" size={24} />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    Total Orders: {recentOrders.length}
                  </p>
                  <Button
                    to="/orders"
                    variant="primary"
                    fullWidth
                  >
                    View All Orders
                  </Button>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Orders
              </h2>
              {loading ? (
                <p className="text-gray-600 dark:text-gray-300">Loading orders...</p>
              ) : error ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'completed' ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200' :
                          order.status === 'pending' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Total: ৳{order.total?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">No recent orders</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;