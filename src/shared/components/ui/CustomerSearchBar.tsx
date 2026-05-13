import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Tag, TrendingUp, Package, Keyboard } from 'lucide-react';
import { productApi, type Product } from '@/modules/dashboard/api/product.api';
import { categoryApi, type Category } from '@/shared/api/category.api';

const TRENDING_KEYWORDS = [
    'Áo thun', 'Quần jean', 'Áo khoác', 'Giày sneaker', 'Váy đầm', 'Túi xách',
];

interface SearchResult {
    products: Product[];
    categories: Category[];
}

export const CustomerSearchBar: React.FC = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult>({ products: [], categories: [] });
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Pre-load categories once
    useEffect(() => {
        categoryApi.getAll().then(res => setAllCategories(res.data.data)).catch(() => {});
    }, []);

    // Ctrl+K shortcut
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const fetchResults = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults({ products: [], categories: [] });
            return;
        }
        setLoading(true);
        try {
            const [productRes] = await Promise.all([
                productApi.getAll(q),
            ]);
            const products = productRes.data.data.slice(0, 5);
            const categories = allCategories.filter(c =>
                c.name.toLowerCase().includes(q.toLowerCase())
            ).slice(0, 3);
            setResults({ products, categories });
        } catch {
            setResults({ products: [], categories: [] });
        } finally {
            setLoading(false);
        }
    }, [allCategories]);

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);
        setActiveIndex(-1);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchResults(q), 280);
    };

    const handleSubmit = (searchTerm?: string) => {
        const term = searchTerm ?? query;
        if (!term.trim()) return;
        navigate(`/categories?search=${encodeURIComponent(term.trim())}`);
        setIsOpen(false);
        setQuery('');
        setResults({ products: [], categories: [] });
    };

    const handleProductClick = (product: Product) => {
        navigate(`/categories?search=${encodeURIComponent(product.name)}`);
        setIsOpen(false);
        setQuery('');
    };

    const handleCategoryClick = (category: Category) => {
        navigate(`/categories/${category.slug}`);
        setIsOpen(false);
        setQuery('');
    };

    // All selectable items flattened for keyboard nav
    const allItems = [
        ...results.categories.map(c => ({ type: 'category' as const, data: c })),
        ...results.products.map(p => ({ type: 'product' as const, data: p })),
    ];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, allItems.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && allItems[activeIndex]) {
                const item = allItems[activeIndex];
                if (item.type === 'category') handleCategoryClick(item.data as Category);
                else handleProductClick(item.data as Product);
            } else {
                handleSubmit();
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setQuery('');
        }
    };

    const hasResults = results.products.length > 0 || results.categories.length > 0;
    const showTrending = !query.trim();

    // Category item index offset
    const catCount = results.categories.length;

    return (
        <>
            {/* Trigger button (collapsed state in header) */}
            <button
                type="button"
                onClick={() => {
                    setIsOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="hidden md:flex items-center gap-2 flex-1 max-w-md h-9 px-4 rounded-full
                           bg-muted/60 border border-transparent hover:border-border hover:bg-muted
                           text-muted-foreground text-sm transition-all duration-200 cursor-text group"
                id="customer-search-trigger"
            >
                <Search className="size-4 flex-shrink-0 group-hover:text-foreground transition-colors" />
                <span className="flex-1 text-left">Tìm kiếm bộ sưu tập...</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono border border-border rounded px-1.5 py-0.5 bg-background text-muted-foreground">
                    Ctrl K
                </kbd>
            </button>

            {/* Mobile search icon */}
            <button
                type="button"
                onClick={() => {
                    setIsOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                id="customer-search-trigger-mobile"
                aria-label="Tìm kiếm"
            >
                <Search className="size-5" />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
                    onClick={() => { setIsOpen(false); setQuery(''); }}
                    aria-hidden="true"
                />
            )}

            {/* Search modal */}
            {isOpen && (
                <div
                    ref={wrapperRef}
                    className="fixed top-0 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4 pt-16 sm:pt-20"
                    style={{ pointerEvents: 'none' }}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                        style={{ pointerEvents: 'auto' }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Tìm kiếm sản phẩm"
                    >
                        {/* Search input row */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <Search className="size-5 text-gray-400 flex-shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={handleQueryChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Tìm kiếm sản phẩm, danh mục..."
                                autoComplete="off"
                                className="flex-1 text-base bg-transparent outline-none text-gray-900 dark:text-gray-100
                                           placeholder:text-gray-400 caret-[#C83B1E]"
                                id="customer-search-input"
                            />
                            <div className="flex items-center gap-2">
                                {loading && (
                                    <div className="size-4 border-2 border-[#C83B1E] border-t-transparent rounded-full animate-spin" />
                                )}
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => { setQuery(''); setResults({ products: [], categories: [] }); inputRef.current?.focus(); }}
                                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => { setIsOpen(false); setQuery(''); }}
                                    className="text-xs text-gray-400 hover:text-gray-600 font-medium px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {/* Trending / empty state */}
                            {showTrending && (
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp size={13} className="text-[#C83B1E]" />
                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                            Tìm kiếm phổ biến
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {TRENDING_KEYWORDS.map(kw => (
                                            <button
                                                key={kw}
                                                type="button"
                                                onClick={() => { setQuery(kw); fetchResults(kw); }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-[#C83B1E]/10
                                                           text-sm text-gray-600 hover:text-[#C83B1E] border border-gray-200 hover:border-[#C83B1E]/30
                                                           transition-all duration-150 font-medium"
                                            >
                                                <Search size={12} className="opacity-50" />
                                                {kw}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Quick category browse */}
                                    {allCategories.length > 0 && (
                                        <div className="mt-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Tag size={13} className="text-purple-500" />
                                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                                    Danh mục nổi bật
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {allCategories.slice(0, 6).map(cat => (
                                                    <button
                                                        key={cat._id}
                                                        type="button"
                                                        onClick={() => handleCategoryClick(cat)}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-purple-50
                                                                   text-sm text-gray-600 hover:text-purple-600 border border-gray-100
                                                                   hover:border-purple-200 transition-all duration-150 text-left group"
                                                    >
                                                        <span className="size-6 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:border-purple-200">
                                                            {cat.image ? (
                                                                <img src={cat.image} alt={cat.name} className="size-4 object-cover rounded" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                                                            ) : (
                                                                <Tag size={12} className="text-gray-400" />
                                                            )}
                                                        </span>
                                                        <span className="font-medium truncate">{cat.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Results */}
                            {!showTrending && hasResults && (
                                <div className="py-2">
                                    {/* Category results */}
                                    {results.categories.length > 0 && (
                                        <div className="mb-1">
                                            <div className="px-5 py-2 flex items-center gap-2">
                                                <Tag size={12} className="text-purple-400" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Danh mục</span>
                                            </div>
                                            {results.categories.map((cat, idx) => (
                                                <button
                                                    key={cat._id}
                                                    type="button"
                                                    onClick={() => handleCategoryClick(cat)}
                                                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors
                                                        ${activeIndex === idx ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                                                >
                                                    <span className="size-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
                                                        {cat.image ? (
                                                            <img src={cat.image} alt={cat.name} className="size-5 object-cover rounded-lg" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                                                        ) : (
                                                            <Tag size={14} className="text-purple-400" />
                                                        )}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                                                        <p className="text-xs text-gray-400">Xem tất cả sản phẩm trong danh mục</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Product results */}
                                    {results.products.length > 0 && (
                                        <div>
                                            <div className="px-5 py-2 flex items-center gap-2">
                                                <Package size={12} className="text-orange-400" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Sản phẩm</span>
                                            </div>
                                            {results.products.map((product, idx) => {
                                                const itemIdx = catCount + idx;
                                                return (
                                                    <button
                                                        key={product._id}
                                                        type="button"
                                                        onClick={() => handleProductClick(product)}
                                                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors
                                                            ${activeIndex === itemIdx ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                                                    >
                                                        {/* Thumbnail */}
                                                        {product.images?.[0] ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                crossOrigin="anonymous"
                                                                referrerPolicy="no-referrer"
                                                                className="size-10 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                                <Package size={16} className="text-gray-400" />
                                                            </div>
                                                        )}

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-xs font-bold text-[#C83B1E]">
                                                                    {(product.price * 25400).toLocaleString('vi-VN')}đ
                                                                </span>
                                                                {product.discount > 0 && (
                                                                    <span className="text-[10px] font-bold bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">
                                                                        -{product.discount}%
                                                                    </span>
                                                                )}
                                                                {product.originalPrice > product.price && (
                                                                    <span className="text-[10px] text-gray-400 line-through">
                                                                        {(product.originalPrice * 25400).toLocaleString('vi-VN')}đ
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* View all results CTA */}
                                    <div className="px-5 py-3 border-t border-gray-50 mt-1">
                                        <button
                                            type="button"
                                            onClick={() => handleSubmit()}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                                       bg-gradient-to-r from-[#C83B1E] to-orange-500 text-white
                                                       text-sm font-bold hover:from-[#b03319] hover:to-orange-600
                                                       transition-all duration-200 shadow-sm shadow-orange-200"
                                        >
                                            <Search size={14} />
                                            Xem tất cả kết quả cho "{query}"
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* No results */}
                            {!showTrending && !hasResults && !loading && (
                                <div className="px-5 py-12 text-center">
                                    <div className="size-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                                        <Package size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-700 font-semibold mb-1">Không tìm thấy kết quả</p>
                                    <p className="text-gray-400 text-sm">
                                        Thử tìm kiếm với từ khóa khác hoặc duyệt theo danh mục
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit()}
                                        className="mt-4 px-4 py-2 rounded-xl bg-[#C83B1E] text-white text-sm font-bold
                                                   hover:bg-[#b03319] transition-colors"
                                    >
                                        Tìm kiếm "{query}"
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer keyboard hints */}
                        <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50/50 flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                <Keyboard size={11} />
                                <span>
                                    <kbd className="bg-white border border-gray-200 rounded px-1 font-mono text-[9px]">↑↓</kbd>
                                    {' '}điều hướng
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                <span>
                                    <kbd className="bg-white border border-gray-200 rounded px-1 font-mono text-[9px]">Enter</kbd>
                                    {' '}xem kết quả
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                <span>
                                    <kbd className="bg-white border border-gray-200 rounded px-1 font-mono text-[9px]">Esc</kbd>
                                    {' '}đóng
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
