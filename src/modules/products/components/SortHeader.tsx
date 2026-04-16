import { ChevronDown } from "lucide-react";

export type SortOption = 'top_sales' | 'price_asc' | 'price_desc' | 'newest';

interface SortHeaderProps {
    totalItems: number;
    categoryName: string;
    currentSort: SortOption;
    onSortChange: (sort: SortOption) => void;
    itemRange?: string;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: 'Top Sales', value: 'top_sales' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Newest Arrivals', value: 'newest' }
];

export const SortHeader = ({ totalItems, categoryName, currentSort, onSortChange, itemRange }: SortHeaderProps) => {
    const currentLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || 'Top Sales';

    return (
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
                <h1 className="text-gray-900 text-4xl md:text-5xl font-black tracking-tight mb-3">
                    {categoryName}
                </h1>
                {itemRange ? (
                    <p className="text-gray-500 text-sm font-medium">Showing <span className="font-bold text-gray-900">{itemRange}</span> of <span className="font-bold text-gray-900">{totalItems.toLocaleString()}</span> items</p>
                ) : (
                    <p className="text-gray-500 text-sm font-medium">Showing <span className="font-bold text-gray-900">{totalItems.toLocaleString()}</span> items</p>
                )}
            </div>
            <div className="flex items-center gap-4">
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">Sort by:</span>
                <div className="relative group">
                    <button className="flex items-center gap-10 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 hover:border-[#C83B1E] hover:text-[#C83B1E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C83B1E]/20">
                        <span>{currentLabel}</span>
                        <ChevronDown className="size-4 text-gray-400 group-hover:text-[#C83B1E] transition-colors" />
                    </button>
                    {/* Outer div creates an invisible padding bridge (pt-2) so hover doesn't break */}
                    <div className="absolute right-0 top-full pt-2 w-full hidden group-hover:block z-50">
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xl py-1">
                            {SORT_OPTIONS.map((option) => (
                                <div 
                                    key={option.value} 
                                    onClick={() => onSortChange(option.value)}
                                    className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors ${currentSort === option.value ? 'bg-red-50 text-[#C83B1E]' : 'text-gray-600 hover:bg-red-50 hover:text-[#C83B1E]'}`}
                                >
                                    {option.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};