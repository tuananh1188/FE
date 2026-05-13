import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Zap, Tag, Star, Gift, Truck } from 'lucide-react';

interface VoucherTemplate {
    code: string;
    label: string;
    icon: React.ReactNode;
    color: string;
}

const VOUCHER_TEMPLATES: VoucherTemplate[] = [
    { code: 'WELCOME', label: 'Chào mừng thành viên mới', icon: <Star size={13} />, color: 'text-yellow-500 bg-yellow-50' },
    { code: 'SALE50', label: 'Flash sale 50%', icon: <Zap size={13} />, color: 'text-orange-500 bg-orange-50' },
    { code: 'FREESHIP', label: 'Miễn phí vận chuyển', icon: <Truck size={13} />, color: 'text-blue-500 bg-blue-50' },
    { code: 'SUMMER2025', label: 'Khuyến mãi hè 2025', icon: <Sparkles size={13} />, color: 'text-purple-500 bg-purple-50' },
    { code: 'VIP30', label: 'Ưu đãi khách VIP', icon: <Tag size={13} />, color: 'text-green-500 bg-green-50' },
    { code: 'BIRTHDAY', label: 'Quà tặng sinh nhật', icon: <Gift size={13} />, color: 'text-pink-500 bg-pink-50' },
    { code: 'BLACKFRIDAY', label: 'Black Friday deals', icon: <Zap size={13} />, color: 'text-gray-600 bg-gray-100' },
    { code: 'NEWSEASON', label: 'Bộ sưu tập mới', icon: <Star size={13} />, color: 'text-teal-500 bg-teal-50' },
];

interface VoucherCodeInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}

export const VoucherCodeInput: React.FC<VoucherCodeInputProps> = ({
    value,
    onChange,
    placeholder = 'Ví dụ: CHAOXUAN2024',
    required,
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filtered, setFiltered] = useState<VoucherTemplate[]>(VOUCHER_TEMPLATES);
    const [activeIndex, setActiveIndex] = useState(-1);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter templates based on current input
    useEffect(() => {
        if (!value.trim()) {
            setFiltered(VOUCHER_TEMPLATES);
        } else {
            const q = value.toUpperCase();
            setFiltered(VOUCHER_TEMPLATES.filter(t => t.code.includes(q) || t.label.toUpperCase().includes(q)));
        }
    }, [value]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        onChange(val);
        setShowSuggestions(true);
        setActiveIndex(-1);
    };

    const handleSelect = (template: VoucherTemplate) => {
        onChange(template.code);
        setShowSuggestions(false);
        setActiveIndex(-1);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || filtered.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && filtered[activeIndex]) {
                handleSelect(filtered[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setActiveIndex(-1);
        }
    };

    // Generate a random code based on current date/context
    const handleGenerateRandom = () => {
        const prefixes = ['DEAL', 'SALE', 'VIP', 'HOT', 'NEW', 'MEGA', 'SUPER', 'FLASH'];
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const suffix = Math.floor(Math.random() * 90 + 10);
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const generated = `${prefix}${year}${month}${suffix}`;
        onChange(generated);
        inputRef.current?.focus();
    };

    const isOpen = showSuggestions && filtered.length > 0;

    return (
        <div ref={wrapperRef} className="relative">
            {/* Input Row */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        required={required}
                        value={value}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoComplete="off"
                        className="w-full h-10 px-3 pr-9 border border-gray-200 rounded-lg text-sm font-mono uppercase
                                   bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400
                                   transition-all duration-200 placeholder:text-gray-400 placeholder:normal-case placeholder:font-sans"
                    />
                    <button
                        type="button"
                        onClick={() => setShowSuggestions(prev => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                        title="Xem gợi ý mã"
                    >
                        <ChevronDown size={15} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Random generate button */}
                <button
                    type="button"
                    onClick={handleGenerateRandom}
                    title="Tự động tạo mã ngẫu nhiên"
                    className="h-10 px-3 rounded-lg border border-orange-200 bg-orange-50 text-orange-500
                               hover:bg-orange-100 hover:border-orange-300 transition-all duration-200
                               flex items-center gap-1.5 text-xs font-bold whitespace-nowrap"
                >
                    <Sparkles size={13} />
                    Tạo ngẫu nhiên
                </button>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-[200] left-0 right-0 top-[calc(100%+6px)] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="px-4 py-2.5 border-b border-gray-50">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Mẫu mã phổ biến
                        </span>
                    </div>

                    {/* List */}
                    <ul className="max-h-56 overflow-y-auto py-1">
                        {filtered.map((template, idx) => (
                            <li key={template.code}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(template)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                                        ${activeIndex === idx ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                                >
                                    {/* Icon badge */}
                                    <span className={`flex-shrink-0 size-7 rounded-lg flex items-center justify-center ${template.color}`}>
                                        {template.icon}
                                    </span>

                                    {/* Code and label */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-mono font-black text-gray-800 tracking-wider">{template.code}</p>
                                        <p className="text-[11px] text-gray-400 truncate">{template.label}</p>
                                    </div>

                                    {/* Use indicator */}
                                    <span className="text-[10px] text-orange-400 font-bold flex-shrink-0">
                                        Dùng →
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Footer hint */}
                    <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50">
                        <p className="text-[10px] text-gray-400">
                            Dùng <kbd className="bg-white border border-gray-200 rounded px-1 font-mono text-[9px]">↑↓</kbd> để điều hướng,{' '}
                            <kbd className="bg-white border border-gray-200 rounded px-1 font-mono text-[9px]">Enter</kbd> để chọn
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
