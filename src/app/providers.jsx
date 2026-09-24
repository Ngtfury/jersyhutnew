'use client';

import React, { useState } from 'react';
import { CartProvider } from '../context/CartContext';
import { SearchProvider } from '../context/SearchContext';
import AccountModal from '../components/AccountModal';
import SizeChartModal from '../components/SizeChartModal';

export const ModalContext = React.createContext({
  openAccount: () => {},
  openSizeChart: () => {},
});

export function Providers({ children }) {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  return (
    <CartProvider>
      <SearchProvider>
        <ModalContext.Provider
          value={{
            openAccount: () => setIsAccountOpen(true),
            openSizeChart: () => setIsSizeChartOpen(true),
          }}
        >
          {children}

          <AccountModal
            isOpen={isAccountOpen}
            onClose={() => setIsAccountOpen(false)}
          />

          <SizeChartModal
            isOpen={isSizeChartOpen}
            onClose={() => setIsSizeChartOpen(false)}
          />
        </ModalContext.Provider>
      </SearchProvider>
    </CartProvider>
  );
}

export function useModals() {
  return React.useContext(ModalContext);
}
