import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Upload, X, Book } from 'lucide-react';
import Button from '../ui/Button';
import { uploadImage } from '../../utils/cloudinary';

const categories = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Biography',
  'History',
  'Self-Help',
  'Children',
  'Young Adult',
  'Fantasy',
  'Horror',
  'Business'
];

const BookForm = ({ initialData = {}, onSubmit, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
    isbn: '',
    publisher: '',
    publishedDate: '',
    pages: '',
    language: 'English',
    featured: false,
    stock: 1,
    ...initialData
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    if (initialData.imageUrl) {
      setImagePreview(initialData.imageUrl);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? '' : Number(value);
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, JPG, PNG, GIF)');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    
    if (errors.imageUrl) {
      setErrors(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    
    setIsUploading(true);
    try {
      const data = await uploadImage(imageFile);
      if (!data || !data.url) {
        throw new Error('Failed to get image URL from server');
      }
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!imagePreview && !formData.imageUrl) newErrors.imageUrl = 'Book cover image is required';
    if (formData.pages && (formData.pages < 1 || !Number.isInteger(Number(formData.pages)))) {
      newErrors.pages = 'Pages must be a positive integer';
    }
    if (formData.stock && (formData.stock < 0 || !Number.isInteger(Number(formData.stock)))) {
      newErrors.stock = 'Stock must be a non-negative integer';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    setLoading(true);
    
    try {
      let imageUrl = formData.imageUrl;
      
      // Upload new image if one was selected
      if (imageFile) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) {
          throw new Error('Failed to upload image');
        }
      }
      
      const processedData = {
        ...formData,
        imageUrl, // Include the image URL in the data
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        pages: formData.pages ? parseInt(formData.pages) : null
      };
      
      await onSubmit(processedData);
      
      toast.success(isEditing ? 'Book updated successfully' : 'Book added successfully');
      
      navigate('/admin/books');
    } catch (error) {
      console.error('Error submitting book:', error);
      toast.error(isEditing ? 'Failed to update book' : 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
    >
      <h2 className="text-2xl font-heading font-bold mb-6 text-gray-900 dark:text-white">
        {isEditing ? 'Edit Book Details' : 'Add New Book'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Book Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full rounded-md border ${
                errors.title ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'
              } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
              placeholder="Enter book title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-error-500">{errors.title}</p>
            )}
          </div>
          
          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Author *
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className={`w-full rounded-md border ${
                errors.author ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'
              } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
              placeholder="Enter author name"
            />
            {errors.author && (
              <p className="mt-1 text-sm text-error-500">{errors.author}</p>
            )}
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full rounded-md border ${
                errors.category ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'
              } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-error-500">{errors.category}</p>
            )}
          </div>
          
          {/* Price and Stock row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (৳) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleNumberChange}
                step="0.01"
                min="0"
                className={`w-full rounded-md border ${
                  errors.price ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'
                } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                placeholder="19.99"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-error-500">{errors.price}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleNumberChange}
                min="0"
                className={`w-full rounded-md border ${
                  errors.stock ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'
                } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                placeholder="10"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-error-500">{errors.stock}</p>
              )}
            </div>
          </div>
          
          {/* ISBN and Pages row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ISBN
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="978-3-16-148410-0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pages
              </label>
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={handleNumberChange}
                min="1"
                className={`w-full rounded-md border ${
                  errors.pages ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'
                } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                placeholder="300"
              />
              {errors.pages && (
                <p className="mt-1 text-sm text-error-500">{errors.pages}</p>
              )}
            </div>
          </div>
          
          {/* Featured Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Feature this book on the homepage
            </label>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Book Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Book Cover Image *
            </label>
            <div className={`relative border-2 border-dashed rounded-lg p-4 ${
              errors.imageUrl ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'
            } ${imagePreview ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800'}`}>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Book cover preview"
                    className="w-full h-64 object-contain mx-auto"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={18} className="text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <Book size={48} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Drag and drop an image or click to browse
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    icon={<Upload size={16} />}
                  >
                    Upload Image
                  </Button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ height: '256px' }}
              />
            </div>
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-error-500">{errors.imageUrl}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              className={`w-full rounded-md border ${
                errors.description ? 'border-error-500' : 'border-gray-300 dark:border-gray-700'
              } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
              placeholder="Enter book description"
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-error-500">{errors.description}</p>
            )}
          </div>
          
          {/* Publisher and Published Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Publisher name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Published Date
              </label>
              <input
                type="date"
                name="publishedDate"
                value={formData.publishedDate}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/admin/books')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading || isUploading}
          disabled={loading || isUploading}
        >
          {isEditing ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </motion.form>
  );
};

export default BookForm;