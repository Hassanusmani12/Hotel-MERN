import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * useRequireAuth - Hook for components that need to require authentication
 * before allowing an action (e.g., "Book Now" button)
 * 
 * Usage:
 * const requireAuth = useRequireAuth();
 * 
 * const handleBooking = () => {
 *   if (!requireAuth()) return; // Redirects to login if not authenticated
 *   // Proceed with booking...
 * };
 */
export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (message = 'Please log in to continue') => {
    if (!isAuthenticated) {
      toast.warning(message);
      navigate('/login', { replace: true });
      return false;
    }
    return true;
  };
};

export default useRequireAuth;
