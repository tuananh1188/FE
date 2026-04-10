import { Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export const HomeFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <h1 className="text-[#C83B1E] font-bold text-lg leading-tight">The Editorial Marketplace</h1>
            <p className="text-xs text-gray-500 leading-relaxed">The ultimate destination for digital curation and modern commerce. Handpicked quality for every lifestyle.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6">Customer Care</h4>
            <ul className="text-xs text-gray-500 space-y-3">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns & Refunds</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6">Legal Matters</h4>
            <ul className="text-xs text-gray-500 space-y-3">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Seller Centre</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6">Stay Updated</h4>
            <p className="text-xs text-gray-500 mb-4">Subscribe to get special offers and once-in-a-lifetime deals.</p>
            <div className="flex bg-gray-50 rounded-md p-1 border border-gray-100">
              <Input className="bg-transparent border-none focus-visible:ring-0 text-xs h-8" placeholder="Email address" />
              <Button className="bg-[#C83B1E] size-8 p-0 shrink-0"><Mail className="size-4" /></Button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400">
          <p>© 2024 The Editorial Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <span>English</span>
            <span>USD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
