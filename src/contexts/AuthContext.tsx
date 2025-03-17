import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getCurrentUser, signIn, signOut, supabase } from '../services/supabase';

// Define the context shape
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check for existing session on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // Get current session and user
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = await getCurrentUser();
        
        setUser(currentUser);
        console.log("Current auth state:", { currentUser, session });
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('Error checking authentication status');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log("Auth state changed:", event, session?.user);
        setUser(session?.user ?? null);
      }
    );
    
    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: authUser } = await signIn(email, password);
      setUser(authUser);
      
      if (!authUser) {
        throw new Error('Failed to sign in - no user returned');
      }
      
      console.log("Successfully logged in as:", authUser?.email);
      
    } catch (err: unknown) {
      console.error('Login error:', err);
      // Type guard for error with message property
      if (err instanceof Error) {
        setError(err.message || 'Failed to login');
      } else {
        setError('Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      console.log("Successfully logged out");
    } catch (err: unknown) {
      console.error('Logout error:', err);
      // Type guard for error with message property
      if (err instanceof Error) {
        setError(err.message || 'Failed to logout');
      } else {
        setError('Failed to logout');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext; 