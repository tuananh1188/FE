import { Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export const HomeFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <h1 className="text-[#C83B1E] font-bold text-lg leading-tight">Editorial Marketplace</h1>
            <p className="text-xs text-gray-500 leading-relaxed">Điểm đến hàng đầu cho sự tuyển chọn kỹ thuật số và thương mại hiện đại. Chất lượng được chọn lọc kỹ lưỡng cho mọi phong cách sống.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6">Chăm sóc khách hàng</h4>
            <ul className="text-xs text-gray-500 space-y-3">
              <li><a href="#">Trung tâm trợ giúp</a></li>
              <li><a href="#">Thông tin vận chuyển</a></li>
              <li><a href="#">Trả hàng & Hoàn tiền</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6">Chính sách</h4>
            <ul className="text-xs text-gray-500 space-y-3">
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Điều khoản dịch vụ</a></li>
              <li><a href="#">Trung tâm người bán</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6">Cập nhật tin tức</h4>
            <p className="text-xs text-gray-500 mb-4">Đăng ký để nhận các ưu đãi đặc biệt và khuyến mãi độc quyền.</p>
            <div className="flex bg-gray-50 rounded-md p-1 border border-gray-100">
              <Input className="bg-transparent border-none focus-visible:ring-0 text-xs h-8" placeholder="Địa chỉ Email" />
              <Button className="bg-[#C83B1E] size-8 p-0 shrink-0"><Mail className="size-4" /></Button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400">
          <p>© 2024 Editorial Marketplace. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <span>Tiếng Việt</span>
            <span>VND</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
