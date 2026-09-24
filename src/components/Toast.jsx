'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { Check } from 'lucide-react';

export default function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <Check size={16} strokeWidth={2.5} />
      <span>{toastMessage}</span>
    </div>
  );
}
