// src/pages/admin/LoginForm.tsx (or LoginPage.tsx)
import { useState, useActionState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAction } from '../../actions/authActions';

export default function LoginPage() {
  const navigate = useNavigate(); // 1. NEW: Initialize the router navigation
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. NEW: The Routing Interceptor
  // Watch the action state. The millisecond the backend reports "success", route the user.
  useEffect(() => {
    if (state?.success) {
      navigate('/admin/inventory'); // Redirect to your primary dashboard
    }
  }, [state?.success, navigate]);

  const handleAutoFill = () => {
    setEmail('demo@craftandbread.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 font-serif">Staff Portal</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your credentials to access the system.</p>
        </div>

        {/* The Demo Access Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-bold text-blue-900 mb-1">Demo Access</h3>
          <p className="text-xs text-blue-700 mb-3">
            Testing the system? Use our demo manager account to explore the dashboard.
          </p>
          <div className="flex flex-col gap-1 bg-white border border-blue-100 p-2 rounded text-sm font-mono text-gray-700 mb-3 shadow-inner">
            <span>Email: demo@craftandbread.com</span>
            <span>Pass: admin123</span>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-semibold py-2 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          >
            Click to Auto-Fill
          </button>
        </div>

        {/* Status Error Display */}
        {state?.error && (
          <div className="p-3 bg-red-50 text-red-800 text-sm border-l-4 border-red-600">
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 min-h-[44px]"
          >
            {isPending ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
      </div>
    </div>
  );
}