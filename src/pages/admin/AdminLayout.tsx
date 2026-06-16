// src/pages/admin/AdminLayout.tsx
import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // 1. Check active session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsVerifying(false);
    });

    // 2. Set up a listener for auth state changes (e.g., token expiration or logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/admin/login', { replace: true });
      }
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    // Cryptographically destroy the session in the Supabase engine
    await supabase.auth.signOut();
  };

  // The Vault Guard: Block rendering until verification is complete
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Verifying security clearance...</p>
      </div>
    );
  }

  // The Ejection Seat: No token? Back to the login screen immediately.
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // If the engine reaches here, the user is authorized. Render the secure layout.
  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50">
      <header className="w-full bg-gray-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-8">
              <span className="font-bold text-lg tracking-wide">
                SYSTEM<span className="text-blue-400">CORE</span>
              </span>
              
              <nav className="hidden md:flex gap-4">
                <NavLink 
                  to="/admin/inventory"
                  className={({ isActive }) => `
                    min-h-[44px] flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                  `}
                >Catalog Builder {/* Renamed for clarity */}
  </NavLink>
  
  <NavLink 
    to="/admin/stock"
    className={({ isActive }) => `
      min-h-[44px] flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
    `}
  >
    BOH Stockroom {/* NEW WORKER LINK */}
  </NavLink>
                <NavLink 
                  to="/admin/ledger"
                  className={({ isActive }) => `
                    min-h-[44px] flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                  `}
                  
                >
                  General Ledger
                </NavLink>
              </nav>
            </div>

          <div className="flex items-center gap-4">
  {/* The Escape Hatch: View the public storefront */}
  <a 
    href="/" 
    target="_blank" 
    rel="noopener noreferrer"
    className="hidden sm:flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
  >
    View Storefront ↗
  </a>

  {/* Display the active user's email */}
  <span className="text-xs text-gray-400 font-mono hidden md:block border-l border-gray-700 pl-4">
    {session.user.email}
  </span>

  <button
    onClick={handleLogout}
    type="button"
    className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ml-2"
  >
    Sign Out
  </button>
</div>

          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}