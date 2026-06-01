// src/pages/admin/LoginForm.tsx
import { useActionState, useEffect } from 'react';
import { loginAction } from '../../actions/authActions';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  // In a real application, you would use a router (like React Router) 
  // to redirect the user upon successful authentication.
  useEffect(() => {
    if (state?.success) {
      console.log('Authentication successful. Redirecting to Dashboard...');
      // e.g., navigate('/admin/dashboard');
    }
  }, [state?.success]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            Staff Portal
          </h1>
          <p className="text-sm text-gray-500">
            Authorized personnel only.
          </p>
        </div>

        {/* Transactional Error Mapping: Toast/Alert Display */}
        {state?.error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm font-medium rounded-r-md">
            {state.error}
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-6">
          {/* Email Input Group */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Employee Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={isPending}
              autoComplete="email"
              className="min-h-[48px] w-full px-4 rounded-md border border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            />
          </div>

          {/* Password Input Group */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Secure Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              disabled={isPending}
              autoComplete="current-password"
              className="min-h-[48px] w-full px-4 rounded-md border border-gray-300 bg-white text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            />
          </div>

          {/* Submit Action - Double Submission Prevention Guard */}
          <button
            type="submit"
            disabled={isPending}
            className="min-h-[48px] mt-2 w-full flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-white font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Authenticating...' : 'Access Terminal'}
          </button>
        </form>
        
      </div>
    </div>
  );
}