'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShoppingBag,
  ArrowLeft,
  KeyRound
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, signInWithEmail, signUpWithEmail, signOut, resendVerification } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/';
  const noticeParam = searchParams.get('notice');

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [pendingKitName, setPendingKitName] = useState('');

  // Check if there was a pending item from Quick Add
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('pending_cart_item');
      if (raw) {
        const item = JSON.parse(raw);
        if (item?.product?.name) {
          setPendingKitName(item.product.name);
        }
      }
    } catch (e) {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setEmailConfirmationRequired(false);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const { data, error } = await signInWithEmail(email, password);
        if (error) {
          const msg = error.message || '';
          if (msg.toLowerCase().includes('invalid login credentials')) {
            setErrorMsg('Invalid email or password. If you do not have an account yet, click below to register.');
          } else if (msg.toLowerCase().includes('email not confirmed')) {
            setEmailConfirmationRequired(true);
            setErrorMsg('Your email has not been confirmed yet. Please check your inbox or spam folder for the confirmation link.');
          } else {
            setErrorMsg(msg || 'Authentication failed. Please check your credentials.');
          }
          setSubmitting(false);
          return;
        }

        setSuccessMsg('Signed in successfully! Redirecting...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 700);
      } else {
        // Sign Up
        const { data, error } = await signUpWithEmail(email, password, {
          full_name: fullName.trim() || undefined
        });

        if (error) {
          const msg = error.message || '';
          if (msg.toLowerCase().includes('user already registered')) {
            setErrorMsg('An account with this email already exists. Please switch to Sign In.');
            setMode('signin');
          } else {
            setErrorMsg(msg || 'Registration failed. Please try again.');
          }
          setSubmitting(false);
          return;
        }

        if (data?.session) {
          // Immediately logged in
          setSuccessMsg('Account created and signed in! Redirecting...');
          setTimeout(() => {
            router.push(redirectUrl);
          }, 800);
        } else {
          // Supabase email confirmation setting is active
          setEmailConfirmationRequired(true);
          setSuccessMsg(
            'Account created successfully! If email confirmation is enabled, please verify your inbox before signing in.'
          );
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setResendingEmail(true);
    try {
      await resendVerification(email);
      setSuccessMsg('Verification email resent! Please check your inbox.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResendingEmail(false);
    }
  };

  // If user is already authenticated
  if (user && !submitting && !successMsg) {
    return (
      <div style={{ minHeight: '85vh', backgroundColor: '#09090b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#4ade80' }}>
            <CheckCircle2 size={30} />
          </div>

          <div style={{ fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 700, marginBottom: '0.3rem' }}>
            Matchday Member
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 0.5rem', color: '#fff' }}>
            You Are Signed In
          </h2>

          <p style={{ fontSize: '0.8125rem', color: '#9ca3af', marginBottom: '1.75rem', wordBreak: 'break-all' }}>
            Logged in as <strong>{user.email}</strong>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              href={redirectUrl}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <span>Continue Shopping</span>
              <ArrowRight size={15} />
            </Link>

            <button
              onClick={signOut}
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
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '90vh',
        backgroundColor: '#09090b',
        backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.04) 0%, transparent 60%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#121214',
          border: '1px solid #27272a',
          borderRadius: '12px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
          padding: '2.5rem 2rem',
          position: 'relative'
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '1rem',
              color: '#ffffff'
            }}
          >
            <Lock size={22} />
          </div>

          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#a1a1aa',
              marginBottom: '0.35rem'
            }}
          >
            Matchday Member Access
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              margin: '0 0 0.5rem 0',
              color: '#ffffff',
              textTransform: 'uppercase'
            }}
          >
            {mode === 'signin' ? 'Sign In To Your Bag' : 'Create Member Account'}
          </h1>

          <p
            style={{
              fontSize: '0.8125rem',
              color: '#71717a',
              lineHeight: 1.5,
              margin: 0
            }}
          >
            {pendingKitName ? (
              <span>Sign in to automatically add <strong>{pendingKitName}</strong> to your bag.</span>
            ) : (
              <span>Your personal bag, saved kit sizes, and direct order tracking.</span>
            )}
          </p>
        </div>

        {/* Quick Add notice banner */}
        {(noticeParam === 'login_required' || pendingKitName) && (
          <div
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.5rem',
              lineHeight: 1.4
            }}
          >
            <ShoppingBag size={18} style={{ flexShrink: 0 }} />
            <span>
              {pendingKitName
                ? `Signing in links ${pendingKitName} to your personal bag.`
                : 'Please sign in to add jerseys to your personal matchday bag.'}
            </span>
          </div>
        )}

        {/* Toggle between Sign In and Register */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '6px',
            padding: '3px',
            marginBottom: '1.5rem'
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '0.6rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: mode === 'signin' ? '#27272a' : 'transparent',
              color: mode === 'signin' ? '#ffffff' : '#71717a',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '0.6rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: mode === 'signup' ? '#27272a' : 'transparent',
              color: mode === 'signup' ? '#ffffff' : '#71717a',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Register
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <span>{errorMsg}</span>
              {mode === 'signin' && errorMsg.includes('register') && (
                <div style={{ marginTop: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setErrorMsg(''); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#60a5fa',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    Switch to Register & Create Account &rarr;
                  </button>
                </div>
              )}
              {emailConfirmationRequired && (
                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendingEmail}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#60a5fa',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    {resendingEmail ? 'Sending...' : 'Resend confirmation email →'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#d1d5db',
                  marginBottom: '0.4rem'
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Cristiano Ronaldo"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 2.5rem',
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
              </div>
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#d1d5db',
                marginBottom: '0.4rem'
              }}
            >
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fan@matchday.in"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.5rem',
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#d1d5db',
                marginBottom: '0.4rem'
              }}
            >
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                style={{
                  width: '100%',
                  padding: '0.8rem 2.5rem 0.8rem 2.5rem',
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <KeyRound size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#71717a',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#d1d5db',
                  marginBottom: '0.4rem'
                }}
              >
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem 0.8rem 2.5rem',
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <KeyRound size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.875rem',
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
              gap: '0.5rem',
              marginTop: '0.5rem',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating with Supabase...</span>
              </>
            ) : mode === 'signin' ? (
              <>
                <span>Sign In To Matchday</span>
                <ArrowRight size={15} />
              </>
            ) : (
              <>
                <span>Create Member Account</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#71717a' }}>
          <ShieldCheck size={14} color="#16a34a" />
          <span>Secured by Supabase Authentication & Encryption</span>
        </div>

        {/* Return to Storefront */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #1f1f23', paddingTop: '1.25rem' }}>
          <Link
            href="/"
            style={{
              fontSize: '0.78rem',
              color: '#a1a1aa',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to Matchday Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '85vh', backgroundColor: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <Loader2 size={32} className="animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

