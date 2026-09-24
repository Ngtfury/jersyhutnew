'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getProducts } from '../lib/supabase';

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(data => {
      if (Array.isArray(data)) setProducts(data);
    }).catch(console.error);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter(item => {
      const matchName = item.name ? item.name.toLowerCase().includes(q) : false;
      const matchPlayer = item.player ? item.player.toLowerCase().includes(q) : false;
      const matchTeam = item.team ? item.team.toLowerCase().includes(q) : false;
      const matchCountry = item.country ? item.country.toLowerCase().includes(q) : false;
      const matchCategory = item.category ? item.category.toLowerCase().includes(q) : false;
      const matchEdition = item.edition ? item.edition.toLowerCase().includes(q) : false;
      return matchName || matchPlayer || matchTeam || matchCountry || matchCategory || matchEdition;
    });
  }, [searchQuery, products]);

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <SearchContext.Provider value={{
      isSearchOpen,
      searchQuery,
      setSearchQuery,
      searchResults,
      openSearch,
      closeSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
