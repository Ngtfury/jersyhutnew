'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-top">
          {/* Brand info */}
          <div className="footer-brand">
            <Link 
              href="/" 
              className="footer-logo"
            >
              JERSEY HUT
            </Link>
            <p className="footer-tagline">
              High-quality, affordable football jerseys for every fan. Engineered for matchday glory and modern streetwear expression.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="footer-col-title">SHOP</h4>
            <ul className="footer-links">
              <li>
                <Link href="/" className="footer-link">Home</Link>
              </li>
              <li>
                <Link href="/collections/full-sleeves" className="footer-link">Full Sleeves</Link>
              </li>
              <li>
                <Link href="/collections/half-sleeves" className="footer-link">Half Sleeves</Link>
              </li>
              <li>
                <Link href="/collections/oversized" className="footer-link">Oversized T</Link>
              </li>
              <li>
                <Link href="/collections/tshirts" className="footer-link">T-Shirts</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="footer-col-title">CUSTOMER SERVICE</h4>
            <ul className="footer-links">
              <li>
                <Link href="/pages/about-us" className="footer-link">About Us</Link>
              </li>
              <li>
                <a href="#track" onClick={(e) => { e.preventDefault(); alert("Order tracking: Please enter your Order ID received via WhatsApp / SMS."); }} className="footer-link">Track Order</a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); alert("Contact us: support@jerseyhut.in | WhatsApp: +91 98765 43210"); }} className="footer-link">Contact Us</a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => { e.preventDefault(); alert("FAQs: Delivery takes 3-5 business days across India. 7-day returns guaranteed."); }} className="footer-link">FAQs</a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="footer-col-title">POLICIES</h4>
            <ul className="footer-links">
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Privacy Policy: Your personal information is encrypted and secure with 256-bit SSL."); }} className="footer-link">Privacy Policy</a>
              </li>
              <li>
                <a href="#refund" onClick={(e) => { e.preventDefault(); alert("Refund Policy: 100% money back guarantee on defective or incorrectly sized items within 7 days."); }} className="footer-link">Refund Policy</a>
              </li>
              <li>
                <a href="#shipping" onClick={(e) => { e.preventDefault(); alert("Shipping Policy: Free standard shipping on all prepaid orders above ₹999."); }} className="footer-link">Shipping Policy</a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Terms of Service: Standard ecommerce consumer terms apply."); }} className="footer-link">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 JERSEY HUT. ALL RIGHTS RESERVED.</p>
          <div className="payment-methods">
            <span className="payment-pill">UPI</span>
            <span className="payment-pill">CARDS</span>
            <span className="payment-pill">NETBANKING</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
