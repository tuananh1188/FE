import { ChevronRight } from 'lucide-react';
import { MdOutlineLaptopChromebook } from "react-icons/md";
import { IoShirtOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { GiLipstick } from "react-icons/gi";


export const CategorySection = () => {
  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold">Shop by Category</h2>
        <a href="#" className="text-[#C83B1E] text-xs font-medium flex items-center">View All <ChevronRight className="size-3" /></a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { name: 'Electronics', count: '2.4k Items', icon: <MdOutlineLaptopChromebook style={{ color: '#C83B1E' }} />, bg: 'bg-white' },
          { name: 'Fashion', count: '5.1k Items', icon: <IoShirtOutline style={{ color: '#C83B1E' }} />, bg: 'bg-white' },
          { name: 'Home', count: '1.8k Items', icon: <IoHomeOutline style={{ color: '#C83B1E' }} />, bg: 'bg-white' },
          { name: 'Beauty', count: '3.2k Items', icon: <GiLipstick style={{ color: '#C83B1E' }} />, bg: 'bg-white' },
        ].map((cat) => (
          <div key={cat.name} className={`${cat.bg} rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition cursor-pointer`}>
            <div className="size-12 rounded-full bg-red-50 flex items-center justify-center text-2xl mb-4">{cat.icon}</div>
            <h3 className="font-bold text-sm">{cat.name}</h3>
            <p className="text-[11px] text-gray-400 mt-1">{cat.count}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
