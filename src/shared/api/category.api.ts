import { http } from './http';

export interface Category {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const categoryApi = {
    getAll: () =>
        http.get<{ success: boolean; count: number; data: Category[] }>('/category'),

    getById: (id: string) =>
        http.get<{ success: boolean; data: Category }>(`/category/${id}`),

    create: (payload: Omit<Category, '_id' | 'createdAt' | 'updatedAt' | 'slug'>) =>
        http.post<{ success: boolean; data: Category }>('/category', payload),

    update: (id: string, payload: Partial<Omit<Category, '_id' | 'createdAt' | 'updatedAt' | 'slug'>>) =>
        http.put<{ success: boolean; data: Category }>(`/category/${id}`, payload),

    delete: (id: string) =>
        http.delete<{ success: boolean }>(`/category/${id}`),
};
