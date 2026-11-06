'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // 1. Get initial active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!error && session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    }).catch(err => {
      console.warn('Initial session fetch failed:', err);
      setLoading(false);
    });

    // 2. Subscribe to auth state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email, password) => {
    if (!supabase) return { data: null, error: new Error('Supabase client is not initialized') };
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (!error && data?.session) {
      setSession(data.session);
      setUser(data.user);
    }
    return { data, error };
  };

  const signUpWithEmail = async (email, password, metadata = {}) => {
    if (!supabase) return { data: null, error: new Error('Supabase client is not initialized') };

    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/login?notice=verified`
      : undefined;

    // Standard Supabase signup — sends confirmation email to verify user
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: metadata,
        emailRedirectTo: redirectUrl,
      },
    });

    if (!error && data?.session) {
      setSession(data.session);
      setUser(data.user);
    }

    return { data, error };
  };

  const signOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const resendVerification = async (email) => {
    if (!supabase) throw new Error('Supabase is not configured');
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/login?notice=verified`
      : undefined;
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: redirectUrl,
      }
    });
    if (error) throw error;
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

