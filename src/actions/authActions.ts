// src/actions/authActions.ts
import { supabase } from '../lib/supabase';

export interface AuthState {
  error?: string;
  success?: boolean;
  timestamp?: number;
}

export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  // Attempt to authenticate with Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("AUTH ERROR:", error.message);
    return { error: 'Invalid login credentials. Please try again.' };
  }

  // Supabase automatically sets the session cookie/local storage on success
  return { 
    success: true, 
    timestamp: Date.now() 
  };
}