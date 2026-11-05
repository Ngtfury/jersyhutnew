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

    // 1. Try standard Supabase client signup
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: metadata,
      },
    });

    if (!error && data?.session) {
      setSession(data.session);
      setUser(data.user);
      return { data, error: null };
    }

    // 2. If client signup encounters an email sending failure (common with unverified Resend domains)
    // seamlessly fall back to the server-side auto-confirm registration endpoint
    if (error && (
      error.message?.toLowerCase().includes('confirmation email') ||
      error.message?.toLowerCase().includes('email') ||
      error.status === 500
    )) {
      try {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password,
            metadata
          })
        });

        const regData = await regRes.json();

        if (regRes.ok && regData.success) {
          // Sign in the newly created, auto-confirmed user to establish active session
          const signInRes = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });

          if (!signInRes.error && signInRes.data?.session) {
            setSession(signInRes.data.session);
            setUser(signInRes.data.user);
            return { data: signInRes.data, error: null };
          }
        } else if (regData.error) {
          return { data: null, error: new Error(regData.error) };
        }
      } catch (fallbackErr) {
        console.warn('Fallback server registration error:', fallbackErr);
      }
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
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
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

