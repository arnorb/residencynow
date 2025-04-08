import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from './LoginPage';
import { supabase } from '../services/supabase';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);

  // Check for any existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if there's a session with Supabase
        await supabase.auth.getSession();
        
        setSessionChecked(true);
      } catch (error) {
        console.error('Error checking session:', error);
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, []);

  // Show a loading state while checking authentication
  if (loading || !sessionChecked) {
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