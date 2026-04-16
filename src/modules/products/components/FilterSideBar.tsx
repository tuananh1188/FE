import { Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const CATEGORIES = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Home & Kitchen', slug: 'home' },
    { name: 'Beauty & Personal Care', slug: 'beauty' }
];

export const FilterSideBar = () => {
    const navigate = useNavigate();
    const { slug } = useParams();

    return (
        <aside className="w-64 flex-shrink-0 pr-10 hidden lg:block">
            <div className="sticky top-24 space-y-10">
                {/* Category */}
                <div>
                    <h4 className="text-gray-900 text-xs font-black uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Category</h4>
                    <div className="space-y-3">
                        {CATEGORIES.map((cat) => (
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
                        <h4 className="text-gray-900 text-xs font-black uppercase tracking-widest">Price</h4>
                        <span className="text-[#C83B1E] text-xs font-bold bg-red-50 px-2 py-1 rounded-md">$0 - $2,500</span>
                    </div>
                    <input type="range" className="w-full accent-[#C83B1E]" min="0" max="5000" />
                    <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-2">
                        <span>$0</span>
                        <span>$5,000</span>
                    </div>
                </div>

                {/* Rating Filter */}
                <div>
                    <h4 className="text-gray-900 text-xs font-black uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Rating</h4>
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="rating" className="accent-[#C83B1E]" />
                            <div className="flex text-[#C83B1E]">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="size-4 fill-current" />)}
                            </div>
                            <span className="text-gray-600 text-xs font-medium ml-1">5.0</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="rating" className="accent-[#C83B1E]" />
                            <div className="flex text-[#C83B1E]">
                                {[1, 2, 3, 4].map(i => <Star key={i} className="size-4 fill-current" />)}
                                <Star className="size-4 text-gray-300" />
                            </div>
                            <span className="text-gray-600 text-xs font-medium ml-1">& Up</span>
                        </label>
                    </div>
                </div>
            </div>
        </aside>
    );
};