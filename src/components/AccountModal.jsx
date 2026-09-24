'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, Phone, CheckCircle2 } from 'lucide-react';

export default function AccountModal({ isOpen, onClose }) {
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
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
          backgroundColor: '#fff',
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem 2rem',
          position: 'relative',
          color: '#000',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', cursor: 'pointer' }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={48} color="#000" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              One-Time Password Sent
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#666' }}>
              Check your messages for the 6-digit verification code.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
                JERSEY HUT MEMBER ACCESS
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.3rem' }}>
                SIGN IN / REGISTER
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.4rem' }}>
                Track orders, save favorite kits, and access exclusive drops.
              </p>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  borderBottom: authMethod === 'phone' ? '2px solid #000' : 'none',
                  color: authMethod === 'phone' ? '#000' : '#888',
                  cursor: 'pointer'
                }}
              >
                Mobile Number
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  borderBottom: authMethod === 'email' ? '2px solid #000' : 'none',
                  color: authMethod === 'email' ? '#000' : '#888',
                  cursor: 'pointer'
                }}
              >
                Email Address
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.4rem' }}>
                  {authMethod === 'phone' ? 'Phone Number' : 'Email Address'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', padding: '0.65rem 0.85rem', gap: '0.6rem' }}>
                  {authMethod === 'phone' ? <Phone size={16} color="#888" /> : <Mail size={16} color="#888" />}
                  <input
                    type={authMethod === 'phone' ? 'tel' : 'email'}
                    placeholder={authMethod === 'phone' ? '+91 98765 43210' : 'fan@jerseyhut.in'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem' }}
              >
                REQUEST SECURE OTP
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#777', marginTop: '0.5rem' }}>
                <Lock size={12} />
                <span>Protected by 256-Bit SSL Encryption</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
