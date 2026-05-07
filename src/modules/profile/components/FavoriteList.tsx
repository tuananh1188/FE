import { useEffect, useState } from 'react';
import { favoriteApi } from '@/shared/api/favorite.api';
import type { ProductAPI } from '@/shared/api/product.api';
import { ProductCard } from '@/modules/products/components/ProductCard';
import { ProductDetailModal } from '@/modules/products/components/ProductDetailModal';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Heart } from 'lucide-react';

export const FavoriteList = () => {
    const [products, setProducts] = useState<ProductAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const fetchFavorites = async () => {
        try {
            const res = await favoriteApi.getMyFavorites();
            if (res.data.success) {
                setProducts(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    if (loading) return <div className="py-10 text-center text-muted-foreground">Loading favorites...</div>;

    if (products.length === 0) {
        return (
            <Card className="border-none shadow-sm">
                <CardContent className="py-10 text-center">
                    <Heart className="size-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">You haven't saved any products yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard
                        key={product._id}
                        id={product._id}
                        name={product.name}
                        images={product.images}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        discount={product.discount}
                        totalSold={product.totalSold}
                        onClick={() => setSelectedProductId(product._id)}
                    />
                ))}
            </div>

            <ProductDetailModal
                productId={selectedProductId}
                onClose={() => setSelectedProductId(null)}
            />
        </>
    );
};
