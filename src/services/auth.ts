import { supabase, isLiveSupabaseConfigured } from '../config/supabase';
import { Profile, UserRole } from '../types';

export interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  error: string | null;
}

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const sanitizeAuthError = (errorMessage?: string): string => {
  if (!errorMessage) return 'An unexpected error occurred. Please try again.';
  const msg = errorMessage.toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Invalid email or password. Please verify your credentials.';
  }
  if (msg.includes('user already registered') || msg.includes('already registered')) {
    return 'An account with this email already exists.';
  }
  if (msg.includes('rate limit')) {
    return 'Too many requests. Please wait a few moments and try again.';
  }
  if (msg.includes('password should be at least')) {
    return 'Password must be at least 6 characters.';
  }
  return errorMessage;
};

export const signUpWithSupabase = async (
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<{ user: Profile | null; error: string | null }> => {
  const cleanEmail = email.trim();
  const cleanName = name.trim();

  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return { user: null, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { user: null, error: 'Password must be at least 6 characters.' };
  }
  if (!cleanName) {
    return { user: null, error: 'Please enter your full name.' };
  }

  if (isLiveSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: cleanName,
          role,
        },
      },
    });

    if (error) {
      return { user: null, error: sanitizeAuthError(error.message) };
    }

    if (data.user) {
      const profile: Profile = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        name: cleanName,
        role,
        status: 'active',
      };
      return { user: profile, error: null };
    }
  }

  // Fallback demo signup
  const newProfile: Profile = {
    id: `u_${Math.random().toString(36).substring(2, 9)}`,
    email: cleanEmail,
    name: cleanName,
    role,
    status: 'active',
  };
  return { user: newProfile, error: null };
};

export const signInWithSupabase = async (
  email: string,
  password: string
): Promise<{ user: Profile | null; error: string | null }> => {
  const cleanEmail = email.trim();

  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return { user: null, error: 'Please enter a valid email address.' };
  }
  if (!password) {
    return { user: null, error: 'Please enter your password.' };
  }

  if (isLiveSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { user: null, error: sanitizeAuthError(error.message) };
    }

    if (data.user) {
      // Fetch profile from database
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const profile: Profile = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        name: profileData?.name || data.user.user_metadata?.name || cleanEmail.split('@')[0],
        role: profileData?.role || data.user.user_metadata?.role || 'student',
        status: profileData?.status || 'active',
        instituteId: profileData?.institute_id,
      };

      return { user: profile, error: null };
    }
  }

  return { user: null, error: 'User not found' };
};

export const resetPasswordWithSupabase = async (
  email: string
): Promise<{ success: boolean; error: string | null }> => {
  const cleanEmail = email.trim();
  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (isLiveSupabaseConfigured()) {
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
    if (error) return { success: false, error: sanitizeAuthError(error.message) };
    return { success: true, error: null };
  }
  return { success: true, error: null };
};

export const signOutWithSupabase = async (): Promise<void> => {
  if (isLiveSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
};
