import { http } from './http';
import type { ProductAPI } from './product.api';

export const favoriteApi = {
    toggle: (productId: string) =>
        http.post<{ success: boolean; message: string; isFavorite: boolean }>('favorites/toggle', { productId }),

    getMyFavorites: () =>
        http.get<{ success: boolean; count: number; data: ProductAPI[] }>('favorites/my'),

    checkIsFavorite: (productId: string) =>
        http.get<{ success: boolean; isFavorite: boolean }>(`favorites/check/${productId}`),
};
