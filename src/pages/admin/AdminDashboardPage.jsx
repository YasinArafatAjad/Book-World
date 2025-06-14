import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Book, ShoppingBag, Users, TrendingUp, Package, AlertCircle, UserPlus, Truck } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, where, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Button from '../../components/ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import TeamMemberModal from '../../components/admin/TeamMemberModal';
import { toast } from 'react-toastify';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockBooks, setLowStockBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch books count and category stats
        const booksSnapshot = await getDocs(collection(db, 'books'));
        const totalBooks = booksSnapshot.size;

        // Calculate category statistics
        const categories = {};
        booksSnapshot.docs.forEach(doc => {
          const category = doc.data().category || 'Uncategorized';
          categories[category] = (categories[category] || 0) + 1;
        });

        const categoryData = Object.entries(categories).map(([name, value]) => ({
          name,
          value
        }));

        setCategoryStats(categoryData);

        // Fetch low stock books
        const lowStockQuery = query(
          collection(db, 'books'),
          where('stock', '<', 5),
          limit(10)
        );
        const lowStockSnapshot = await getDocs(lowStockQuery);
        const lowStockData = lowStockSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch all orders for monthly stats
        const ordersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate monthly statistics (only completed orders)
        const monthlyStats = {};
        ordersData.forEach(order => {
          const date = order.createdAt?.toDate();
          if (date && order.status === 'completed') {
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyStats[monthYear]) {
              monthlyStats[monthYear] = {
                totalOrders: 0,
                revenue: 0
              };
            }
            monthlyStats[monthYear].totalOrders += order.items.reduce((sum, item) => sum + item.quantity, 0);
            monthlyStats[monthYear].revenue += order.total || 0;
          }
        });

        // Convert monthly stats to array and sort by date
        const monthlyData = Object.entries(monthlyStats)
          .map(([name, stats]) => ({
            name,
            totalOrders: stats.totalOrders,
            revenue: parseFloat(stats.revenue.toFixed(2))
          }))
          .sort((a, b) => {
            const dateA = new Date(a.name);
            const dateB = new Date(b.name);
            return dateA - dateB;
          });

        setOrderStats(monthlyData);

        // Get recent orders
        const recentOrdersData = ordersData.slice(0, 5);
        setRecentOrders(recentOrdersData);

        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // Calculate total revenue and total orders from completed orders only
        const totalRevenue = ordersData.reduce((sum, order) => {
          return order.status === 'completed' ? sum + (order.total || 0) : sum;
        }, 0);

        const totalOrders = ordersData.reduce((sum, order) => {
          return order.status === 'completed' ? sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0) : sum;
        }, 0);

        setStats({
          totalBooks,
          totalOrders,
          totalUsers,
          revenue: totalRevenue
        });

        setLowStockBooks(lowStockData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderActiveShape = (props) => {
    const { cx, cy, innerradius, outerradius, startAngle, endAngle, fill, payload, percent } = props;

    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="text-lg font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill={fill}>
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <path
          d={`M${cx},${cy}L${cx},${cy}`}
          fill="none"
          stroke={fill}
          {...{ innerradius, outerradius, startAngle, endAngle }}
        />
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <div className="flex gap-4">
                <Button
                  to="/admin/books/add"
                  variant="primary"
                  icon={<Book size={20} />}
                >
                  Add New Book
                </Button>
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 mb-8">
              <Button
                  variant="secondary"
                  icon={<UserPlus size={20} />}
                  onClick={() => setShowTeamModal(true)}
                >
                  Add Team Member
                </Button>
                <Button
                  to="/admin/users"
                  variant="secondary"
                  icon={<Users size={20} />}
                >
                  Manage Users
                </Button>
                <Button
                  to="/admin/courier"
                  variant="secondary"
                  icon={<Truck size={20} />}
                >
                  Courier Management
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Books</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stats.totalBooks}
                    </h3>
                  </div>
                  <Book className="text-primary-600 dark:text-primary-400" size={24} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stats.totalOrders}
                    </h3>
                  </div>
                  <ShoppingBag className="text-primary-600 dark:text-primary-400" size={24} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stats.totalUsers}
                    </h3>
                  </div>
                  <Users className="text-primary-600 dark:text-primary-400" size={24} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      ৳{stats.revenue.toFixed(2)}
                    </h3>
                  </div>
                  <TrendingUp className="text-primary-600 dark:text-primary-400" size={24} />
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Category Distribution Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Book Categories Distribution
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        innerradius={60}
                        outerradius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        activeShape={renderActiveShape}
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Orders Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Monthly Orders Overview
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={orderStats}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="totalOrders"
                        stroke="#3B82F6"
                        activeDot={{ r: 8 }}
                        name="Total Orders"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        activeDot={{ r: 8 }}
                        name="Revenue (৳)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Recent Orders
                    </h2>
                    <Link 
                      to="/admin/orders"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
                    >
                      View All
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div 
                          key={order.id}
                          className="flex items-center justify-between py-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              ৳{order.total?.toFixed(2)}
                            </p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === 'completed' ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200' :
                              order.status === 'pending' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No recent orders</p>
                  )}
                </div>
              </div>

              {/* Low Stock Alert */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <AlertCircle className="mr-2 text-warning-500" size={20} />
                      Low Stock Alert
                    </h2>
                    <Link 
                      to="/admin/books"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium"
                    >
                      Manage Inventory
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {lowStockBooks.length > 0 ? (
                    <div className="space-y-4">
                      {lowStockBooks.map((book) => (
                        <div 
                          key={book.id}
                          className="flex items-center space-x-4"
                        >
                          <img
                            src={book.imageUrl || "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {book.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Stock: {book.stock} units
                            </p>
                          </div>
                          <Link
                            to={`/admin/books/edit/${book.id}`}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            <Package size={20} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No low stock items</p>
                  )}
                </div>
              </div>
            </div>

            {/* Team Member Modal */}
            {showTeamModal && (
              <TeamMemberModal
                onClose={() => setShowTeamModal(false)}
                onSuccess={() => {
                  setShowTeamModal(false);
                  toast.success('Team member added successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  });
                }}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;