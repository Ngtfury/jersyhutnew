'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function SizeChartModal({ isOpen, onClose }) {
  const [unit, setUnit] = useState('inches'); // 'inches' | 'cm'

  if (!isOpen) return null;

  const dataInches = [
    { size: 'S', chest: '38"', length: '27"', shoulder: '17"' },
    { size: 'M', chest: '40"', length: '28"', shoulder: '18"' },
    { size: 'L', chest: '42"', length: '29"', shoulder: '19"' },
    { size: 'XL', chest: '44"', length: '30"', shoulder: '20"' },
    { size: '2XL', chest: '46"', length: '31"', shoulder: '21"' },
  ];

  const dataCm = [
    { size: 'S', chest: '96 cm', length: '68 cm', shoulder: '43 cm' },
    { size: 'M', chest: '101 cm', length: '71 cm', shoulder: '45 cm' },
    { size: 'L', chest: '106 cm', length: '74 cm', shoulder: '48 cm' },
    { size: 'XL', chest: '111 cm', length: '76 cm', shoulder: '51 cm' },
    { size: '2XL', chest: '116 cm', length: '79 cm', shoulder: '53 cm' },
  ];

  const currentData = unit === 'inches' ? dataInches : dataCm;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 270,
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
          maxWidth: '520px',
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
          aria-label="Close size chart"
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
            FIT & SIZING GUIDE
          </span>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>
            FOOTBALL JERSEY SIZE CHART
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.3rem' }}>
            All measurements represent true garment dimensions. If you prefer a relaxed or streetwear drape, size up.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setUnit('inches')}
            style={{
              padding: '0.4rem 1rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              backgroundColor: unit === 'inches' ? '#000' : '#f0f0f0',
              color: unit === 'inches' ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            Inches
          </button>
          <button
            onClick={() => setUnit('cm')}
            style={{
              padding: '0.4rem 1rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              backgroundColor: unit === 'cm' ? '#000' : '#f0f0f0',
              color: unit === 'cm' ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            Centimeters
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'center' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ padding: '0.6rem', fontWeight: 700, letterSpacing: '0.1em' }}>SIZE</th>
              <th style={{ padding: '0.6rem', fontWeight: 700, letterSpacing: '0.1em' }}>CHEST</th>
              <th style={{ padding: '0.6rem', fontWeight: 700, letterSpacing: '0.1em' }}>LENGTH</th>
              <th style={{ padding: '0.6rem', fontWeight: 700, letterSpacing: '0.1em' }}>SHOULDER</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr key={row.size} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '0.65rem', fontWeight: 700 }}>{row.size}</td>
                <td style={{ padding: '0.65rem' }}>{row.chest}</td>
                <td style={{ padding: '0.65rem' }}>{row.length}</td>
                <td style={{ padding: '0.65rem' }}>{row.shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}
