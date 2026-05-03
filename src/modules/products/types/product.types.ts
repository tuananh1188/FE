export interface ProductCardProps {
    id?: string;
    name: string;
    images: string[];
    price?: number;
    originalPrice: number;
    discount?: number;
    soldPercentage?: number;
    totalSold?: number;
    showBuyButton?: boolean;
    buttonText?: string;
    tag?: string;
    onClick?: () => void;
}
