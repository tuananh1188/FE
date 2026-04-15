export interface ProductCardProps {
    _id: string;
    name: string;
    images: string[];
    price?: number;
    originalPrice: number;
    discount?: number;
    soldPercentage?: number;
    totalSold?: number;
    showBuyButton?: boolean;
    tag?: string;
}
