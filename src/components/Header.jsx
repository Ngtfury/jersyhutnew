'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useModals } from '../app/providers';

export default function Header() {
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();
  const { openSearch } = useSearch();
  const { openAccount } = useModals();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 44 });
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simple countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { label: "HOME", path: "/" },
    { label: "FULL SLEEVES", path: "/collections/full-sleeves" },
    { label: "HALF SLEEVES", path: "/collections/half-sleeves" },
    { label: "OVERSIZED", path: "/collections/oversized" },
    { label: "ABOUT US", path: "/pages/about-us" },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      {showAnnouncement && (
        <div className="announcement-bar">
          <div className="countdown">
            <span>SALE ENDS IN:</span>
            <span>00d</span> :
            <span>{String(countdown.hours).padStart(2, '0')}h</span> :
            <span>{String(countdown.minutes).padStart(2, '0')}m</span> :
            <span>{String(countdown.seconds).padStart(2, '0')}s</span>
          </div>
          <button 
            onClick={() => setShowAnnouncement(false)} 
            style={{ color: 'rgba(255,255,255,0.5)', padding: '2px', cursor: 'pointer' }}
            aria-label="Close Announcement"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Main Sticky Header */}
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          {/* Mobile Left: Hamburger menu */}
          <div className="hamburger-btn">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="action-btn"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Desktop Left: JERSEY HUT Logo */}
          <Link 
            href="/" 
            className="header-logo"
            aria-label="Jersey Hut Home"
          >
            JERSEY HUT
            <span className="header-logo-accent"></span>
          </Link>

          {/* Desktop Center: Navigation */}
          <nav className="header-nav" aria-label="Main Navigation">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link ${pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Utilities: Search, Account, Cart */}
          <div className="header-actions">
            <button 
              onClick={openSearch}
              className="action-btn"
              aria-label="Search Jerseys"
            >
              <Search size={19} strokeWidth={1.8} />
            </button>

            <button 
              onClick={openAccount}
              className="action-btn"
              aria-label="Customer Account"
            >
              <User size={19} strokeWidth={1.8} />
            </button>

            <button 
              onClick={openCart}
              className="action-btn"
              aria-label={`Shopping Bag containing ${totalCount} items`}
            >
              <ShoppingBag size={19} strokeWidth={1.8} />
              {totalCount > 0 && (
                <span className="cart-badge">{totalCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav-panel ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <span className="header-logo" style={{ fontSize: '1.1rem' }}>
            JERSEY HUT
          </span>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            style={{ color: '#fff', padding: '0.5rem' }}
          >
            <X size={24} />
          </button>
        </div>

        <ul className="mobile-nav-links">
          {navLinks.map((item) => (
            <li key={item.path} className="mobile-nav-item">
              <Link
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={pathname === item.path ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mobile-nav-footer">
          <button 
            onClick={() => { setMobileMenuOpen(false); openSearch(); }}
            style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            <Search size={18} />
            Search Catalog
          </button>
          <button 
            onClick={() => { setMobileMenuOpen(false); openAccount(); }}
            style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            <User size={18} />
            My Account
          </button>
        </div>
      </div>
    </>
  );
}
