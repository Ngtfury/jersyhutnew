'use client';

import React, { useState, useEffect } from 'react';
import CategoryCard from './CategoryCard';
import { getCategoryCovers, DEFAULT_CATEGORY_COVERS } from '../lib/supabase';

export default function CategoryGrid() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORY_COVERS);

  useEffect(() => {
    const loadCovers = () => {
      getCategoryCovers().then(data => {
        if (data && data.length > 0) setCategories(data);
      }).catch(console.error);
    };

    loadCovers();
    window.addEventListener('jerseyhut_categories_updated', loadCovers);
    window.addEventListener('storage', loadCovers);

    return () => {
      window.removeEventListener('jerseyhut_categories_updated', loadCovers);
      window.removeEventListener('storage', loadCovers);
    };
  }, []);

  return (
    <section className="category-section" aria-label="Product Categories">
      <div className="container">
        <div className="category-grid">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id || cat.category_id}
              category={{
                id: cat.category_id || cat.id,
                name: cat.name,
                path: cat.path,
                image: cat.image_url || cat.image,
                description: cat.description,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
