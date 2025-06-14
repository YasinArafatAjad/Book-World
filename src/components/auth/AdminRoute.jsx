import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminRoute = () => {
  const { currentUser, isAdmin, isDeveloper, isModerator, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser || (!isAdmin && !isDeveloper && !isModerator)) {
    // Redirect to home page if not authenticated or not Admin/Moderator/Developer
    return <Navigate to="/\" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;