'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Lock, 
  Mail, 
  KeyRound, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShoppingBag,
  LogOut,
  ArrowRight
} from 'lucide-react';

export default function AccountModal({ isOpen, onClose }) {
  const { user, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const { openCart, totalCount } = useCart();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const { data, error } = await signInWithEmail(email, password);
        if (error) {
          const msg = error.message || '';
          if (msg.toLowerCase().includes('invalid login credentials')) {
            setErrorMsg('Invalid email or password. If you do not have an account, click Register.');
          } else if (msg.toLowerCase().includes('email not confirmed')) {
            setErrorMsg('Email verification pending. Please check your inbox.');
          } else {
            setErrorMsg(msg || 'Authentication failed.');
          }
          setSubmitting(false);
          return;
        }

        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 800);
      } else {
        const { data, error } = await signUpWithEmail(email, password, {
          full_name: fullName.trim() || undefined
        });

        if (error) {
          const msg = error.message || '';
          if (msg.toLowerCase().includes('user already registered')) {
            setErrorMsg('Account exists with this email. Please sign in.');
            setMode('signin');
          } else {
            setErrorMsg(msg || 'Registration failed.');
          }
          setSubmitting(false);
          return;
        }

        if (data?.session) {
          setSuccessMsg('Account created and logged in!');
          setTimeout(() => {
            setSuccessMsg('');
            onClose();
          }, 800);
        } else {
          setSuccessMsg('Account created! Please check your email to verify before signing in.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 260,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0f0f11',
          border: '1px solid #27272a',
          width: '100%',
          maxWidth: '430px',
          padding: '2.5rem 2rem',
          position: 'relative',
          color: '#fff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          borderRadius: '12px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', cursor: 'pointer', background: 'none', border: 'none', color: '#a1a1aa' }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {user ? (
          /* User Profile View */
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#4ade80' }}>
              <User size={28} />
            </div>

            <span style={{ fontSize: '0.6875rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 700 }}>
              MATCHDAY MEMBER
            </span>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0.35rem 0' }}>
              {user.user_metadata?.full_name || 'Football Enthusiast'}
            </h3>

            <p style={{ fontSize: '0.8125rem', color: '#71717a', margin: '0 0 1.75rem', wordBreak: 'break-all' }}>
              {user.email}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { onClose(); openCart(); }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <ShoppingBag size={16} />
                <span>Open Your Bag ({totalCount})</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  backgroundColor: 'transparent',
                  border: '1px solid #3f3f46',
                  color: '#f87171',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Register View */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.6875rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 700 }}>
                MATCHDAY MEMBER ACCESS
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0.35rem 0 0.2rem' }}>
                {mode === 'signin' ? 'Sign In To Matchday' : 'Join The Club'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#71717a', margin: 0 }}>
                {mode === 'signin' ? 'Access your private bag and orders.' : 'Create an account to save your favorite kits.'}
              </p>
            </div>

            {/* Toggle Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '6px', padding: '3px', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  padding: '0.55rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: mode === 'signin' ? '#27272a' : 'transparent',
                  color: mode === 'signin' ? '#ffffff' : '#71717a',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  padding: '0.55rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: mode === 'signup' ? '#27272a' : 'transparent',
                  color: mode === 'signup' ? '#ffffff' : '#71717a',
                  cursor: 'pointer'
                }}
              >
                Register
              </button>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {mode === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a1a1aa', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. Leo Messi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 0.85rem 0.75rem 2.3rem', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <User size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a1a1aa', marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="fan@matchday.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem 0.85rem 0.75rem 2.3rem', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <Mail size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a1a1aa', marginBottom: '0.35rem' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem 0.85rem 0.75rem 2.3rem', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <KeyRound size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  marginTop: '0.4rem',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : mode === 'signin' ? (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={15} />
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#71717a', marginTop: '0.35rem' }}>
                <Lock size={12} />
                <span>Protected by Supabase Auth</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
