import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import Button from './Button';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const BookCard = ({ book }) => {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(book);
    navigate('/cart')
    
    toast.success('Added to cart');
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

  // Default image if no imageUrl is provided
  const defaultImage = "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
  
  // Use the book's imageUrl if available, otherwise use the default image
  const imageUrl = book.imageUrl && book.imageUrl.trim() !== '' ? book.imageUrl : defaultImage;

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
      whileHover={{ y: -5 }}
    >
      <Link to={`/books/${book.id}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <img 
            src={imageUrl}
            alt={book.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = defaultImage;
            }}
          />
          <motion.button
            className={`absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md ${
              isFavorite(book.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            } transition-colors duration-200`}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleFavorite}
            aria-label={isFavorite(book.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={18} fill={isFavorite(book.id) ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {book.author}
          </p>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-primary-600 dark:text-primary-400 font-bold">
              ৳{book.price?.toFixed(2)}
            </p>
            <Button 
              size="sm"
              variant="primary"
              icon={<ShoppingCart size={16} />}
              onClick={handleAddToCart}
            >
              Add
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BookCard;