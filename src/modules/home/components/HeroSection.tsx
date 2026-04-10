import { Button } from '@/shared/components/ui/button';

export const HeroSection = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
      <div className="md:col-span-2 relative rounded-2xl overflow-hidden group">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-12 text-white">
          <span className="text-xs tracking-widest uppercase mb-4 opacity-80">Summer Collection 2024</span>
          <h2 className="text-5xl font-bold mb-6 leading-tight">Redefining Digital<br />Elegance</h2>
          <Button className="w-fit bg-[#C83B1E] hover:bg-[#A63018] rounded-md px-8">Explore Now</Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-black text-white p-6">
          <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070" className="absolute right-0 bottom-0 h-3/4 object-contain opacity-80" />
          <div className="relative z-10">
            <h3 className="font-bold text-lg">New Footwear</h3>
            <p className="text-xs opacity-70">Up to 40% Off</p>
          </div>
        </div>
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#E5E7EB] p-6">
          <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999" className="absolute right-0 bottom-0 h-3/4 object-contain" />
          <div className="relative z-10">
            <h3 className="font-bold text-lg">Tech & Style</h3>
            <p className="text-xs text-gray-500">Curated Gadgets</p>
          </div>
        </div>
      </div>
    </section>
  );
};
