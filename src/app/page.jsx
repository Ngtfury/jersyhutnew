import Hero from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import BestSellers from '../components/BestSellers';
import FreshKits from '../components/FreshKits';
import EditorialBanner from '../components/EditorialBanner';
import BrandStory from '../components/BrandStory';
import TrustSection from '../components/TrustSection';

export default function HomePage() {
  return (
    <>
      {/* 2. Hero Campaign */}
      <Hero />

      {/* 3. Category Tiles */}
      <CategoryGrid />

      {/* 4 & 5. Best Sellers Section & Dynamic Filter Tabs */}
      <BestSellers />

      {/* 6. Fresh Kits Carousel */}
      <FreshKits />

      {/* 7. Editorial Promotional Banner */}
      <EditorialBanner />

      {/* 8. Brand Story Manifesto */}
      <BrandStory />

      {/* 9. Trust / Services Guarantees */}
      <TrustSection />
    </>
  );
}
