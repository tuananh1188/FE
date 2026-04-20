import { Zap } from 'lucide-react';
import { ProductCard } from '../../products/components/ProductCard';
import { useEffect, useState } from 'react';
import { productApi } from '@/modules/dashboard/api/product.api';
import type { Product } from '@/modules/dashboard/api/product.api';
import { categoryApi } from '@/shared/api/category.api';
import { Button } from '@/shared/components/ui/button';
import { CountdownTimer } from './CountdownTimer';

export const FlashSaleSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch categories to find 'Flash Sale' category ID
        const catRes = await categoryApi.getAll();
        const flashSaleCategory = catRes.data.data.find(
          c => c.name === 'Flash Sale' || c.slug === 'flash-sale'
        );

        // 2. Fetch products
        // If 'Flash Sale' category ID exists, use it. Otherwise fetch all and filter.
        const res = await productApi.getAll(undefined, flashSaleCategory?._id);
        
        if (res.data.success) {
          let data = res.data.data;
          
          // Fallback: If no category ID was found, filter by discount in frontend
          if (!flashSaleCategory) {
            data = data.filter(p => p.discount && p.discount > 0);
          }
          
          setProducts(data);
        }
      } catch (error: any) {
        console.error('Flash Sale Error:', error);
        setError(error.response?.data?.message || error.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) return <div className='py-10 text-center text-gray-500'>Loading...</div>
  if (error) return <div className='py-10 text-center text-red-500'>{error}</div>

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="size-5 text-[#C83B1E] fill-[#C83B1E]" /> Flash Sale
        </h2>
        <CountdownTimer initialSeconds={4 * 3600 + 12 * 60 + 55} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4">
        {products.slice(0, 5).map((item) => (
          <ProductCard key={item._id} name={item.name} images={[item.images?.[0] ?? '/placeholder.jpg']} price={item.price} originalPrice={item.originalPrice} discount={item.discount} soldPercentage={item.soldPercentage} />
        ))}
      </div>
      {products.length === 0 && <p className='text-center text-gray-500'>No products found</p>}
      {products.length > 0 && <Button variant="outline" className="border-[#C83B1E] text-[#C83B1E] hover:bg-red-50 px-10">Load More</Button>}
    </section>
  );
};
