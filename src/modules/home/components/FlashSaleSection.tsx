import { Zap } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group cursor-pointer">
            <div className="relative aspect-square bg-gray-100">
              <span className="absolute top-2 left-2 bg-[#C83B1E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">-50%</span>
              <img src={`https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=500`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <CardContent className="p-3">
              <h4 className="text-[13px] font-medium truncate">Premium Product {i + 1}</h4>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[#C83B1E] font-bold text-sm">$89.00</span>
                <span className="text-gray-400 text-[11px] line-through">$178.00</span>
              </div>
              <div className="mt-3 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#C83B1E] h-full w-3/4" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">75% SOLD</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
