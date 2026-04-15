import { Star } from "lucide-react";

export const FilterSideBar = () => {
    return (
        <aside className="w-64 flex-shrink-0 pr-10 hidden lg:block">
            <div className="sticky top-8 space-y-10">
                {/* Category */}
                <div>
                    <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4">Category</h4>
                    <div className="space-y-3">
                        {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Personal Care'].map((category) => (
                            <label key={category} className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className=" accent-[#C83B1E] rounded border-gray-300 text-[#C83B1E] focus:ring-[#C83B1E]" defaultChecked={category === 'Fashion'} />
                                <span className="text-sm font-medium">{category}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Price Range */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white text-xs font-bold uppercase tracking-widest">Price</h4>
                    <span className="text-[#C83B1E] text-xs font-bold ">$0 - $2,500</span>
                </div>
                <input type="range" className="w-full accent-[#C83B1E]" min="0" max="5000" />
                <div className="flex justify-between text-[10px] mt-2">
                    <span>$0</span>
                    <span>$5,000</span>
                </div>
            </div>

            {/* Rating Filter */}
            <div>
                <h4 className="text-white text-xs mb-4 font-bold uppercase tracking-widest">Rating</h4>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="size-3 fill-current" />)}
                    <span className="text-gray-400 text-xs ml-2">5.0</span>
                </div>
                <div className="flex items-center gap-2 text-[#C83B1E] text-sm">
                    {[1, 2, 3, 4].map(i => <Star key={i} className="size-3 fill-current" />)}
                    <Star className="size-3 text-gray-600" />
                    <span className="text-gray-400 text-xs ml-2">& Up</span>
                </div>
            </div>

        </aside>
    );
};