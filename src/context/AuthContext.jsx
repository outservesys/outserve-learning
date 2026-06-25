import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]       = useState(null);
  const [profile, setProfile]       = useState(null); // row from public.staff
  const [authLoading, setAuthLoading] = useState(true);

  // Fetch the staff profile linked to a Supabase auth user
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) { console.error('Profile fetch error:', error); return null; }
    return data;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      }
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  // Admin-only: create a new auth user + staff profile
  // Uses supabase-js signUp — the new user must confirm their email (or disable email confirmation in Supabase dashboard)
  const createAccount = async ({ name, email, password, role, dept, userType }) => {
    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, user_type: userType }, // stored in auth.users metadata
      },
    });
    if (authError) return { error: authError.message };

    const userId = authData.user?.id;
    if (!userId) return { error: 'Account created but user ID missing — check Supabase email confirmation settings.' };

    // 2. Create the staff profile row linked to the auth user
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const colors   = ['#00D4B8', '#9090FF', '#FFB432', '#FF7070', '#70D070', '#FF9F50', '#50C8FF', '#FF6EB4'];
    const color    = colors[Math.floor(Math.random() * colors.length)];

    const { data: staffRow, error: staffError } = await supabase
      .from('staff')
      .insert([{
        user_id:  userId,
        name,
        role,
        dept,
        email,
        avatar:   initials,
        color,
        is_admin: userType === 'admin',
      }])
      .select()
      .single();

    if (staffError) return { error: staffError.message };
    return { data: staffRow };
  };

  const isAdmin = profile?.is_admin === true;

  return (
    <AuthContext.Provider value={{
      session, profile, authLoading, isAdmin,
      signIn, signOut, createAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
