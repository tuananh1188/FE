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
    images?: string[];
    helpfulVotes?: string[];
    isVerifiedPurchase?: boolean;
    adminReply?: string;
    createdAt: string;
}

export const reviewApi = {
    getByProduct: (productId: string) =>
        http.get<{ success: boolean; count: number; data: Review[] }>(`reviews/${productId}`),

    create: (payload: { productId: string; rating: number; comment?: string; images?: string[] }) =>
        http.post<{ success: boolean; data: Review }>('reviews', payload),

    uploadMedia: (files: File[]) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return http.post<{ success: boolean; urls: string[] }>('reviews/media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    toggleHelpful: (id: string) =>
        http.patch<{ success: boolean; helpfulVotes: number; data: Review }>(`reviews/${id}/helpful`),
};
