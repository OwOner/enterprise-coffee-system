// src/actions/authActions.ts
import { supabase } from '../lib/supabase';

// Define the state interface for strict TypeScript adherence
export interface AuthState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  prevState: AuthState | null, 
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Both email and password are required for authorization.' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Transactional Error Mapping: Sanitize database/auth errors for the UI
    return { error: 'Invalid credentials. The vault remains locked.' };
  }

  // On success, the session is securely stored by the Supabase client.
  return { success: true };
}