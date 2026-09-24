import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

export default function TrustSection() {
  const benefits = [
    {
      icon: <Truck size={20} strokeWidth={1.8} />,
      title: "FREE SHIPPING",
      desc: "For orders above ₹999",
    },
    {
      icon: <RotateCcw size={20} strokeWidth={1.8} />,
      title: "7-DAY RETURN",
      desc: "Hassle-free returns",
    },
    {
      icon: <ShieldCheck size={20} strokeWidth={1.8} />,
      title: "DAMAGE COMPENSATION",
      desc: "Full refund if damaged",
    },
    {
      icon: <Headphones size={20} strokeWidth={1.8} />,
      title: "24/7 SUPPORT",
      desc: "Always here for you",
    },
  ];

  return (
    <section className="trust-section" aria-label="Customer Guarantees">
      <div className="container">
        <div className="trust-grid">
          {benefits.map((item, idx) => (
            <div key={idx} className="trust-item">
              <div className="trust-icon-box">
                {item.icon}
              </div>
              <h4 className="trust-title">{item.title}</h4>
              <p className="trust-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
