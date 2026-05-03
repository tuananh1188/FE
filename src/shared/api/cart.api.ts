import { http } from './http';
import type { Product } from '@/modules/dashboard/api/product.api';

export interface CartItemAPI {
    product: Product;
    quantity: number;
    _id?: string;
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

    addToCart: (productId: string, quantity: number) =>
        http.post<{ success: boolean; data: CartAPIResponse }>('/cart/add', { productId, quantity }),

    updateQuantity: (productId: string, quantity: number) =>
        http.put<{ success: boolean; data: CartAPIResponse }>(`/cart/update/${productId}`, { quantity }),

    removeCartItem: (productId: string) =>
        http.delete<{ success: boolean; data: CartAPIResponse }>(`/cart/remove/${productId}`),

    clearCart: () =>
        http.delete<{ success: boolean }>('/cart/clear'),
};
