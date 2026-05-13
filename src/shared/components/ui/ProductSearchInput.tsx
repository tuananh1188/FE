import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Package } from 'lucide-react';
import { productApi, type Product } from '@/modules/dashboard/api/product.api';

interface ProductSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    id?: string;
}

export const ProductSearchInput: React.FC<ProductSearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Tìm kiếm theo tên hoặc mô tả…',
    className = '',
    id = 'product-search',
}) => {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync external value
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Fetch suggestions with debounce
    const fetchSuggestions = useCallback(async (q: string) => {
        if (!q.trim() || q.trim().length < 1) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }
        setLoading(true);
        try {
            const res = await productApi.getAll(q);
            const results = res.data.data.slice(0, 6);
            setSuggestions(results);
            setIsOpen(results.length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);
        onChange(q);
        setActiveIndex(-1);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(q), 300);
    };

    const handleSelect = (product: Product) => {
        setQuery(product.name);
        onChange(product.name);
        setSuggestions([]);
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const handleClear = () => {
        setQuery('');
        onChange('');
        setSuggestions([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                handleSelect(suggestions[activeIndex]);
            } else {
                setIsOpen(false);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className={`relative ${className}`} style={{ maxWidth: 384 }}>
            {/* Input */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="w-full h-10 pl-9 pr-9 border border-gray-200 rounded-xl text-sm bg-white
                               focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400
                               transition-all duration-200 placeholder:text-gray-400"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-[200] left-0 right-0 top-[calc(100%+6px)] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Gợi ý tìm kiếm
                        </span>
                        {loading && (
                            <div className="size-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        )}
                    </div>

                    {/* Suggestions list */}
                    <ul className="max-h-72 overflow-y-auto py-1">
                        {suggestions.map((product, idx) => (
                            <li key={product._id}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(product)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                                        ${activeIndex === idx ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                                >
                                    {/* Thumbnail */}
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                            className="size-9 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="size-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <Package size={16} className="text-gray-400" />
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-400 truncate">
                                            {typeof product.category === 'object' ? product.category?.name : product.category}
                                            {' · '}
                                            <span className="text-orange-500 font-medium">
                                                {(product.price * 25400).toLocaleString('vi-VN')}đ
                                            </span>
                                        </p>
                                    </div>

                                    {/* Discount badge */}
                                    {product.discount > 0 && (
                                        <span className="text-[10px] font-black bg-red-50 text-red-500 px-2 py-0.5 rounded-full flex-shrink-0">
                                            -{product.discount}%
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Footer hint */}
                    <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50">
                        <p className="text-[10px] text-gray-400">
                            Dùng <kbd className="bg-white border border-gray-200 rounded px-1 font-mono text-[9px]">↑↓</kbd> để điều hướng,{' '}
                            <kbd className="bg-white border border-gray-200 rounded px-1 font-mono text-[9px]">Enter</kbd> để chọn,{' '}
                            <kbd className="bg-white border border-gray-200 rounded px-1 font-mono text-[9px]">Esc</kbd> để đóng
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
