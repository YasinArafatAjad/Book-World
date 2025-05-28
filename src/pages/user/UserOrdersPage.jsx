import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders } from '../../utils/firebase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const UserOrdersPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await getUserOrders(currentUser.uid);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Your Orders
            </h1>

            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ORDER PLACED
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            TOTAL
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            ৳{order.total?.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ORDER #{order.id.slice(0, 8)}
                          </p>
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'completed' ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200' :
                            order.status === 'pending' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-start space-x-4">
                            <img
                              src={item.imageUrl || "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                by {item.author}
                              </p>
                              <div className="mt-2 flex items-center justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Quantity: {item.quantity}
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ৳{(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Address */}
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Shipping Address
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.shippingAddress?.street}<br />
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No orders yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  When you place an order, it will appear here.
                </p>
                <a
                  href="/books"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Start Shopping
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserOrdersPage;