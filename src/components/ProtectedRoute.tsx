import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from './LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Show a loading state while checking authentication
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-10 bg-background/50">
        <div className="w-12 h-12 border-2 border-t-black border-gray-200 rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, show the login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Otherwise, render the children (the protected content)
  return <>{children}</>;
};

export default ProtectedRoute; 