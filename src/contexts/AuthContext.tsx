import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthChangeEvent, AuthError } from '@supabase/supabase-js';
import { signOut, supabase } from '../services/supabase';

// Define the context shape
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  session: Session | null;
  sessionExpiry: Date | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  session: null,
  sessionExpiry: null,
  login: async () => null,
  logout: async () => {},
  isAuthenticated: false,
});

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session monitoring function
  const monitorSession = (currentSession: Session | null) => {
    if (currentSession) {
      const expiryTime = new Date(currentSession.expires_at! * 1000);
      setSessionExpiry(expiryTime);

      // Set up auto-refresh 5 minutes before expiry
      const timeUntilExpiry = expiryTime.getTime() - Date.now();
      const refreshBuffer = 5 * 60 * 1000; // 5 minutes
      
      if (timeUntilExpiry > refreshBuffer) {
        const refreshTimeout = setTimeout(async () => {
          try {
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) throw refreshError;
            if (refreshedSession) {
              setSession(refreshedSession);
              setUser(refreshedSession.user);
              monitorSession(refreshedSession);
            }
          } catch (err) {
            console.error('Session refresh failed:', err);
            await handleAuthError(err as Error);
          }
        }, timeUntilExpiry - refreshBuffer);

        return () => clearTimeout(refreshTimeout);
      }
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      setSession(null);
      setSessionExpiry(null);
    } catch (err: unknown) {
      console.error('Logout error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to logout');
      } else {
        setError('Failed to logout');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle session expiration or auth errors
  const handleAuthError = async (error: Error | AuthError) => {
    if (
      error?.message?.includes('JWT') || 
      error?.message?.includes('session') || 
      error?.message?.includes('token') ||
      (error as AuthError)?.code === 'PGRST301'
    ) {
      console.warn('Session expired or invalid, logging out...', error);
      await logout();
      setError('Innskráning er útrunnin, vinsamlegast skráðu þig inn aftur.');
    }
  };
  
  // Check for existing session on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // Get current session and user
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          await handleAuthError(sessionError);
          return;
        }
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          monitorSession(currentSession);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        if (err instanceof Error) {
          await handleAuthError(err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setSessionExpiry(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            monitorSession(newSession);
          }
        }
        setLoading(false);
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
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        throw signInError;
      }
      
      if (!data || !data.user) {
        throw new Error('Failed to sign in - no user returned');
      }
      
      // Set the session and user from the response
      setSession(data.session);
      setUser(data.user);
      
      // Start monitoring the new session
      if (data.session) {
        monitorSession(data.session);
      }
      
      return data.user;
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to login');
      } else {
        setError('Failed to login');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    user,
    loading,
    error,
    session,
    sessionExpiry,
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