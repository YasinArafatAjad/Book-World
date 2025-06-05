import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book,
  ShoppingCart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Search,
  Home,
  BookOpen,
  Info,
  Mail,
  ShoppingBag,
  LayoutDashboard,
  Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getSiteSettings } from '../../utils/firebase';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const { currentUser, logout, isAdmin, isDeveloper, isModerator } = useAuth();
  const { cart } = useCart();
  const { toggleTheme, isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add scroll lock effect
  useEffect(() => {
    if (isMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Add styles to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scrolling
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${searchQuery}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Books', path: isAdmin || isDeveloper || isModerator ? '/admin/books' : '/books', icon: <BookOpen size={20} /> },
    { name: 'About', path: '/about', icon: <Info size={20} /> },
    { name: 'Contact', path: '/contact', icon: <Mail size={20} /> },
  ];

  const userLinks = [
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Dashboard', path: isAdmin || isDeveloper || isModerator ? "/admin" : "/dashboard", icon: <LayoutDashboard /> },
    { name: 'Orders', path: isAdmin || isDeveloper || isModerator ? '/admin/orders' : '/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Favorites', path: '/favorites', icon: <Heart size={20} /> },
  ];

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: "afterChildren"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren"
      }
    }
  };

  const menuItemVariants = {
    closed: {
      x: -20,
      opacity: 0
    },
    open: {
      x: 0,
      opacity: 1
    }
  };


  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled
        ? 'bg-white dark:bg-gray-900 shadow-md'
        : 'bg-transparent'
        } transition-all ease-linear duration-200`}
    >

      <div className="container mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between gap-20 ">
          {/* logo */}
          <div className="logo">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt="Book World" className="h-20 w-20 object-contain" />
                  <span className="text-xl font-heading font-bold text-black dark:text-white">
                    Book World
                  </span>
                </>
              ) : (
                <>
                  <Book className="h-8 w-8 text-primary-500" />
                  <span className="text-xl font-heading font-bold text-black">
                    Book World
                  </span>
                </>
              )}
            </Link>
          </div>
          {/* Desktop  */}
          {/* Header Item  */}
          <div className="headerItem">
            <nav className="hidden md:flex items-center justify-end flex-wrap gap-4">
              {/* Nav Links */}
              {[...navLinks, ...userLinks].map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-base font-medium transition-colors duration-200 hover:text-primary-600 ${isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              {/* Header Action */}
              <form
                onSubmit={handleSearch}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 py-2 px-4 pr-10 rounded-full text-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              </form>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun size={20} className="text-amber-400" />
                ) : (
                  <Moon size={20} className="text-gray-700" />
                )}
              </button>
              {currentUser && (<Link
                to="/cart"
                className={`${isAdmin || isDeveloper || isModerator ? 'hidden' : ''} p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 relative transition-colors duration-200`}
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={20} className="text-gray-700 dark:text-gray-300" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>)}
              {currentUser ? (
                <Link
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 relative transition-colors duration-200`}
                  aria-label="Shopping Cart"
                >
                  <LogOut size={20} className="text-gray-700 dark:text-gray-300" />
                </Link>
              ) : (
                <div className="flex gap-4">
                  <Link
                    to="/login"
                    className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </nav>
            <div className="flex items-center space-x-4 md:hidden">
              {currentUser && (
                <Link
                  to="/cart"
                  className={`${isAdmin || isDeveloper || isModerator ? 'hidden' : ''} p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 relative transition-colors duration-200`}
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart size={20} className="text-gray-700 dark:text-gray-300" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={24} className="text-gray-700 dark:text-gray-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={24} className="text-gray-700 dark:text-gray-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg overflow-y-auto max-h-[calc(100vh-4rem)]"
          >
            <div className="container mx-auto px-4 py-4">
              {/* search bar */}
              <motion.form
                variants={menuItemVariants}
                onSubmit={handleSearch}
                className="mb-6"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 px-4 pr-10 rounded-lg text-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </motion.form>
              {/* nav link */}
              <nav className="space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    variants={menuItemVariants}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
              {/* userLink */}
              <motion.div
                variants={menuItemVariants}
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                {currentUser ? (
                  <div className="space-y-2">
                    {userLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.icon}
                        <span>{link.name}</span>
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                    >
                      <LogOut size={20} />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </motion.div>
              {/* darkmode toggle */}
              <motion.div
                variants={menuItemVariants}
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full mb-44"
                >
                  {isDarkMode ? (
                    <>
                      <Sun size={20} className="text-amber-400" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon size={20} />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;