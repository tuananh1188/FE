
import { Link } from 'react-router-dom';
import { useCart } from '@/shared/context/CartContext';
import { CartItemCard } from '../components/CartItemCard';
import { OrderSummary } from '../components/OrderSummary';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export const CartPage = () => {
  const { cartItems } = useCart();

  return (
    <div className="min-h-[70vh] py-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-[#FF6B00]">Giỏ hàng của bạn</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <ShoppingBag size={64} className="text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá bộ sưu tập mới nhất của chúng tôi.
          </p>
          <Link
            to="/categories"
            className="bg-[#C83B1E] hover:bg-[#b03318] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Cart Items List */}
          <div className="w-full lg:flex-1">
            <div className="space-y-0">
              {cartItems.map((item) => (
                <CartItemCard key={item._id} item={item} />
              ))}
            </div>
            
            <div className="mt-8">
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 text-[#C83B1E] font-medium hover:underline transition-all"
              >
                <ArrowLeft size={18} /> Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[380px]">
            <OrderSummary />
          </div>
        </div>
      )}
    </div>
  );
};
