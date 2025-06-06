import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { getSiteSettings } from '../../utils/firebase';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [logoUrl, setLogoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSiteSettings();
        if (settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate newsletter subscription (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Thank you for subscribing to our newsletter!');
      setEmail(''); // Clear the email field
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt="Book World" className="h-20 w-20 object-contain" />
                  <span className="text-xl font-heading font-bold text-white">
                    Book World
                  </span>
                </>
              ) : (
                <>
                  <Book className="h-8 w-8 text-primary-500" />
                  <span className="text-xl font-heading font-bold text-white">
                    Book World
                  </span>
                </>
              )}
            </Link>

            <p className="text-sm mb-4">
              Your premier destination for quality books, from bestsellers to rare finds.
              We believe in the power of stories to inspire, educate, and transform lives.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com/Ayatsbook" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              {/* <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="Instagram">
                <Instagram size={20} />
              </a> */}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors duration-200">Home</Link>
              </li>
              <li>
                <Link to="/books" className="hover:text-primary-400 transition-colors duration-200">All Books</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-400 transition-colors duration-200">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-400 transition-colors duration-200">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="hover:text-primary-400 transition-colors duration-200">Shipping Policy</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary-400 transition-colors duration-200">Returns & Refunds</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary-400 transition-colors duration-200">FAQ</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary-400 transition-colors duration-200">Privacy Policy</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary-400 transition-colors duration-200">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold text-lg mb-4">Subscribe to our Newsletter</h3>
            <p className="text-sm mb-4">
              Stay updated with new releases, exclusive offers, and literary events.
            </p>
            <form className="mt-4" onSubmit={handleNewsletterSubmit}>
              <div className="flex flex-col space-y-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-white text-sm"
                  required
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors duration-200 rounded-md text-white text-sm font-medium flex items-center justify-center"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subscribing...
                    </div>
                  ) : (
                    <>
                      <Mail size={16} className="mr-2" />
                      Subscribe
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm">
          <p>&copy; {currentYear} Book World. All rights reserved.</p>
        </div>
        <div className="pt-2 text-center text-md">
          <p>Developed by <a href="https://facebook.com/yasinarafatajad" className="text-primary-600">Yasin Arafat Ajad</a>.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;