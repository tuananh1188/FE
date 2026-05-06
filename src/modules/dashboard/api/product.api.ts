import { http } from '../../../shared/api/http';
import type { Category } from '../../../shared/api/category.api';

export type ProductPayload = {
    name: string;
    description: string;
    originalPrice: number;
    discount?: number;
    category: string; // This remains string as we send the ID to the backend
    images: string[];
    sizes: string[];
    colors: string[];
    stock: number;
}

export type Product = {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice: number;
    discount: number;
    category: Category; // Updated to Category object
    images: string[];
    sizes: string[];
    colors: string[];
    stock: number;
    rating: number;
    soldPercentage: number;
    totalSold: number;
    reviewCount: number;
    createdAt: string;
}

export const productApi = {
    getAll: (search?: string, category?: string) =>
        http.get<{ success: boolean; count: number; data: Product[] }>('product', {
            params: { search, category },
        }),

    getById: (id: string) =>
        http.get<{ success: boolean; data: Product }>(`product/${id}`),

    create: (payload: FormData) =>
        http.post<{ success: boolean; data: Product }>('product', payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    update: (id: string, payload: FormData) =>
        http.put<{ success: boolean; data: Product }>(`product/${id}`, payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    delete: (id: string) =>
        http.delete<{ success: boolean }>(`product/${id}`),
};
