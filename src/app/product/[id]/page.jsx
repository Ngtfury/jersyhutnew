import Product from '../../../views/Product';
import { getProducts } from '../../../lib/supabase';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const products = await getProducts();
  const product = products.find((p) => p.id === resolvedParams.id);
  if (!product) {
    return { title: 'Product | Jersey Hut' };
  }
  return {
    title: `${product.name} | Jersey Hut`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Jersey Hut`,
      description: product.description,
      images: product.images && product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  return <Product productId={resolvedParams.id} />;
}
