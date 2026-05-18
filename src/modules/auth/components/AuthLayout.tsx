import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";

export const AuthLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans antialiased flex flex-col">
      {/* Nút chuyển chế độ tối/sáng (Tùy chọn) */}
      <div className="fixed right-6 top-6 z-50">
        <ThemeToggle />
      </div>

      <main className="flex-grow flex items-center justify-center p-4 md:p-12">
        <div className="w-full max-w-[1000px] overflow-hidden rounded-[24px] bg-white shadow-2xl flex flex-col md:flex-row md:min-h-[650px]">
          {/* CỘT TRÁI: Hình ảnh và Nội dung thương hiệu */}
          <section className="relative w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between text-white overflow-hidden bg-black min-h-[300px] md:min-h-full">
            {/* Background Image với lớp phủ tối */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop"
                alt="Background"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
            </div>

            <div className="relative z-10">
              <span className="text-xs md:text-sm font-semibold tracking-tight uppercase">
                The Editorial Marketplace
              </span>
            </div>

            <div className="relative z-10 space-y-4">
              <h1 className="text-3xl md:text-5xl font-medium leading-tight">
                Tuyển chọn những gì tinh túy nhất cho cuộc sống của bạn.
              </h1>
              <p className="text-base md:text-lg opacity-80 font-light max-w-sm">
                Tham gia cộng đồng những người am hiểu và khám phá những món đồ mang câu chuyện riêng.
              </p>
            </div>
          </section>

          {/* CỘT PHẢI: Form (Outlet sẽ render Register/Login ở đây) */}
          <section className="w-full md:w-1/2 bg-white p-8 md:p-16 flex flex-col justify-center">
            {/* Thanh điều hướng tab */}
            <nav className="mb-8 flex gap-6 border-b border-gray-100 pb-2">
              <Link
                to="/register"
                className={cn(
                  "text-sm font-medium transition-colors relative pb-2",
                  location.pathname === "/register"
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-600"
                    : "text-gray-400 hover:text-orange-600",
                )}
              >
                Đăng ký
              </Link>
              <Link
                to="/login"
                className={cn(
                  "text-sm font-medium transition-colors relative pb-2",
                  location.pathname === "/login"
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-600"
                    : "text-gray-400 hover:text-orange-600",
                )}
              >
                Đăng nhập
              </Link>
            </nav>

            <div className="w-full">
              <Outlet />
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-6xl mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center border-t border-gray-200 text-[13px] text-gray-500">
        <div className="space-y-1 text-center md:text-left mb-4 md:mb-0">
          <p className="font-semibold text-black">The Editorial Marketplace</p>
          <p>© 2024 Sàn Thương Mại Editorial. Đã đăng ký bản quyền.</p>
        </div>
        <div className="flex gap-6">
          <Link to="#" className="hover:text-black transition">
            Chính sách bảo mật
          </Link>
          <Link to="#" className="hover:text-black transition">
            Điều khoản dịch vụ
          </Link>
          <Link to="#" className="hover:text-black transition">
            Trung tâm trợ giúp
          </Link>
          <Link to="#" className="hover:text-black transition">
            Liên hệ
          </Link>
        </div>
      </footer>
    </div>
  );
};
