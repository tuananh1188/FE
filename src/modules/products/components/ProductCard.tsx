import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import type { ProductCardProps } from "../types/product.types";


export function ProductCard({ name, images, price, originalPrice, discount, soldPercentage, totalSold, showBuyButton }: ProductCardProps) {
    return (
        <Card className="border-none shadow-sm p-3 overflow-hidden group cursor-pointer transition-all hover:shadow-md">
            <div className="relative aspect-square bg-gray-100">
                {discount && discount > 0 && <span className="absolute top-2 left-2 bg-[#C83B1E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">-{discount}%</span>}
                <img src={images[0]} alt={name} className="w-full h-full object-cover rounded-sm group-hover:scale-105 transition-transform duration-300" crossOrigin="anonymous" referrerPolicy="no-referrer" />
            </div>
            <CardContent className="p-3">
                <h4 className="text-[15px] font-semibold truncate">{name}</h4>
                <div className="mt-1 flex items-center justify-between gap-1">
                    <div className="flex items-baseline gap-2 truncate">
                        {price && 0 < price && price < originalPrice ? (
                            <>
                                <span className="text-md text-[#C83B1E] font-bold">${price.toFixed(2)}</span>
                                <span className="text-[13px] text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                            </>
                        ) : (
                            <span className="text-md text-[#C83B1E] font-bold">${originalPrice.toFixed(2)}</span>
                        )}
                    </div>
                    {(!soldPercentage || soldPercentage <= 0) && totalSold !== undefined && (
                        <span className="text-[12px] text-gray-500 whitespace-nowrap">{totalSold} sold</span>
                    )}
                </div>
                {soldPercentage && soldPercentage > 0 && <div className="mt-3 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#C83B1E] h-full transition-all duration-500" style={{ width: `${soldPercentage}%` }} />
                </div>}
                {soldPercentage && soldPercentage > 0 && <p className="text-[10px] text-gray-500 mt-1 font-medium uppercase h-2">{soldPercentage}% sold</p>}
                {showBuyButton && (
                    <Button className="w-full mt-3 bg-[#C83B1E] hover:bg-[#C83B1E]/90 hover:cursor-pointer text-white h-8 text-xs font-semibold">
                        Buy Now
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};