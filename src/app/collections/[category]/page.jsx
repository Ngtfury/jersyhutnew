import { Suspense } from 'react';
import Collection from '../../../views/Collection';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const category = resolvedParams.category || 'all';
  const formatted = category.replace(/-/g, ' ').toUpperCase();
  return {
    title: `${formatted} | Matchday`,
    description: `Shop the official ${formatted} football jersey collection from Matchday.`,
  };
}

export async function generateStaticParams() {
  return [
    { category: 'full-sleeves' },
    { category: 'half-sleeves' },
    { category: 'oversized' },
    { category: 'tshirts' },
    { category: 'all' },
  ];
}

export default async function CollectionPage({ params }) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', padding: '4rem 0', textAlign: 'center' }}>Loading collection...</div>}>
      <Collection categorySlug={resolvedParams.category} />
    </Suspense>
  );
}

