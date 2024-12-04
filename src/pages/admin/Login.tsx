import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage';
import { verifyAdminPassword } from '../../utils/auth';
import { Lock } from 'lucide-react';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const isValid = await verifyAdminPassword(password);
      
      if (isValid) {
        storage.setAdminToken('authenticated');
        navigate('/admin');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#105283] text-white mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#105283]">
              Admin Portal
            </h2>
            <p className="mt-2 text-sm text-[#46525A]">
              Trans Management System
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#46525A]">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-[#46525A] placeholder-gray-400 shadow-sm focus:border-[#2D85B2] focus:ring-[#2D85B2] sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg border border-transparent bg-[#105283] px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#0A3B5C] focus:outline-none focus:ring-2 focus:ring-[#2D85B2] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}