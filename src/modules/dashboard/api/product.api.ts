import { http } from '../../../shared/api/http';

export interface ProductPayload {
    name: string;
    description: string;
    originalPrice: number;
    discount?: number;
    category: string;
    images: string[];
    stock: number;
}

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice: number;
    discount: number;
    category: string;
    images: string[];
    stock: number;
    rating: number;
    soldPercentage: number;
    totalSold: number;
    createdAt: string;
}

export const productApi = {
    getAll: (search?: string, category?: string) =>
        http.get<{ success: boolean; count: number; data: Product[] }>('/product', {
            params: { search, category },
        }),

    getById: (id: string) =>
        http.get<{ success: boolean; data: Product }>(`/product/${id}`),

    create: (payload: ProductPayload) =>
        http.post<{ success: boolean; data: Product }>('/product', payload),

    update: (id: string, payload: Partial<ProductPayload>) =>
        http.put<{ success: boolean; data: Product }>(`/product/${id}`, payload),

    delete: (id: string) =>
        http.delete<{ success: boolean }>(`/product/${id}`),
};
