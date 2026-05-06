import { http } from './http';
import type { Product } from '@/modules/dashboard/api/product.api';

export interface CartItemAPI {
    product: Product;
    quantity: number;
    size?: string;
    color?: string;
    _id: string; // Made it required as we use it for updates
}

export interface CartAPIResponse {
    _id: string;
    userId: string;
    items: CartItemAPI[];
    totalAmount: number;
}

export const cartApi = {
    getCart: () =>
        http.get<{ success: boolean; data: CartAPIResponse }>('/cart'),

    addToCart: (productId: string, quantity: number, size?: string, color?: string) =>
        http.post<{ success: boolean; data: CartAPIResponse }>('/cart/add', { productId, quantity, size, color }),

    updateQuantity: (itemId: string, quantity: number) =>
        http.put<{ success: boolean; data: CartAPIResponse }>(`/cart/update/${itemId}`, { quantity }),

    removeCartItem: (itemId: string) =>
        http.delete<{ success: boolean; data: CartAPIResponse }>(`/cart/remove/${itemId}`),

    clearCart: () =>
        http.delete<{ success: boolean }>('/cart/clear'),
};
