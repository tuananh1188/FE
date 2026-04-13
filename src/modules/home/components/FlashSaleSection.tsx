import { Zap } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { dataProducts } from './data';

export const FlashSaleSection = () => {
  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="size-5 text-[#C83B1E] fill-[#C83B1E]" /> Flash Sale
        </h2>
        <div className="flex gap-1 text-white font-mono">
          <span className="bg-black px-1.5 py-0.5 rounded text-sm">04</span> :
          <span className="bg-black px-1.5 py-0.5 rounded text-sm">12</span> :
          <span className="bg-black px-1.5 py-0.5 rounded text-sm">55</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4">
        {dataProducts.slice(0, 5).map((item, index) => (
          <ProductCard key={index} name={item.name} imageUrl={item.imageUrl} price={item.price} originalPrice={item.originalPrice} discount={item.discount} soldPercentage={item.soldPercentage} />
        ))}
      </div>
    </section>
  );
};
