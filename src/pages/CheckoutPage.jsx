import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, MapPin } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../utils/firebase';
import { calculateCartTotals } from '../utils/cartCalculations';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { courierCharge, codFee, total } = calculateCartTotals(cartTotal);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          title: item.title,
          author: item.author,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        total,
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone
        },
        status: 'pending'
      };

      await createOrder(currentUser.uid, orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      if (error.message === 'DUPLICATE_ORDER') {
        toast.error('Similar order detected within the last hour. Please wait before placing identical orders.');
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Your cart is empty
            </h2>
            <Button to="/books" variant="primary">
              Browse Books
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="For delivery contact"
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <MapPin className="mr-2" size={20} />
                    Delivery Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Payment Method
                  </h2>
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg">
                    <p className="text-primary-700 dark:text-primary-300 font-medium">
                      Cash on Delivery
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Pay with cash when your order arrives
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                >
                  Place Order (৳{total.toFixed(2)})
                </Button>
              </form>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4">
                      <img
                        src={item.imageUrl || "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Subtotal</span>
                      <span>৳{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Delivery Charge</span>
                      <span>৳{courierCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>COD Fee</span>
                      <span>৳{codFee}</span>
                    </div>
                    <div className="flex justify-between text-lg font-medium text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span>Total</span>
                      <span>৳{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Truck className="mr-2" size={16} />
                      Estimated delivery: 3-5 business days
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;