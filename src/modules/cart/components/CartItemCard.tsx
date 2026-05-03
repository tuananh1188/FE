import React, { useState } from 'react';
import { Minus, Plus, Trash2, X, Check } from 'lucide-react';
import type { CartItem } from '@/shared/context/CartContext';
import { useCart } from '@/shared/context/CartContext';

interface CartItemCardProps {
  item: CartItem;
}

export const CartItemCard = ({ item }: CartItemCardProps) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;
  const price = product.price || product.originalPrice;
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmRemove = async () => {
    setShowConfirm(false);
    await removeFromCart(product._id);
  };

  return (
    <div className="flex items-center gap-4 py-6 border-b border-gray-100 last:border-0 relative bg-white border rounded-xl px-4 shadow-sm mb-4">
      {/* Product Image */}
      <div className="w-24 h-24 bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
        <img
          src={product.images?.[0] ?? '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Img';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
            {product.name}
          </h3>

          {/* Delete button with inline confirm */}
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1 flex-shrink-0"
              title="Remove item"
            >
              <Trash2 size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-1 flex-shrink-0 animate-in fade-in duration-200">
              <span className="text-xs text-red-500 font-medium mr-1">Delete?</span>
              <button
                onClick={handleConfirmRemove}
                className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                title="Confirm remove"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4 capitalize">
          {product.category?.name || 'Category'} | In Stock: {product.stock}
        </p>

        {/* Quantity and Price */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
            <button
              onClick={() => updateQuantity(product._id, quantity - 1)}
              disabled={quantity <= 1}
              className="px-2.5 py-1.5 text-[#C83B1E] hover:bg-gray-100 disabled:opacity-50 disabled:text-gray-400 transition-colors cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-gray-800">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product._id, quantity + 1)}
              disabled={quantity >= product.stock}
              className="px-2.5 py-1.5 text-[#C83B1E] hover:bg-gray-100 disabled:opacity-50 disabled:text-gray-400 transition-colors cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <div className="text-lg font-black text-gray-900">
            ${(price * quantity).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
