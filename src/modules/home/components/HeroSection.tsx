import { Link } from 'react-router-dom';


export const HeroSection = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
      {/* Main hero banner → tất cả sản phẩm */}
      <Link
        to="/categories"
        className="md:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer block"
      >
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-12 text-white">
          <span className="text-xs tracking-widest uppercase mb-4 opacity-80">Bộ sưu tập hè 2024</span>
          <h2 className="text-5xl font-bold mb-6 leading-tight">Định nghĩa<br />Sự sang trọng</h2>
          <span className="inline-block w-fit bg-[#C83B1E] hover:bg-[#A63018] rounded-md px-8 py-2 text-sm font-medium text-white transition-colors">
            Khám phá ngay
          </span>
        </div>
      </Link>

      <div className="flex flex-col gap-4">
        {/* Shoes banner → tìm kiếm 'giày' */}
        <Link
          to="/categories?search=giày"
          className="flex-1 relative rounded-2xl overflow-hidden bg-black text-white p-6 group cursor-pointer block"
        >
          <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070" className="absolute right-0 bottom-0 h-3/4 object-contain opacity-80 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100" />
          <div className="relative z-10">
            <h3 className="font-bold text-lg">Giày dép mới</h3>
            <p className="text-xs opacity-70">Giảm đến 40%</p>
            <span className="inline-block mt-3 text-[11px] font-semibold text-white/70 group-hover:text-white transition-colors underline underline-offset-2">
              Mua ngay →
            </span>
          </div>
        </Link>

        {/* Tech banner → danh mục electronics */}
        <Link
          to="/categories/electronics"
          className="flex-1 relative rounded-2xl overflow-hidden bg-[#E5E7EB] p-6 group cursor-pointer block"
        >
          <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999" className="absolute right-0 bottom-0 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110" />
          <div className="relative z-10">
            <h3 className="font-bold text-lg">Công nghệ & Phong cách</h3>
            <p className="text-xs text-gray-500">Tiện ích tuyển chọn</p>
            <span className="inline-block mt-3 text-[11px] font-semibold text-gray-500 group-hover:text-[#C83B1E] transition-colors underline underline-offset-2">
              Khám phá →
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};

