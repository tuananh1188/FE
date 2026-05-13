import { Link } from 'react-router-dom';
import { ChevronDown, Smartphone, Shirt, Home, Sparkles } from 'lucide-react';

const BRAND_CATEGORIES = [
    {
        title: "Điện tử & Công nghệ",
        icon: <Smartphone className="size-4 text-[#C83B1E]" />,
        brands: ["Apple", "Samsung", "Sony", "LG", "Asus", "JBL"]
    },
    {
        title: "Thời trang",
        icon: <Shirt className="size-4 text-[#C83B1E]" />,
        brands: ["Nike", "Adidas", "Zara", "H&M", "Uniqlo", "Levi's"]
    },
    {
        title: "Gia dụng & Đời sống",
        icon: <Home className="size-4 text-[#C83B1E]" />,
        brands: ["Lock&Lock", "Philips", "Dyson", "Panasonic", "Xiaomi", "Sunhouse"]
    },
    {
        title: "Mỹ phẩm & Làm đẹp",
        icon: <Sparkles className="size-4 text-[#C83B1E]" />,
        brands: ["L'Oreal", "MAC", "The Ordinary", "Innisfree", "Laneige", "Kiehl's"]
    }
];

export const BrandMegaMenu = () => {
    return (
        <div className="relative group h-full flex items-center">
            {/* Nav Link Trigger */}
            <div className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground h-full py-5">
                <span>Thương hiệu</span>
                <ChevronDown className="size-3 group-hover:rotate-180 transition-transform duration-200" />
            </div>

            {/* Mega Menu Dropdown */}
            {/* The invisible top-padding bridge prevents hover from breaking */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[800px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-4 p-6 gap-8">
                        {BRAND_CATEGORIES.map((category) => (
                            <div key={category.title}>
                                <div className="flex items-center gap-2 mb-4">
                                    {category.icon}
                                    <h4 className="font-bold text-sm text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {category.title}
                                    </h4>
                                </div>
                                <ul className="space-y-3">
                                    {category.brands.map((brand) => (
                                        <li key={brand}>
                                            <Link
                                                to={`/categories?search=${encodeURIComponent(brand.toLowerCase())}`}
                                                className="text-[13px] text-gray-500 hover:text-[#C83B1E] hover:font-medium transition-colors flex items-center gap-2"
                                            >
                                                <span className="size-1 bg-gray-300 rounded-full group-hover:bg-[#C83B1E]"></span>
                                                {brand}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    {/* Bottom CTA Banner inside Mega Menu */}
                    <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">Khám phá hàng ngàn sản phẩm chính hãng từ các thương hiệu hàng đầu thế giới.</p>
                        <Link
                            to="/categories"
                            className="text-xs font-bold text-[#C83B1E] hover:underline"
                        >
                            Xem tất cả sản phẩm &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
