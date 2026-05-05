import { Button } from '@/shared/components/ui/button';
import { ProductCard } from '../../products/components/ProductCard';
import { ProductDetailModal } from '../../products/components/ProductDetailModal';
import { useEffect, useState } from 'react';
import { productApi } from '@/modules/dashboard/api/product.api';
import type { Product } from '@/modules/dashboard/api/product.api';
import { useNavigate } from 'react-router-dom';

export const DailyDiscoverSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getAll();

        if (response.data.success) {
          // Filter out Flash Sale products
          const filtered = response.data.data.filter(p => p.category?.slug !== 'flash-sale');
          setProducts(filtered);
        }
      } catch (error: any) {
        setError(error.message || 'Something went wrong!')
      } finally {
        setLoading(false)
      }
    };
    loadProducts();
  }, []);

  if (loading) return <div className='py-20 text-center'>Loading discover...</div>
  if (error) return <div className='py-20 text-center text-red-500'>Error: {error}</div>

  // Show only top 6 on home page as requested
  const displayProducts = products.slice(0, 6);

  return (
    <section className="text-center">
      <h2 className="text-xl font-bold mb-8">Daily Discover</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
        {displayProducts.map((item, index) => (
          <ProductCard
            key={`${item._id}-${index}`}
            id={item._id}
            name={item.name}
            images={[item.images?.[0] ?? '/placeholder.jpg']}
            originalPrice={item.originalPrice}
            totalSold={item.totalSold}
            showBuyButton
            onClick={() => setSelectedProductId(item._id)}
          />
        ))}
      </div>
      
      {products.length === 0 && <p className='text-center text-gray-500'>No products found</p>}
      
      {products.length > 0 && (
        <Button 
          variant="outline" 
          className="border-[#C83B1E] text-[#C83B1E] hover:bg-red-50 px-10 hover:cursor-pointer"
          onClick={() => navigate('/categories')}
        >
          View All Discoveries
        </Button>
      )}

      <ProductDetailModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
    </section>
  );
};
