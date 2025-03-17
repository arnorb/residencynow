import { ReactNode, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from './LoginPage';
import { supabase } from '../services/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Log authentication state for debugging
  useEffect(() => {
    const checkAuthState = async () => {
      // Check if there's a session with Supabase
      const { data: { session } } = await supabase.auth.getSession();
      console.log('ProtectedRoute auth state:', { 
        isAuthenticated, 
        loading, 
        hasUser: !!user,
        hasSession: !!session 
      });
    };
    
    checkAuthState();
  }, [isAuthenticated, loading, user]);

  // Show a loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-medium text-gray-600">Hleð inn...</p>
          <p className="text-sm text-gray-500 mt-2">Athuga auðkenningu...</p>
        </div>
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