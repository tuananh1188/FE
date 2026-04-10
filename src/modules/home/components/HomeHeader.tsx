import { Search, ShoppingCart, Bell } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';

export const HomeHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <h1 className="text-[#C83B1E] font-bold text-xl leading-none">
          The Editorial<br /><span className="text-sm font-light">Marketplace</span>
        </h1>
        
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input className="pl-10 bg-gray-50 border-none rounded-full h-9" placeholder="Search curated collections..." />
        </div>

        <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-gray-600">
          <a href="#" className="text-[#C83B1E]">Flash Sales</a>
          <a href="#">Categories</a>
          <a href="#">Brands</a>
          <a href="#">Vouchers</a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer">
            <ShoppingCart className="size-5" />
            <span className="absolute -top-2 -right-2 bg-[#C83B1E] text-white text-[10px] rounded-full size-4 flex items-center justify-center">2</span>
          </div>
          <Bell className="size-5 cursor-pointer" />
          <div className="size-8 rounded-full bg-gray-200 border border-gray-300" />
        </div>
      </div>
    </header>
  );
};
