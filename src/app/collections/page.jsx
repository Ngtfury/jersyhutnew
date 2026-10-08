import { Suspense } from 'react';
import Collection from '../../views/Collection';

export const metadata = {
  title: 'All Jerseys & Matchday Collections | Jersey Hut',
  description: 'Shop authentic club jerseys, national team kits, retro football shirts, and lifestyle oversized tees.',
};

export default function CollectionsIndexPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', padding: '4rem 0', textAlign: 'center' }}>Loading collections archive...</div>}>
      <Collection categorySlug="all" />
    </Suspense>
  );
}
