import { useState } from "react";
import type { ProductCardProps } from "../types/product.types";
import { ProductCard } from "./ProductCard";
import { ProductDetailModal } from "./ProductDetailModal";

interface ProductListProps {
    products: ProductCardProps[];
}

export const ProductList = ({ products }: ProductListProps) => {
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product, index) => (
                    <ProductCard
                        key={product.id || index}
                        {...product}
                        tag={index === 0 ? "Editor's Pick" : index === 1 ? "New Arrival" : undefined}
                        showBuyButton={true}
                        buttonText="Add To Cart"
                        onClick={() => product.id && setSelectedProductId(product.id)}
                    />
                ))}
                {products.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <p className="text-gray-500 font-medium">No products found</p>
                    </div>
                )}
            </div>

            <ProductDetailModal
                productId={selectedProductId}
                onClose={() => setSelectedProductId(null)}
            />
        </>
    )
}