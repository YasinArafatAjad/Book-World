import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { getBookById } from '../utils/firebase';
import { useCart } from '../contexts/CartContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AnimatedDescription from '../components/ui/AnimatedDescription';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';

const BookDetailPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookData = await getBookById(id);
        setBook(bookData);
      } catch (error) {
        console.error('Error fetching book:', error);
        toast.error('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleAddToCart = () => {
    addItem(book, quantity);
    toast.success('Book added to cart');
    navigate('/cart')

    if (!currentUser) {
      console.log('Please sign in to add to cart');
      navigate('/login')
      return;
    }
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      console.log('Please sign in to add favorites');
      navigate('/login')
      return;
    }

    const success = await toggleFavorite(book);
    if (success) {
      toast.success(isFavorite(book.id) ? 'Removed from favorites' : 'Added to favorites');
    } else {
      toast.error('Failed to update favorites');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Book not found
          </h2>
          <Link
            to="/books"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Browse other books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <Link
          to="/books"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Books
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Book Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <img
                src={book.imageUrl || "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                alt={book.title}
                className="w-full h-[500px] object-cover rounded-lg"
              />
              <motion.button
                className={`absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md ${isFavorite(book.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  } transition-colors duration-200`}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleFavorite}
                aria-label={isFavorite(book.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={18} fill={isFavorite(book.id) ? 'currentColor' : 'none'} />
              </motion.button>
            </motion.div>

            {/* Book Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                by {book.author}
              </p>

              <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4 mb-6">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  ৳{book.price?.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {book.stock > 0 ? (
                    <span className="text-success-600 dark:text-success-400">
                      In Stock ({book.stock} available)
                    </span>
                  ) : (
                    <span className="text-error-600 dark:text-error-400">
                      Out of Stock
                    </span>
                  )}
                </p>
              </div>

              <div className="mb-6">
                <AnimatedDescription text={book.description} maxLength={300} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {book.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ISBN</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {book.isbn || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Publisher</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {book.publisher || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pages</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {book.pages || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex items-center gap-4 mb-4">
                  <label htmlFor="quantity" className="sr-only">
                    Quantity
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="rounded-md border border-gray-300 dark:border-gray-700 py-2 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={handleAddToCart}
                    variant="primary"
                    size="lg"
                    icon={<ShoppingCart size={20} />}
                    fullWidth
                    disabled={!book.stock}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;