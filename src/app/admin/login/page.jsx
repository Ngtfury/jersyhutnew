'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, KeyRound, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingInitialAuth, setCheckingInitialAuth] = useState(true);
  const [error, setError] = useState('');
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if session is already active
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          window.location.href = '/admin';
          return;
        }
        if (data.isDefaultPassword) {
          setIsDefaultPassword(true);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setCheckingInitialAuth(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccess(true);
      // Hard navigation to ensure cookies are sent with all document and proxy requests
      setTimeout(() => {
        window.location.href = '/admin';
      }, 600);
    } catch (err) {
      setError(err.message || 'Access Denied: Incorrect password');
      setLoading(false);
    }
  };

  if (checkingInitialAuth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: '#e5e7eb', marginBottom: '1rem' }} />
        <p style={{ fontSize: '0.875rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af' }}>
          Verifying Security Status...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050505',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#0f0f0f',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 255, 255, 0.02)',
          padding: '2.5rem 2rem',
          position: 'relative'
        }}
      >
        {/* Top Tag & Lock Badge */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
              marginBottom: '1.25rem',
              color: success ? '#4ade80' : '#ffffff'
            }}
          >
            {success ? <ShieldCheck size={28} /> : <Lock size={26} />}
          </div>

          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#9ca3af',
              marginBottom: '0.35rem'
            }}
          >
            Matchday Security Gate
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 0.5rem 0',
              color: '#ffffff'
            }}
          >
            Operator Authentication
          </h1>

          <p
            style={{
              fontSize: '0.8125rem',
              color: '#6b7280',
              lineHeight: 1.5,
              margin: 0
            }}
          >
            Enter the master administrator key to manage products, inventory, vendors, and storefront assets.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              htmlFor="admin-password"
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#d1d5db',
                marginBottom: '0.5rem'
              }}
            >
              Master Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
                required
                disabled={loading || success}
                style={{
                  width: '100%',
                  padding: '0.875rem 2.875rem 0.875rem 1rem',
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.9375rem',
                  fontFamily: 'monospace',
                  letterSpacing: showPassword ? 'normal' : '0.15em',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password.trim() || success}
            style={{
              padding: '0.875rem 1.25rem',
              backgroundColor: success ? '#16a34a' : '#ffffff',
              color: success ? '#ffffff' : '#000000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: loading || !password.trim() || success ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              opacity: loading || !password.trim() ? 0.7 : 1
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : success ? (
              <>
                <ShieldCheck size={18} />
                <span>Granted — Opening Panel</span>
              </>
            ) : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Environment configuration helper pill */}
        {isDefaultPassword && (
          <div
            style={{
              marginTop: '1.75rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(234, 179, 8, 0.08)',
              border: '1px dashed rgba(234, 179, 8, 0.3)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#facc15',
              lineHeight: 1.5
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <KeyRound size={13} />
              <span>Production Setup Notice</span>
            </div>
            <span>
              Using default key: <code style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '3px' }}>matchday@admin2025</code>.
              To set your own private key, define <code style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '3px' }}>ADMIN_PASSWORD</code> in your Vercel or hosting environment variables.
            </span>
          </div>
        )}

        {/* Back to store */}
        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #1f1f23', paddingTop: '1.25rem' }}>
          <Link
            href="/"
            style={{
              fontSize: '0.8125rem',
              color: '#9ca3af',
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
