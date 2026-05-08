import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import type { ProductCardProps } from "../types/product.types";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useFavorite } from "@/shared/context/FavoriteContext";

export function ProductCard({ id, name, images, price, originalPrice, discount, soldPercentage, totalSold, showBuyButton, buttonText = "Mua ngay", onClick }: ProductCardProps) {
    const { isFavorite, toggleFavorite } = useFavorite();
    const isLiked = id ? isFavorite(id) : false;

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (id) {
            toggleFavorite(id);
        }
    };
    const primaryImage = images?.[0] || '/products/electronics.png';
    const [displayImage, setDisplayImage] = useState<string>('/products/electronics.png'); // Start with local placeholder

    useEffect(() => {
        if (!primaryImage.startsWith('http')) {
            setDisplayImage(primaryImage);
            return;
        }

        // Silent pre-check to avoid console 404
        const img = new Image();
        img.src = primaryImage;
        img.onload = () => setDisplayImage(primaryImage);
        img.onerror = () => {
            // If it's a beauty product, use beauty placeholder, etc.
            // For now, default to electronics as a safe bet
            setDisplayImage('/products/electronics.png');
        };
    }, [primaryImage]);

    return (
        <Card className="border-none shadow-sm p-3 overflow-hidden group cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
            <div className="relative aspect-square bg-gray-100">
                {(discount ?? 0) > 0 && <span className="absolute top-2 left-2 bg-[#C83B1E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">-{discount}%</span>}
                <button 
                    onClick={handleToggleFavorite}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm cursor-pointer"
                >
                    <Heart className={`size-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <img 
                    src={displayImage} 
                    alt={name} 
                    className="w-full h-full object-cover rounded-sm group-hover:scale-105 transition-transform duration-300" 
                />
            </div>
            <CardContent className="p-3">
                <h4 className="text-[15px] font-semibold truncate">{name}</h4>
                <div className="mt-1 flex items-center justify-between gap-1">
                    <div className="flex items-baseline gap-2 truncate">
                        {price && 0 < price && price < originalPrice ? (
                            <>
                                <span className="text-md text-[#C83B1E] font-bold">{(price * 25400).toLocaleString('vi-VN')}đ</span>
                                <span className="text-[13px] text-gray-400 line-through">{(originalPrice * 25400).toLocaleString('vi-VN')}đ</span>
                            </>
                        ) : (
                            <span className="text-md text-[#C83B1E] font-bold">{(originalPrice * 25400).toLocaleString('vi-VN')}đ</span>
                        )}
                    </div>
                    {(!soldPercentage || soldPercentage <= 0) && totalSold !== undefined && (
                        <span className="text-[12px] text-gray-500 whitespace-nowrap">Đã bán {totalSold}</span>
                    )}
                </div>
                {(soldPercentage ?? 0) > 0 && <div className="mt-3 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#C83B1E] h-full transition-all duration-500" style={{ width: `${soldPercentage}%` }} />
                </div>}
                {(soldPercentage ?? 0) > 0 && <p className="text-[10px] text-gray-500 mt-1 font-medium uppercase h-2">Đã bán {soldPercentage}%</p>}
                {showBuyButton && (
                    <Button className="w-full mt-3 bg-[#C83B1E] hover:bg-[#C83B1E]/90 hover:cursor-pointer text-white h-8 text-xs font-semibold">
                        {buttonText}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};