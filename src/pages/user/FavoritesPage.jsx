import { motion } from 'framer-motion';
import { useFavorites } from '../../contexts/FavoritesContext';
import BookCard from '../../components/ui/BookCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Heart } from 'lucide-react';
import Button from '../../components/ui/Button';

const FavoritesPage = () => {
  const { favorites, loading } = useFavorites();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Your Favorites
        </h1>

        {favorites.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {favorites.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
          >
            <Heart className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start adding books to your favorites list!
            </p>
            <Button to="/books" variant="primary">
              Browse Books
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;