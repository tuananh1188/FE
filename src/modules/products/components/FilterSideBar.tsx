import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { categoryApi, type Category } from "../../../shared/api/category.api";
import { Button } from "@/shared/components/ui/button";

interface FilterSideBarProps {
    minPrice: number;
    maxPrice: number;
    onPriceChange: (min: number, max: number) => void;
}

export const FilterSideBar = ({ minPrice, maxPrice, onPriceChange }: FilterSideBarProps) => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [categories, setCategories] = useState<Category[]>([]);
    const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || 5000);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryApi.getAll();
                setCategories(res.data.data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        setLocalMaxPrice(maxPrice || 5000);
    }, [maxPrice]);

    const handlePriceDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setLocalMaxPrice(val);
    };

    const handlePriceRelease = () => {
        onPriceChange(0, localMaxPrice);
    };

    return (
        <aside className="w-64 flex-shrink-0 pr-10 hidden lg:block">
            <div className="sticky top-24 space-y-10">
                {/* Category */}
                <div>
                    <h4 className="text-gray-900 text-xs font-black uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Danh mục</h4>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                className="size-4 accent-[#C83B1E] rounded border-gray-300 text-[#C83B1E] focus:ring-[#C83B1E] transition-all" 
                                checked={!slug}
                                onChange={() => navigate('/categories')}
                            />
                            <span className={`text-sm font-medium transition-colors ${!slug ? 'text-[#C83B1E]' : 'text-gray-600 group-hover:text-[#C83B1E]'}`}>
                                Tất cả danh mục
                            </span>
                        </label>
                        {categories.map((cat) => (
                            <label key={cat.slug} className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="size-4 accent-[#C83B1E] rounded border-gray-300 text-[#C83B1E] focus:ring-[#C83B1E] transition-all" 
                                    checked={slug === cat.slug}
                                    onChange={() => {
                                        if (slug === cat.slug) {
                                            navigate('/categories');
                                        } else {
                                            navigate(`/categories/${cat.slug}`);
                                        }
                                    }}
                                />
                                <span className={`text-sm font-medium transition-colors ${slug === cat.slug ? 'text-[#C83B1E]' : 'text-gray-600 group-hover:text-[#C83B1E]'}`}>
                                    {cat.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                        <h4 className="text-gray-900 text-xs font-black uppercase tracking-widest">Giá</h4>
                        <span className="text-[#C83B1E] text-xs font-bold bg-red-50 px-2 py-1 rounded-md">$0 - ${localMaxPrice.toLocaleString()}</span>
                    </div>
                    <input 
                        type="range" 
                        className="w-full accent-[#C83B1E] cursor-pointer" 
                        min="0" 
                        max="5000" 
                        step="50"
                        value={localMaxPrice}
                        onChange={handlePriceDrag}
                        onMouseUp={handlePriceRelease}
                        onTouchEnd={handlePriceRelease}
                    />
                    <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-2">
                        <span>$0</span>
                        <span>$5,000+</span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-4 text-[11px] h-7 text-gray-400 hover:text-[#C83B1E] font-bold"
                        onClick={() => onPriceChange(0, 0)}
                    >
                        Đặt lại bộ lọc giá
                    </Button>
                </div>
            </div>
        </aside>
    );
};