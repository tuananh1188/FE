import { Button } from '@/shared/components/ui/button';
import { dataProducts } from './data';
import { ProductCard } from './ProductCard';

export const DailyDiscoverSection = () => {
  return (
    <section className="text-center">
      <h2 className="text-xl font-bold mb-8">Daily Discover</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
        {dataProducts.slice(5, 11).map((item, index) => (
          <ProductCard key={index} name={item.name} imageUrl={item.imageUrl} originalPrice={item.originalPrice} soldCount={item.soldCount} showBuyButton />
        ))}
      </div>
      <Button variant="outline" className="border-[#C83B1E] text-[#C83B1E] hover:bg-red-50 px-10">Load More Discoveries</Button>
    </section>
  );
};
