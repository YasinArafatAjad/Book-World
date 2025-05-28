import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import BookForm from '../../components/admin/BookForm';
import { addBook } from '../../utils/firebase';

const AdminAddBookPage = () => {
  const navigate = useNavigate();

  const handleAddBook = async (bookData) => {
    try {
      await addBook(bookData);
      return true;
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book');
      return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold font-heading mb-6 text-gray-900 dark:text-white">
          Add New Book
        </h1>
        
        <BookForm onSubmit={handleAddBook} />
      </div>
    </motion.div>
  );
};

export default AdminAddBookPage;