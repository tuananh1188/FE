import { useState, useEffect } from 'react';
import { X, Star, Minus, Plus, ShoppingCart, Zap, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/modules/dashboard/api/product.api';
import { productApi } from '@/modules/dashboard/api/product.api';
import { useCart } from '@/shared/context/CartContext';
import { toast } from 'sonner';

interface ProductDetailModalProps {
    productId: string | null;
    onClose: () => void;
}

export function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        if (!productId) {
            setProduct(null);
            return;
        }

        const fetchProduct = async () => {
            setLoading(true);
            setSelectedImageIndex(0);
            setQuantity(1);
            setImageLoaded(false);
            try {
                const res = await productApi.getById(productId);
                if (res.data.success) {
                    setProduct(res.data.data);
                }
            } catch (err) {
                console.error('Failed to load product details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    if (!productId) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handlePrevImage = () => {
        if (!product) return;
        setSelectedImageIndex((prev) =>
            prev === 0 ? product.images.length - 1 : prev - 1
        );
        setImageLoaded(false);
    };

    const handleNextImage = () => {
        if (!product) return;
        setSelectedImageIndex((prev) =>
            prev === product.images.length - 1 ? 0 : prev + 1
        );
        setImageLoaded(false);
    };

    const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
    const incrementQty = () => {
        if (product) setQuantity((q) => Math.min(product.stock, q + 1));
    };

    const hasDiscount = product && product.discount > 0 && product.price < product.originalPrice;
    const categoryName = product?.category?.name ?? 'Uncategorized';

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity);
        toast.success(`Added ${quantity} ${product.name} to cart`);
        onClose();
    };

    // Generate mock rating data (since the backend has a rating field)
    const rating = product?.rating ?? 4.5;
    const reviewCount = product?.totalSold ? Math.ceil(product.totalSold * 0.3) : 0;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-[1000px] w-full max-h-[90vh] overflow-y-auto"
                style={{ animation: 'slideUp 0.3s ease-out' }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-md text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
                >
                    <X size={20} />
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="size-10 border-2 border-[#C83B1E] border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 text-sm font-medium">Loading product details...</p>
                    </div>
                ) : product ? (
                    <>
                        {/* Top section: Images + Info */}
                        <div className="flex flex-col md:flex-row gap-0">
                            {/* Image Gallery */}
                            <div className="md:w-[45%] p-6 pb-0 md:pb-6">
                                {/* Main image */}
                                <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 group">
                                    {hasDiscount && (
                                        <span className="absolute top-3 left-3 bg-[#C83B1E] text-white text-xs font-bold px-2.5 py-1 rounded-lg z-10 shadow-sm">
                                            SAVE {product.discount}%
                                        </span>
                                    )}
                                    <img
                                        src={product.images[selectedImageIndex] ?? '/placeholder.jpg'}
                                        alt={product.name}
                                        className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                        crossOrigin="anonymous"
                                        referrerPolicy="no-referrer"
                                        onLoad={() => setImageLoaded(true)}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/500x500?text=No+Image';
                                            setImageLoaded(true);
                                        }}
                                    />
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="size-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                    {/* Nav arrows */}
                                    {product.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={handlePrevImage}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md text-gray-600 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button
                                                onClick={handleNextImage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md text-gray-600 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Thumbnails */}
                                {product.images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {product.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => { setSelectedImageIndex(idx); setImageLoaded(false); }}
                                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                                    idx === selectedImageIndex
                                                        ? 'border-[#C83B1E] shadow-sm'
                                                        : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`${product.name} ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                    crossOrigin="anonymous"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=Img';
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="md:w-[55%] p-6 md:pl-2">
                                {/* Category badge */}
                                <span className="inline-block text-xs font-semibold text-[#C83B1E] bg-red-50 px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                                    {categoryName}
                                </span>

                                {/* Name */}
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                                    {product.name}
                                </h2>

                                {/* Rating & reviews */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={14}
                                                className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                                            />
                                        ))}
                                        <span className="text-sm font-semibold text-gray-700 ml-1">{rating.toFixed(1)}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">({reviewCount} Reviews)</span>
                                    {product.totalSold > 0 && (
                                        <span className="text-xs text-gray-400 border-l border-gray-200 pl-3">
                                            {product.totalSold.toLocaleString()} sold
                                        </span>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-3 mb-5">
                                    <span className="text-3xl font-black text-[#C83B1E]">
                                        ${product.price.toFixed(2)}
                                    </span>
                                    {hasDiscount && (
                                        <>
                                            <span className="text-lg text-gray-400 line-through font-medium">
                                                ${product.originalPrice.toFixed(2)}
                                            </span>
                                            <span className="text-xs font-bold text-white bg-[#C83B1E] px-2 py-0.5 rounded-md">
                                                -{product.discount}%
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                    {product.description}
                                </p>

                                {/* Stock status */}
                                <div className="flex items-center gap-2 mb-5">
                                    <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                                    </span>
                                </div>

                                {/* Quantity */}
                                {product.stock > 0 && (
                                    <div className="mb-6">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                            Quantity
                                        </label>
                                        <div className="flex items-center gap-0 border border-gray-200 rounded-xl w-fit overflow-hidden">
                                            <button
                                                onClick={decrementQty}
                                                disabled={quantity <= 1}
                                                className="px-3.5 py-2.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="px-5 py-2.5 text-sm font-bold text-gray-800 min-w-[48px] text-center border-x border-gray-200">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={incrementQty}
                                                disabled={quantity >= product.stock}
                                                className="px-3.5 py-2.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-3 mb-6">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock <= 0}
                                        className="flex-1 flex items-center justify-center gap-2 bg-[#C83B1E] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#b03318] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#C83B1E]/20 hover:shadow-[#C83B1E]/30"
                                    >
                                        <ShoppingCart size={18} />
                                        Add to Cart
                                    </button>
                                    <button
                                        disabled={product.stock <= 0}
                                        className="px-6 py-3.5 rounded-xl font-semibold text-sm border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                                    >
                                        <Zap size={16} />
                                        Buy Now
                                    </button>
                                </div>

                                {/* Shipping info */}
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Truck size={18} className="text-gray-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Free Standard Shipping</p>
                                            <p className="text-xs text-gray-400">Estimated delivery: 3–7 business days</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RotateCcw size={18} className="text-gray-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">30-Day Easy Returns</p>
                                            <p className="text-xs text-gray-400">Hassle-free returns and exchanges</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Shield size={18} className="text-gray-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Authentic Product</p>
                                            <p className="text-xs text-gray-400">100% genuine guaranteed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 gap-3">
                        <p className="text-red-500 font-semibold">Product not found</p>
                    </div>
                )}
            </div>

            {/* Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
