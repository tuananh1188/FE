import React, { useState } from 'react';
import { useCart } from '@/shared/context/CartContext';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '@/modules/auth/store/token.store';
import { toast } from 'sonner';

export const OrderSummary = () => {
  const { cartSubtotal, cartItems } = useCart();
  const navigate = useNavigate();
  
  const shipping = cartItems.length > 0 ? 0 : 0;
  const taxRate = 0.08;
  const tax = cartSubtotal * taxRate;
  const total = cartSubtotal + shipping + tax;

  const handleProceedToCheckout = () => {
    if (!tokenStore.get()) {
      toast.error('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-6 md:p-8 shadow-sm sticky top-24 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>
      
      <div className="space-y-4 mb-6 text-sm">
        <div className="flex justify-between items-center text-gray-600">
          <span>Tạm tính</span>
          <span className="font-semibold text-gray-900">{(cartSubtotal * 25400).toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex justify-between items-center text-gray-600">
          <span>Phí vận chuyển</span>
          <span className="font-semibold text-green-600">Miễn phí</span>
        </div>
        <div className="flex justify-between items-center text-gray-600">
          <span>Thuế (8%)</span>
          <span className="font-semibold text-gray-900">{(tax * 25400).toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mb-6">
        <div className="flex justify-between items-end mb-6">
          <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
          <span className="text-3xl font-black text-gray-900 leading-none">
            {(total * 25400).toLocaleString('vi-VN')}đ
          </span>
        </div>
        
        <Button 
          onClick={handleProceedToCheckout}
          className="w-full bg-[#FF6B00] hover:bg-[#E65A00] text-white py-6 rounded-xl font-bold text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          Tiến hành thanh toán <ArrowRight size={18} />
        </Button>
      </div>

      {/* Payment Methods */}
      <div className="flex items-center justify-center gap-4 text-gray-400">
        <CreditCard size={20} />
        <Wallet size={20} />
        <Banknote size={20} />
      </div>
    </div>
  );
};
