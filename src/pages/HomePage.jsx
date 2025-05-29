import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Award, Truck } from 'lucide-react';
import { collection, getDocs, query, limit, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import Button from '../components/ui/Button';
import BookCard from '../components/ui/BookCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch featured books
        const featuredQuery = query(
          collection(db, 'books'),
          where('featured', '==', true),
          limit(4)
        );

        // Fetch new releases
        const newReleasesQuery = query(
          collection(db, 'books'),
          orderBy('createdAt', 'desc'),
          limit(4)
        );

        const [featuredSnapshot, newReleasesSnapshot] = await Promise.all([
          getDocs(featuredQuery),
          getDocs(newReleasesQuery)
        ]);

        const featuredData = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const newReleasesData = newReleasesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setFeaturedBooks(featuredData);
        setNewReleases(newReleasesData);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/60 z-10" />
          <img
            src="https://images.pexels.com/photos/1106468/pexels-photo-1106468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Library shelves filled with books"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-white"
          >
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Discover Your Next
              <span className="text-primary-400"> Favorite Book</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200">
              From bestsellers to rare finds, we have everything for book lovers.
              Start your reading journey with us today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                to="/books"
                size="lg"
                variant="primary"
                icon={<BookOpen size={20} />}
              >
                Explore Books
              </Button>
              <Button
                to="/about"
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Books Section */}
      {featuredBooks.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-heading font-bold text-gray-900 dark:text-white"
              >
                Featured Books
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  to="/books"
                  className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  View All
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </motion.div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredBooks.map(book => (
                <motion.div key={book.id} variants={itemVariants}>
                  <BookCard book={book} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}
   {/* New Releases Section */}
      {newReleases.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-heading font-bold text-gray-900 dark:text-white"
              >
                New Releases
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  to="/books"
                  className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  View All
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </motion.div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {newReleases.map(book => (
                <motion.div key={book.id} variants={itemVariants}>
                  <BookCard book={book} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-heading font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            Why Choose Book World
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-lg"
            >
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Curated Selection</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Handpicked books from various genres to ensure quality and diversity in your reading.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center p-6 rounded-lg"
            >
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Expert Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get personalized book recommendations from our team of literary experts.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center text-center p-6 rounded-lg"
            >
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Quick and reliable shipping to get your books to you as soon as possible.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary-700 dark:bg-primary-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-heading font-bold text-white mb-4"
            >
              Stay Updated with Book World
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-primary-100 mb-8"
            >
              Subscribe to our newsletter for new releases, reading recommendations, and exclusive offers.
            </motion.p>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                required
              />
              <Button type="submit" variant="accent" size="lg">
                Subscribe
              </Button>
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;