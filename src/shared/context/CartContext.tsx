import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Product } from '@/modules/dashboard/api/product.api';
import { cartApi } from '../api/cart.api';
import { tokenStore } from '@/modules/auth/store/token.store';
import { toast } from 'sonner';

export type CartItem = {
  product: Product;
  quantity: number;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotalCount: number;
  cartSubtotal: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to normalize API cart items into our CartItem[] format
const normalizeCartItems = (apiItems: any[]): CartItem[] => {
  if (!apiItems || !Array.isArray(apiItems)) return [];
  return apiItems
    .filter((item: any) => item.product && typeof item.product === 'object' && item.product._id)
    .map((item: any) => ({
      product: item.product as Product,
      quantity: item.quantity,
    }));
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to check if user is logged in
  const isLoggedIn = !!tokenStore.get();

  const loadLocalCart = useCallback(() => {
    try {
      const stored = localStorage.getItem('shopping_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch {
      setCartItems([]);
    }
  }, []);

  // Fetch cart from server
  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await cartApi.getCart();
      if (res.data.success && res.data.data) {
        const normalized = normalizeCartItems(res.data.data.items);
        setCartItems(normalized);
      }
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    }
  }, [isLoggedIn]);

  // Load initial cart
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      if (isLoggedIn) {
        try {
          const res = await cartApi.getCart();
          if (res.data.success && res.data.data) {
            const normalized = normalizeCartItems(res.data.data.items);
            setCartItems(normalized);
          }
        } catch (error) {
          console.error('Failed to load cart from server:', error);
          loadLocalCart();
        }
      } else {
        loadLocalCart();
      }
      setIsLoading(false);
    };

    loadCart();
  }, [isLoggedIn, loadLocalCart]);

  // Sync to local storage for guests
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('shopping_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoggedIn]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (isLoggedIn) {
      try {
        const res = await cartApi.addToCart(product._id, quantity);
        if (res.data.success && res.data.data) {
          const normalized = normalizeCartItems(res.data.data.items);
          setCartItems(normalized);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to add to cart');
        throw error;
      }
    } else {
      setCartItems((prev) => {
        const existing = prev.find((item) => item.product._id === product._id);
        if (existing) {
          return prev.map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity }];
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (isLoggedIn) {
      // Optimistic update: remove from UI immediately
      const previousItems = [...cartItems];
      setCartItems((prev) => prev.filter((item) => item.product._id !== productId));

      try {
        const res = await cartApi.removeCartItem(productId);
        if (res.data.success && res.data.data) {
          // Sync with server response
          const normalized = normalizeCartItems(res.data.data.items);
          setCartItems(normalized);
        }
      } catch (error: any) {
        // Rollback on error
        setCartItems(previousItems);
        toast.error('Failed to remove item');
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const safeQuantity = Math.max(1, quantity);

    if (isLoggedIn) {
      // Optimistic update
      const previousItems = [...cartItems];
      setCartItems((prev) =>
        prev.map((item) =>
          item.product._id === productId ? { ...item, quantity: safeQuantity } : item
        )
      );

      try {
        const res = await cartApi.updateQuantity(productId, safeQuantity);
        if (res.data.success && res.data.data) {
          const normalized = normalizeCartItems(res.data.data.items);
          setCartItems(normalized);
        }
      } catch (error: any) {
        // Rollback on error
        setCartItems(previousItems);
        toast.error('Failed to update quantity');
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product._id === productId ? { ...item, quantity: safeQuantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (isLoggedIn) {
      try {
        await cartApi.clearCart();
        setCartItems([]);
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('shopping_cart');
    }
  };

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartSubtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || item.product?.originalPrice || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        isLoading,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
