import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import BookForm from '../../components/admin/BookForm';
import { getBookById, updateBook } from '../../utils/firebase';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminEditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookData = await getBookById(id);
        setBook(bookData);
      } catch (error) {
        console.error('Error fetching book:', error);
        toast.error('Failed to load book details');
        navigate('/admin/books');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);

  const handleUpdateBook = async (bookData) => {
    try {
      await updateBook(id, bookData);
      return true;
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
      return false;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!book) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold font-heading mb-6 text-gray-900 dark:text-white">
          Edit Book
        </h1>
        
        <BookForm 
          initialData={book}
          onSubmit={handleUpdateBook}
          isEditing={true}
        />
      </div>
    </motion.div>
  );
};

export default AdminEditBookPage;