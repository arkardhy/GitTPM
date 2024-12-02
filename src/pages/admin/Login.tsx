import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../utils/storage';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '@T24n5_Kk') { // In a real app, use proper authentication
      storage.setAdminToken('dummy-token');
      navigate('/admin');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <img
            src="https://i.ibb.co/w0vWcwd/TANS-KOTA-KITA-4.png"
            alt="Trans Kota Kita Logo"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Trans Management System</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}