import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { 
  getSteadfastBalance, 
  getSteadfastStatus, 
  getSteadfastDeliveryCharge,
  cancelSteadfastOrder 
} from '../../utils/steadfast';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

const CourierDetailsPage = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(null);
  const [chargeCalculation, setChargeCalculation] = useState({
    city: 'Dhaka',
    codAmount: 1000,
    weight: 0.5
  });

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const balanceData = await getSteadfastBalance();
      setBalance(balanceData);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch courier balance');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async () => {
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }

    try {
      setLoading(true);
      const result = await getSteadfastStatus(trackingId);
      setTrackingResult(result);
      toast.success('Order status retrieved successfully');
    } catch (error) {
      console.error('Error tracking order:', error);
      toast.error('Failed to track order. Please check the tracking ID.');
      setTrackingResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateCharge = async () => {
    try {
      setLoading(true);
      const result = await getSteadfastDeliveryCharge(
        chargeCalculation.city,
        chargeCalculation.codAmount,
        chargeCalculation.weight
      );
      setDeliveryCharge(result);
      toast.success('Delivery charge calculated successfully');
    } catch (error) {
      console.error('Error calculating charge:', error);
      toast.error('Failed to calculate delivery charge');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (consignmentId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setLoading(true);
      await cancelSteadfastOrder(consignmentId);
      toast.success('Order cancelled successfully');
      // Refresh tracking result
      if (trackingId) {
        await handleTrackOrder();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="text-success-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-error-500" size={20} />;
      case 'pending':
      case 'in_review':
        return <Clock className="text-warning-500" size={20} />;
      default:
        return <Package className="text-primary-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'cancelled':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200';
      case 'pending':
      case 'in_review':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      default:
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
    }
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
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Truck className="mr-3 text-primary-600 dark:text-primary-400" size={32} />
                Steadfast Courier Management
              </h1>
              <Button
                onClick={fetchBalance}
                variant="outline"
                icon={<RefreshCw size={16} />}
                loading={loading}
              >
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Account Balance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <DollarSign className="mr-2 text-success-500" size={20} />
                  Account Balance
                </h2>
                {balance ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ৳{balance.current_balance || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        balance.status === 'active' 
                          ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                          : 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
                      }`}>
                        {balance.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {loading ? 'Loading balance...' : 'Unable to load balance'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Tracking */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="mr-2 text-primary-500" size={20} />
                  Track Order
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Consignment ID
                    </label>
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="Enter consignment ID"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <Button
                    onClick={handleTrackOrder}
                    variant="primary"
                    fullWidth
                    loading={loading}
                    disabled={!trackingId.trim()}
                  >
                    Track Order
                  </Button>
                </div>
              </div>

              {/* Delivery Charge Calculator */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="mr-2 text-accent-500" size={20} />
                  Delivery Charge
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={chargeCalculation.city}
                      onChange={(e) => setChargeCalculation(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      COD Amount (৳)
                    </label>
                    <input
                      type="number"
                      value={chargeCalculation.codAmount}
                      onChange={(e) => setChargeCalculation(prev => ({ ...prev, codAmount: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={chargeCalculation.weight}
                      onChange={(e) => setChargeCalculation(prev => ({ ...prev, weight: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <Button
                    onClick={handleCalculateCharge}
                    variant="primary"
                    fullWidth
                    loading={loading}
                  >
                    Calculate Charge
                  </Button>
                </div>
              </div>
            </div>

            {/* Tracking Results */}
            {trackingResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Package className="mr-2 text-primary-500" size={20} />
                  Tracking Results
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Consignment ID</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trackingResult.consignment_id}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tracking Code</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trackingResult.tracking_code}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(trackingResult.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingResult.status)}`}>
                        {trackingResult.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Update</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trackingResult.last_update ? new Date(trackingResult.last_update).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  {trackingResult.delivery_fee && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Fee</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ৳{trackingResult.delivery_fee}
                      </p>
                    </div>
                  )}
                  {trackingResult.cod_fee && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">COD Fee</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ৳{trackingResult.cod_fee}
                      </p>
                    </div>
                  )}
                  {trackingResult.current_status && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {trackingResult.current_status}
                      </p>
                    </div>
                  )}
                </div>
                
                {trackingResult.status !== 'delivered' && trackingResult.status !== 'cancelled' && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={() => handleCancelOrder(trackingResult.consignment_id)}
                      variant="danger"
                      loading={loading}
                    >
                      Cancel Order
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Delivery Charge Results */}
            {deliveryCharge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <DollarSign className="mr-2 text-success-500" size={20} />
                  Delivery Charge Calculation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Delivery Fee</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ৳{deliveryCharge.delivery_fee}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">COD Fee</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ৳{deliveryCharge.cod_fee}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                    <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">Total Fee</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      ৳{deliveryCharge.total_fee}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* API Documentation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Steadfast API Integration Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Available Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center">
                      <CheckCircle className="text-success-500 mr-2" size={16} />
                      Create courier orders
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-success-500 mr-2" size={16} />
                      Track order status
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-success-500 mr-2" size={16} />
                      Calculate delivery charges
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-success-500 mr-2" size={16} />
                      Check account balance
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-success-500 mr-2" size={16} />
                      Cancel orders
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-success-500 mr-2" size={16} />
                      Bulk status checking
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Setup Requirements</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Steadfast merchant account</li>
                    <li>• API key and secret key</li>
                    <li>• Environment variables configured</li>
                    <li>• Sufficient account balance</li>
                    <li>• Valid recipient addresses</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CourierDetailsPage;