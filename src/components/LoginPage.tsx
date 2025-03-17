import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-[400px] bg-white p-8 rounded-lg shadow-md">
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
            />
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Skrái inn...' : 'Skrá inn'}
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