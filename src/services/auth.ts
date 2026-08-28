import { supabase, isLiveSupabaseConfigured } from '../config/supabase';
import { Profile, UserRole } from '../types';

export interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  error: string | null;
}

export const signUpWithSupabase = async (
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<{ user: Profile | null; error: string | null }> => {
  if (isLiveSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      const profile: Profile = {
        id: data.user.id,
        email: data.user.email || email,
        name,
        role,
        status: 'active',
      };
      return { user: profile, error: null };
    }
  }

  // Fallback demo signup
  const newProfile: Profile = {
    id: `u_${Math.random().toString(36).substring(2, 9)}`,
    email,
    name,
    role,
    status: 'active',
  };
  return { user: newProfile, error: null };
};

export const signInWithSupabase = async (
  email: string,
  password: string
): Promise<{ user: Profile | null; error: string | null }> => {
  if (isLiveSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
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
        email: data.user.email || email,
        name: profileData?.name || data.user.user_metadata?.name || email.split('@')[0],
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
  if (isLiveSupabaseConfigured()) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  }
  return { success: true, error: null };
};

export const signOutWithSupabase = async (): Promise<void> => {
  if (isLiveSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
};
