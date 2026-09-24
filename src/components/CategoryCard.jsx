'use client';

import React from 'react';
import Link from 'next/link';

export default function CategoryCard({ category }) {
  return (
    <Link
      href={category.path}
      className="category-card"
      id={`cat-card-${category.id}`}
    >
      <div className="category-image-container">
        <img
          src={category.image}
          alt={category.name}
          className="category-image"
          loading="lazy"
        />
      </div>
      <div className="category-label-wrapper">
        <h3 className="category-title">{category.name}</h3>
      </div>
    </Link>
  );
}
