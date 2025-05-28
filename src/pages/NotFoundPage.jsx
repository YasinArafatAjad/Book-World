import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">
            404
          </h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              to="/"
              variant="primary"
              icon={<Home size={20} />}
            >
              Back to Home
            </Button>
            <Button
              to="/books"
              variant="outline"
              icon={<Search size={20} />}
            >
              Browse Books
            </Button>
          </div>

          <div className="mt-12">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? {' '}
              <Link
                to="/contact"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Contact our support team
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;