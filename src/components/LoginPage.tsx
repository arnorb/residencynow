import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading: authLoading, error: authError } = useAuth();

  // Apply the background color to the body when the component mounts
  useEffect(() => {
    // Save the original body background
    const originalBackground = document.body.style.background;
    
    // Apply gray background to the body
    document.body.style.background = 'rgb(243, 244, 246)'; // bg-gray-100 equivalent
    
    // Clean up when component unmounts
    return () => {
      document.body.style.background = originalBackground;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const result = await login(email, password);
      
      if (result) {
        // console.log("Login successful in LoginPage component");
        // Force a small delay to ensure state is updated
        setTimeout(() => {
          window.location.reload(); // Force reload to ensure proper state
        }, 500);
      }
    } catch (error) {
      console.error("Error in login process:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = authLoading || isSubmitting;
  const error = authError;

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Innskráning</h2>
          <p className="text-gray-600">Skráðu þig inn til að fá aðgang að kerfinu</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 text-sm rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Netfang
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="netfang@dæmi.is"
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Lykilorð
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Skrái inn...
                </span>
              ) : 'Skrá inn'}
            </Button>
          </div>
        </form>
        
        <p className="mt-6 text-sm text-center text-gray-500">
          Hafðu samband við stjórnanda ef þú þarft aðgang að kerfinu.
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 