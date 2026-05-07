import React, { createContext, useContext, useState, useEffect } from 'react';
import { favoriteApi } from '../api/favorite.api';
import { tokenStore } from '@/modules/auth/store/token.store';

interface FavoriteContextType {
    favorites: string[]; // array of product IDs
    toggleFavorite: (productId: string) => Promise<void>;
    isFavorite: (productId: string) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<string[]>([]);

    const fetchFavorites = async () => {
        if (!tokenStore.get()) return;
        try {
            const res = await favoriteApi.getMyFavorites();
            if (res.data.success) {
                setFavorites(res.data.data.map((p: any) => p._id));
            }
        } catch (err) {
            console.error('Failed to fetch favorites:', err);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const toggleFavorite = async (productId: string) => {
        if (!tokenStore.get()) {
            window.location.href = '/login';
            return;
        }
        try {
            const res = await favoriteApi.toggle(productId);
            if (res.data.success) {
                if (res.data.isFavorite) {
                    setFavorites(prev => [...prev, productId]);
                } else {
                    setFavorites(prev => prev.filter(id => id !== productId));
                }
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    };

    const isFavorite = (productId: string) => favorites.includes(productId);

    return (
        <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorite = () => {
    const context = useContext(FavoriteContext);
    if (!context) {
        throw new Error('useFavorite must be used within a FavoriteProvider');
    }
    return context;
};
