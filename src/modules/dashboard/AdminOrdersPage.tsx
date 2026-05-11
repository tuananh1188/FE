import { useEffect, useState } from 'react';
import { orderApi, type OrderAPIResponse } from '@/shared/api/order.api';
import { toast } from 'sonner';
import { Loader2, Eye, CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<OrderAPIResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAllOrders();
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string, type: 'orderStatus' | 'paymentStatus') => {
    try {
      const payload = type === 'orderStatus' ? { orderStatus: status } : { paymentStatus: status };
      const res = await orderApi.updateOrderStatus(orderId, payload);
      if (res.data.success) {
        toast.success(`Cập nhật trạng thái ${type === 'orderStatus' ? 'đơn hàng' : 'thanh toán'} thành công`);
        setOrders(orders.map(o => o._id === orderId ? { ...o, ...payload } as OrderAPIResponse : o));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-700';
      case 'DELIVERED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã đơn & Ngày đặt</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thanh toán</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái đơn</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-semibold text-gray-900">#{order._id.slice(-8).toUpperCase()}</div>
                    <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.shippingAddress.fullName}</div>
                    <div className="text-xs text-gray-500">{order.shippingAddress.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{(order.totalAmount * 25400).toLocaleString('vi-VN')}đ</div>
                    <div className="text-xs text-gray-500">{order.items.length} sản phẩm</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                        {order.paymentMethod === 'COD' ? (
                          <Banknote size={14} className="text-green-600" />
                        ) : order.paymentMethod === 'BANK_TRANSFER' ? (
                          <CheckCircle2 size={14} className="text-orange-600" />
                        ) : (
                          <CreditCard size={14} className="text-blue-600" />
                        )}
                        {order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản (QR)' : order.paymentMethod}
                      </span>

                      <select 
                        value={order.paymentStatus}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value, 'paymentStatus')}
                        className={`text-xs font-bold rounded-full px-2 py-0.5 border-none cursor-pointer outline-none ${getStatusColor(order.paymentStatus)}`}
                      >
                        <option value="PENDING">CHỜ THANH TOÁN</option>
                        <option value="PAID">ĐÃ THANH TOÁN</option>
                        <option value="FAILED">THẤT BẠI</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={order.orderStatus}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value, 'orderStatus')}
                      className={`text-xs font-bold rounded-full px-2 py-1 flex border-none cursor-pointer outline-none ${getStatusColor(order.orderStatus)}`}
                    >
                      <option value="PENDING">CHỜ XÁC NHẬN</option>
                      <option value="PROCESSING">ĐANG XỬ LÝ</option>
                      <option value="SHIPPED">ĐANG GIAO</option>
                      <option value="DELIVERED">ĐÃ GIAO</option>
                      <option value="CANCELLED">ĐÃ HỦY</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#FF6B00]">
                      <Eye size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
