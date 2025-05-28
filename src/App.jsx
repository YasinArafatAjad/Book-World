import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from './contexts/ThemeContext';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Public Pages
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// User Dashboard Pages
import UserDashboardPage from './pages/user/UserDashboardPage';
import UserOrdersPage from './pages/user/UserOrdersPage';
import UserProfilePage from './pages/user/UserProfilePage';
import FavoritesPage from './pages/user/FavoritesPage';

// Admin Dashboard Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBooksPage from './pages/admin/AdminBooksPage';
import AdminAddBookPage from './pages/admin/AdminAddBookPage';
import AdminEditBookPage from './pages/admin/AdminEditBookPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

function App() {
  const location = useLocation();
  const { theme } = useTheme();
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={theme}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="books/:id" element={<BookDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            
            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="dashboard" element={<UserDashboardPage />} />
              <Route path="orders" element={<UserOrdersPage />} />
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="favorites" element={<FavoritesPage />} />
            </Route>
            
            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="admin/books" element={<AdminBooksPage />} />
              <Route path="admin/books/add" element={<AdminAddBookPage />} />
              <Route path="admin/books/edit/:id" element={<AdminEditBookPage />} />
              <Route path="admin/orders" element={<AdminOrdersPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;