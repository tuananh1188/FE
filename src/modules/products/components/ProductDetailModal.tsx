import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, Minus, Plus, ShoppingCart, Zap, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import type { Product } from '@/modules/dashboard/api/product.api';
import { productApi } from '@/modules/dashboard/api/product.api';
import { useCart } from '@/shared/context/CartContext';
import { useFavorite } from '@/shared/context/FavoriteContext';
import { toast } from 'sonner';
import { ReviewSection } from './ReviewSection';

interface ProductDetailModalProps {
    productId: string | null;
    onClose: () => void;
}

export function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [localRating, setLocalRating] = useState(0);
    const [localReviewCount, setLocalReviewCount] = useState(0);
    const { addToCart } = useCart();
    const { isFavorite, toggleFavorite } = useFavorite();
    const navigate = useNavigate();
    const [displayImage, setDisplayImage] = useState<string>('/products/electronics.png');
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [currentId, setCurrentId] = useState<string | null>(productId);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    useEffect(() => {
        setCurrentId(productId);
    }, [productId]);

    const isLiked = currentId ? isFavorite(currentId) : false;

    const handleToggleFavorite = () => {
        if (currentId) {
            toggleFavorite(currentId);
        }
    };

    useEffect(() => {
        if (!currentId) {
            setProduct(null);
            setRelatedProducts([]);
            return;
        }

        const fetchProduct = async () => {
            setLoading(true);
            setSelectedImageIndex(0);
            setQuantity(1);
            setImageLoaded(false);
            try {
                const res = await productApi.getById(currentId);
                if (res.data.success) {
                    setProduct(res.data.data);
                    setLocalRating(res.data.data.rating ?? 0);
                    setLocalReviewCount(res.data.data.reviewCount ?? 0);
                    
                    // Reset selections when product changes
                    setSelectedSize('');
                    setSelectedColor('');
                    setIsDescriptionExpanded(false);

                    // Fetch related products
                    const relatedRes = await productApi.getRelatedProducts(currentId);
                    if (relatedRes.data.success) {
                        setRelatedProducts(relatedRes.data.data);
                    }
                }
            } catch (err) {
                console.error('Failed to load product details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [currentId]);

    useEffect(() => {
        if (product && product.images[selectedImageIndex]) {
            const primaryImage = product.images[selectedImageIndex];
            if (!primaryImage.startsWith('http')) {
                setDisplayImage(primaryImage);
                setImageLoaded(true);
                return;
            }

            // Silent pre-check
            const img = new Image();
            img.src = primaryImage;
            img.onload = () => {
                setDisplayImage(primaryImage);
                setImageLoaded(true);
            };
            img.onerror = () => {
                setDisplayImage('/products/electronics.png');
                setImageLoaded(true);
            };
        }
    }, [product, selectedImageIndex]);

    if (!currentId) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handlePrevImage = () => {
        if (!product) return;
        setSelectedImageIndex((prev) =>
            prev === 0 ? product.images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        if (!product) return;
        setSelectedImageIndex((prev) =>
            prev === product.images.length - 1 ? 0 : prev + 1
        );
    };

    const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
    const incrementQty = () => {
        if (product) setQuantity((q) => Math.min(product.stock, q + 1));
    };

    const hasDiscount = product && product.discount > 0 && product.price < product.originalPrice;
    const categoryName = product?.category?.name ?? 'Uncategorized';

    const handleAddToCart = async () => {
        if (!product) return;

        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.error('Vui lòng chọn kích cỡ (Size)');
            return;
        }
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            toast.error('Vui lòng chọn màu sắc');
            return;
        }

        try {
            await addToCart(product, quantity, selectedSize, selectedColor);
            toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
            onClose();
        } catch (err) {
            // Error handled by context
        }
    };

    const handleBuyNow = async () => {
        if (!product) return;
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.error('Vui lòng chọn kích cỡ (Size)');
            return;
        }
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            toast.error('Vui lòng chọn màu sắc');
            return;
        }

        try {
            await addToCart(product, quantity, selectedSize, selectedColor);
            navigate('/checkout');
            onClose();
        } catch (err) {
            // Error handled by context
        }
    };

    // Use live rating state
    const rating = localRating;
    const reviewCount = localReviewCount;

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
                        <p className="text-gray-500 text-sm font-medium">Đang tải chi tiết sản phẩm...</p>
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
                                            GIẢM {product.discount}%
                                        </span>
                                    )}
                                    <img
                                        src={displayImage}
                                        alt={product.name}
                                        className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
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
                                                onClick={() => { setSelectedImageIndex(idx); }}
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
                                    <span className="text-xs text-gray-400">({reviewCount} Đánh giá)</span>
                                    {product.totalSold > 0 && (
                                        <span className="text-xs text-gray-400 border-l border-gray-200 pl-3">
                                            Đã bán {product.totalSold.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-3 mb-5">
                                    <span className="text-3xl font-black text-[#C83B1E]">
                                        {(product.price * 25400).toLocaleString('vi-VN')}đ
                                    </span>
                                    {hasDiscount && (
                                        <>
                                            <span className="text-lg text-gray-400 line-through font-medium">
                                                {(product.originalPrice * 25400).toLocaleString('vi-VN')}đ
                                            </span>
                                            <span className="text-xs font-bold text-white bg-[#C83B1E] px-2 py-0.5 rounded-md">
                                                -{product.discount}%
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <p className={`text-sm text-gray-600 leading-relaxed transition-all duration-300 ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                                        {product.description}
                                    </p>
                                    {product.description.length > 150 && (
                                        <button
                                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                            className="text-[#C83B1E] text-xs font-bold mt-1 hover:underline cursor-pointer flex items-center gap-1"
                                        >
                                            {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
                                        </button>
                                    )}
                                </div>

                                {/* Stock status */}
                                <div className="flex items-center gap-2 mb-5">
                                    <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {product.stock > 0 ? `Còn hàng (${product.stock} sản phẩm)` : 'Hết hàng'}
                                    </span>
                                </div>

                                {/* Size Selection */}
                                {product.sizes && product.sizes.length > 0 && (
                                    <div className="mb-5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                            Kích cỡ (Size)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {product.sizes.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`min-w-[48px] h-10 px-3 text-sm font-bold rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                                        selectedSize === size
                                                            ? 'border-[#C83B1E] bg-[#C83B1E] text-white shadow-md shadow-[#C83B1E]/20'
                                                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-white'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Color Selection */}
                                {product.colors && product.colors.length > 0 && (
                                    <div className="mb-5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                            Màu sắc
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {product.colors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`h-10 px-5 text-sm font-bold rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                                        selectedColor === color
                                                            ? 'border-[#C83B1E] bg-[#C83B1E] text-white shadow-md shadow-[#C83B1E]/20'
                                                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-white'
                                                    }`}
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity */}
                                {product.stock > 0 && (
                                    <div className="mb-6">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                                            Số lượng
                                        </label>
                                        <div className="flex items-center gap-0 border-2 border-gray-100 rounded-xl w-fit overflow-hidden bg-gray-50">
                                            <button
                                                onClick={decrementQty}
                                                disabled={quantity <= 1}
                                                className="px-4 py-2.5 text-gray-500 hover:bg-white hover:text-[#C83B1E] disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="px-6 py-2.5 text-base font-black text-gray-800 min-w-[56px] text-center border-x-2 border-gray-100 bg-white">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={incrementQty}
                                                disabled={quantity >= product.stock}
                                                className="px-4 py-2.5 text-gray-500 hover:bg-white hover:text-[#C83B1E] disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="grid grid-cols-5 gap-3 mb-6">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock <= 0}
                                        className="col-span-2 flex items-center justify-center gap-2 bg-[#C83B1E] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-[#b03318] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#C83B1E]/25 hover:shadow-[#C83B1E]/40"
                                    >
                                        <ShoppingCart size={18} />
                                        Giỏ hàng
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={product.stock <= 0}
                                        className="col-span-2 flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30"
                                    >
                                        <Zap size={18} className="text-amber-400 fill-amber-400" />
                                        Mua ngay
                                    </button>
                                    <button
                                        onClick={handleToggleFavorite}
                                        className={`col-span-1 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                                            isLiked 
                                                ? 'border-red-500 bg-red-50 text-red-500 shadow-md shadow-red-500/10' 
                                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-red-200 hover:text-red-400 hover:bg-white'
                                        }`}
                                    >
                                        <Heart size={22} className={isLiked ? 'fill-red-500' : ''} />
                                    </button>
                                </div>

                                {/* Shipping info */}
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Truck size={18} className="text-gray-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Miễn phí vận chuyển tiêu chuẩn</p>
                                            <p className="text-xs text-gray-400">Giao hàng dự kiến: 3–7 ngày làm việc</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RotateCcw size={18} className="text-gray-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Đổi trả trong 30 ngày</p>
                                            <p className="text-xs text-gray-400">Đổi trả và hoàn tiền dễ dàng</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Shield size={18} className="text-gray-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Sản phẩm chính hãng</p>
                                            <p className="text-xs text-gray-400">Cam kết 100% hàng thật</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Related Products Section */}
                            {relatedProducts.length > 0 && (
                                <div className="px-6 py-6 border-t border-gray-100 bg-gray-50/10">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                                        Sản phẩm liên quan
                                    </h3>
                                    <div className="space-y-3">
                                        {relatedProducts.map((p) => (
                                            <button
                                                key={p._id}
                                                onClick={() => {
                                                    setCurrentId(p._id);
                                                    document.querySelector('.max-h-\\[90vh\\]')?.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="w-full flex items-center gap-4 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all group cursor-pointer border border-transparent hover:border-gray-100"
                                            >
                                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                    <img
                                                        src={p.images[0] || '/products/electronics.png'}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h4 className="text-sm font-bold text-gray-800 line-clamp-1 mb-0.5 group-hover:text-[#C83B1E] transition-colors">
                                                        {p.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-[#C83B1E]">
                                                            {(p.price * 25400).toLocaleString('vi-VN')}đ
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                                                            {p.category?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                                    <ChevronRight size={16} className="text-gray-300" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 gap-3">
                        <p className="text-red-500 font-semibold">Không tìm thấy sản phẩm</p>
                    </div>
                )}

                {/* Reviews Section */}
                {product && (
                    <ReviewSection
                        productId={product._id}
                        productRating={localRating}
                        reviewCount={localReviewCount}
                        onRatingUpdated={(newRating, newCount) => {
                            setLocalRating(newRating);
                            setLocalReviewCount(newCount);
                        }}
                    />
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
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
