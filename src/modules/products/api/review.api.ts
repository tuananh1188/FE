import { http } from '../../../shared/api/http';

export interface Review {
    _id: string;
    user: {
        _id: string;
        displayName: string;
        avatarUrl?: string;
    };
    product: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export const reviewApi = {
    getByProduct: (productId: string) =>
        http.get<{ success: boolean; count: number; data: Review[] }>(`reviews/${productId}`),

    create: (payload: { productId: string; rating: number; comment?: string }) =>
        http.post<{ success: boolean; data: Review }>('reviews', payload),
};
