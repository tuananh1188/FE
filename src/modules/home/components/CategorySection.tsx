import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MdOutlineLaptopChromebook } from "react-icons/md";
import { IoShirtOutline, IoHomeOutline } from "react-icons/io5";
import { GiLipstick } from "react-icons/gi";

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', count: '2.4k Items', icon: <MdOutlineLaptopChromebook style={{ color: '#C83B1E' }} /> },
  { name: 'Fashion', slug: 'fashion', count: '5.1k Items', icon: <IoShirtOutline style={{ color: '#C83B1E' }} /> },
  { name: 'Home & Kitchen', slug: 'home', count: '1.8k Items', icon: <IoHomeOutline style={{ color: '#C83B1E' }} /> },
  { name: 'Beauty & Personal Care', slug: 'beauty', count: '3.2k Items', icon: <GiLipstick style={{ color: '#C83B1E' }} /> },
];

export const CategorySection = () => {
  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold">Shop by Category</h2>
        <Link
          to="/categories"
          className="text-[#C83B1E] text-xs font-medium flex items-center hover:underline"
        >
          View All <ChevronRight className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/categories/${cat.slug}`}
            className="bg-white rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          >
            <div className="size-12 rounded-full bg-red-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
              {cat.icon}
            </div>
            <h3 className="font-bold text-sm text-gray-900">{cat.name}</h3>
            <p className="text-[11px] text-gray-400 mt-1">{cat.count}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};
