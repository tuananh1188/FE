import { Button } from '@/shared/components/ui/button';

export const DailyDiscoverSection = () => {
  return (
    <section className="text-center">
      <h2 className="text-xl font-bold mb-8">Daily Discover</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition text-left group">
              <div className="aspect-[4/5] bg-gray-50 overflow-hidden">
                <img src={`https://images.unsplash.com/photo-${1600000000000 + i}?q=80&w=500`} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <h4 className="text-[12px] font-medium h-8 line-clamp-2">Designer Item Collection Edition</h4>
                <p className="text-[#C83B1E] font-bold mt-2">$145.00</p>
                <Button variant="outline" className="w-full mt-3 h-8 text-[11px] font-bold border-gray-100 hover:bg-[#C83B1E] hover:text-white">Buy Now</Button>
              </div>
          </div>
          ))}
      </div>
      <Button variant="outline" className="border-[#C83B1E] text-[#C83B1E] hover:bg-red-50 px-10">Load More Discoveries</Button>
    </section>
  );
};
