import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/shared/context/CartContext';
import { orderApi } from '@/shared/api/order.api';
import { authApi } from '@/modules/auth/api/auth.api';
import { voucherApi, type Voucher } from '@/shared/api/voucher.api';
import { tokenStore } from '@/modules/auth/store/token.store';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Building2,
  MessageSquare,
  CreditCard,
  Banknote,
  ShieldCheck,
  Package,
  Loader2,
  CheckCircle2,
  Tag,
  Ticket,
} from 'lucide-react';

export const CheckoutPage = () => {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CREDIT_CARD' | 'BANK_TRANSFER'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);



  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  
  // New Voucher Picker states
  const [userVouchers, setUserVouchers] = useState<Voucher[]>([]);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const shipping = 0;
  const taxRate = 0.08;
  const tax = cartSubtotal * taxRate;
  const totalBeforeVoucher = cartSubtotal + shipping + tax;
  const total = Math.max(0, totalBeforeVoucher - discount);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    
    try {
      const res = await voucherApi.validate(voucherCode, totalBeforeVoucher);
      if (res.data.success) {
        setAppliedVoucher(res.data.voucher);
        setDiscount(res.data.discount);
        toast.success(`Đã áp dụng mã giảm giá: -${(res.data.discount * 25400).toLocaleString('vi-VN')}đ`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setAppliedVoucher(null);
      setDiscount(0);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscount(0);
    setVoucherCode('');
    toast.info('Đã gỡ mã giảm giá');
  };

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (tokenStore.get()) {
        try {
          const res = await authApi.getMe();
          if (res.data && res.data.data) {
              const userData = res.data.data;
              const addresses = userData.addresses || [];
              setUserAddresses(addresses);

              // Auto-fill with default address if exists
              const defaultAddr = addresses.find((a: any) => a.isDefault);
              if (defaultAddr) {
                  setForm((prev) => ({
                    ...prev,
                    fullName: defaultAddr.fullName,
                    phone: defaultAddr.phone,
                    address: `${defaultAddr.detail}, ${defaultAddr.ward}, ${defaultAddr.province}`,
                    city: defaultAddr.province,
                  }));
              } else {
                  setForm((prev) => ({
                    ...prev,
                    fullName: prev.fullName || userData.displayName || '',
                    phone: prev.phone || userData.phone || '',
                    address: prev.address || userData.address || '',
                    city: prev.city || userData.city || '',
                  }));
              }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }

        // Fetch User Vouchers
        try {
          const vRes = await voucherApi.getMyVouchers();
          if (vRes.data.success) {
            setUserVouchers(vRes.data.data);
          }
        } catch (err) {
            console.error('Failed to fetch user vouchers:', err);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const selectSavedAddress = (addr: any) => {
    setForm({
      ...form,
      fullName: addr.fullName,
      phone: addr.phone,
      address: `${addr.detail}, ${addr.ward}, ${addr.province}`,
      city: addr.province,
    });
    toast.success(`Đã chọn địa chỉ: ${addr.label}`);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Họ và tên là bắt buộc';
    if (!form.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc';
    else if (!/^[0-9]{9,15}$/.test(form.phone.replace(/\s/g, '')))
      newErrors.phone = 'Số điện thoại không hợp lệ';
    if (!form.address.trim()) newErrors.address = 'Địa chỉ giao hàng là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city || undefined,
          notes: form.notes || undefined,
        },
        paymentMethod,
        promoCode: appliedVoucher?.code || undefined,
      };

      const res = await orderApi.checkout(payload);
      if (res.data.success) {
        setOrderSuccess(res.data.data);
        await clearCart();
        toast.success('🎉 Đặt hàng thành công!');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!orderSuccess?._id) return;
    
    try {
      setIsConfirmingPayment(true);
      const res = await orderApi.confirmPayment(orderSuccess._id);
      if (res.data.success) {
        toast.success('Đã xác nhận thanh toán! Đơn hàng đang được xử lý.');
        setOrderSuccess(res.data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xác nhận thanh toán thất bại');
    } finally {
      setIsConfirmingPayment(false);
    }
  };


  // Redirect if cart is empty and no successful order
  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
        <Package size={64} className="text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có sản phẩm để thanh toán</h2>
        <p className="text-gray-500 mb-8 text-center">
          Vui lòng thêm sản phẩm vào giỏ hàng trước.
        </p>
        <Link
          to="/categories"
          className="bg-[#FF6B00] hover:bg-[#E65A00] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md"
        >
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  // Order success state
  if (orderSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
        <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-500 mb-6">
            Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được tiếp nhận.
          </p>

          <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mã đơn hàng</span>
              <span className="font-mono font-bold text-gray-800 text-xs">
                #{orderSuccess._id?.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Số lượng</span>
              <span className="font-semibold text-gray-800">{orderSuccess.items?.length} sản phẩm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tổng thanh toán</span>
              <span className="font-bold text-[#FF6B00] text-lg">{(orderSuccess.totalAmount * 25400).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Phương thức</span>
              <span className="font-semibold text-gray-800">
                {orderSuccess.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : orderSuccess.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Thẻ tín dụng'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Trạng thái</span>
              <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                {orderSuccess.orderStatus === 'PENDING' ? 'Chờ xử lý' : orderSuccess.orderStatus}
              </span>
            </div>
          </div>

          {orderSuccess.paymentMethod === 'BANK_TRANSFER' && (
            <div className="mb-8 p-6 bg-orange-50 rounded-2xl border-2 border-dashed border-orange-200">
              <h3 className="text-sm font-bold text-orange-800 uppercase tracking-widest mb-4">
                Quét mã để thanh toán (VietQR)
              </h3>
              <div className="bg-white p-4 rounded-xl shadow-inner inline-block mb-4">
                <img 
                  src={`https://img.vietqr.io/image/VPB-99422629-compact2.png?amount=${Math.round(orderSuccess.totalAmount * 25400)}&addInfo=${encodeURIComponent(`THANH TOAN DON HANG ${orderSuccess._id.slice(-8).toUpperCase()}`)}&accountName=QUAN TRI VIEN`}
                  alt="VietQR Payment"
                  className="w-64 h-64 mx-auto"
                />
              </div>
              <div className="text-left space-y-1 mb-6">
                <p className="text-xs text-orange-700"><strong>Số tiền:</strong> {(orderSuccess.totalAmount * 25400).toLocaleString()} VND</p>
                <p className="text-xs text-orange-700"><strong>Nội dung:</strong> THANH TOAN DON HANG {orderSuccess._id.slice(-8).toUpperCase()}</p>
                <p className="text-[10px] text-orange-600 mt-2 italic">* Đơn hàng sẽ được xử lý ngay sau khi nhận được thanh toán.</p>
              </div>

              {orderSuccess.paymentStatus === 'PENDING' ? (
                <Button
                  onClick={handleConfirmPayment}
                  disabled={isConfirmingPayment}
                  className="w-full bg-[#FF6B00] hover:bg-[#E65A00] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {isConfirmingPayment ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Tôi đã thanh toán
                    </>
                  )}
                </Button>
              ) : orderSuccess.paymentStatus === 'VERIFYING' ? (
                <div className="flex flex-col items-center justify-center gap-2 text-blue-600 font-bold py-4 bg-blue-50 rounded-xl border border-blue-200 text-center px-4">
                  <div className="flex items-center gap-2">
                    <Loader2 size={20} className="animate-spin" /> Hệ thống đang xác minh
                  </div>
                  <span className="text-xs font-normal text-blue-500 mt-1">
                    Kế toán đang kiểm tra giao dịch của bạn. Quá trình này có thể mất vài phút.
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-600 font-bold py-3 bg-green-50 rounded-xl border border-green-200">
                  <ShieldCheck size={20} /> Đã xác nhận thanh toán
                </div>
              )}
            </div>
          )}


          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1 py-5 rounded-xl font-bold cursor-pointer"
            >
              Về trang chủ
            </Button>
            <Button
              onClick={() => navigate('/profile')}
              className="flex-1 bg-[#FF6B00] hover:bg-[#E65A00] text-white py-5 rounded-xl font-bold cursor-pointer"
            >
              Xem đơn hàng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/cart"
          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-black text-[#FF6B00]">Thanh toán</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left - Shipping Form */}
          <div className="w-full lg:flex-1 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin size={20} className="text-[#FF6B00]" />
                  Thông tin nhận hàng
                </h2>
                
                {userAddresses.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-3">Sử dụng địa chỉ đã lưu:</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {userAddresses.map((addr) => {
                        const fullAddr = `${addr.detail}, ${addr.ward}, ${addr.province}`;
                        const isSelected = form.address === fullAddr;
                        
                        return (
                          <button
                            key={addr._id}
                            type="button"
                            onClick={() => selectSavedAddress(addr)}
                            className={`flex-shrink-0 w-60 p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected 
                              ? 'border-[#FF6B00] bg-orange-50/50 ring-2 ring-orange-100' 
                              : 'border-gray-100 hover:border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                addr.label === 'Công ty' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {addr.label}
                              </span>
                              {isSelected && <CheckCircle2 size={14} className="text-[#FF6B00]" />}
                            </div>
                            <p className="text-sm font-bold text-gray-900 truncate">{addr.fullName}</p>
                            <p className="text-xs text-gray-500 mb-2">{addr.phone}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{fullAddr}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className={`pl-10 py-5 bg-gray-50/50 border ${errors.fullName ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0912 345 678"
                      className={`pl-10 py-5 bg-gray-50/50 border ${errors.phone ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <Input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Số 123 Nguyễn Trãi, Quận 1"
                      className={`pl-10 py-5 bg-gray-50/50 border ${errors.address ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'}`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tỉnh / Thành phố
                  </label>
                  <div className="relative">
                    <Building2
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Hồ Chí Minh"
                      className="pl-10 py-5 bg-gray-50/50 border border-gray-200"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Ghi chú đơn hàng
                  </label>
                  <div className="relative">
                    <MessageSquare
                      size={16}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Lời nhắn cho shipper hoặc ghi chú thêm..."
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Right - Order Review */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package size={20} className="text-[#FF6B00]" />
                Kiểm tra đơn hàng
              </h2>

              {/* Items Preview */}
              <div className="space-y-4 mb-6 max-h-[280px] overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const itemPrice = item.product.price || item.product.originalPrice;
                  return (
                    <div
                      key={item.product._id}
                      className="flex items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images?.[0] ?? '/placeholder.jpg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://placehold.co/56x56?text=No+Img';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-sm text-gray-900">
                        {((itemPrice * item.quantity) * 25400).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-gray-900">
                    {(cartSubtotal * 25400).toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Thuế (8%)</span>
                  <span className="font-semibold text-gray-900">{(tax * 25400).toLocaleString('vi-VN')}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#C83B1E] font-medium bg-red-50 p-2 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      Giảm giá ({appliedVoucher?.code})
                    </span>
                    <span>-{(discount * 25400).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
              </div>

              {/* Voucher Selector */}
              <div className="mt-6 mb-4">
                {appliedVoucher ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white p-1.5 rounded-full">
                            <Ticket size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-green-800 uppercase">{appliedVoucher.code}</p>
                            <p className="text-xs text-green-600">Đã áp dụng giảm giá</p>
                        </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleRemoveVoucher}
                      className="text-xs font-bold text-red-500 hover:text-red-700 uppercase"
                    >
                        Gỡ bỏ
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsVoucherModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-gray-600 group-hover:text-gray-900">
                        <Ticket size={20} className="text-[#FF6B00]" />
                        <span className="font-semibold text-sm">Chọn Kho Voucher</span>
                    </div>
                    <span className="text-xs font-bold bg-[#FF6B00] text-white px-2 py-1 rounded-full">
                        {userVouchers.length} mã có sẵn
                    </span>
                  </button>
                )}
              </div>

              {/* Payment Method (Moved to Right Column) */}
              <div className="mt-6 mb-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard size={18} className="text-[#FF6B00]" />
                  Phương thức thanh toán
                </h3>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#FF6B00] bg-orange-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}`}>
                    <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="sr-only" />
                    <Banknote size={20} className={paymentMethod === 'COD' ? 'text-[#FF6B00]' : 'text-gray-400'} />
                    <span className="font-semibold text-sm text-gray-800 flex-1">Nhận hàng (COD)</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-[#FF6B00]' : 'border-gray-300'}`}>
                      {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-[#FF6B00]" />}
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'CREDIT_CARD' ? 'border-[#FF6B00] bg-orange-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}`}>
                    <input type="radio" name="paymentMethod" value="CREDIT_CARD" checked={paymentMethod === 'CREDIT_CARD'} onChange={() => setPaymentMethod('CREDIT_CARD')} className="sr-only" />
                    <CreditCard size={20} className={paymentMethod === 'CREDIT_CARD' ? 'text-[#FF6B00]' : 'text-gray-400'} />
                    <span className="font-semibold text-sm text-gray-800 flex-1">Thẻ tín dụng / Ghi nợ</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'CREDIT_CARD' ? 'border-[#FF6B00]' : 'border-gray-300'}`}>
                      {paymentMethod === 'CREDIT_CARD' && <div className="w-2 h-2 rounded-full bg-[#FF6B00]" />}
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'border-[#FF6B00] bg-orange-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}`}>
                    <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} className="sr-only" />
                    <Ticket size={20} className={paymentMethod === 'BANK_TRANSFER' ? 'text-[#FF6B00]' : 'text-gray-400'} />
                    <span className="font-semibold text-sm text-gray-800 flex-1">Chuyển khoản (VietQR)</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'BANK_TRANSFER' ? 'border-[#FF6B00]' : 'border-gray-300'}`}>
                      {paymentMethod === 'BANK_TRANSFER' && <div className="w-2 h-2 rounded-full bg-[#FF6B00]" />}
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-lg font-bold text-gray-900">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-[#FF6B00] leading-none">
                    {(total * 25400).toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF6B00] hover:bg-[#E65A00] text-white py-6 rounded-xl font-bold text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} /> Đặt hàng ngay
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Bằng cách đặt hàng, bạn đồng ý với Điều khoản & Điều kiện của chúng tôi
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Voucher Modal Overlay */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                        <Ticket className="text-[#FF6B00]" /> Kho Voucher của bạn
                    </h3>
                    <button type="button" onClick={() => setIsVoucherModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                        ✕
                    </button>
                </div>
                
                <div className="overflow-y-auto p-4 space-y-3 bg-gray-50/50 flex-1">
                    {userVouchers.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <Ticket className="size-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Bạn chưa lưu voucher nào.</p>
                            <Link to="/vouchers" className="text-[#FF6B00] text-xs font-bold hover:underline block mt-2" onClick={() => setIsVoucherModalOpen(false)}>
                                Đi Săn Voucher Ngay
                            </Link>
                        </div>
                    ) : (
                        userVouchers.map(voucher => {
                            const isEligible = totalBeforeVoucher >= voucher.minOrderAmount;
                            return (
                                <div key={voucher._id} className={`bg-white rounded-xl border flex overflow-hidden ${isEligible ? 'border-[#FF6B00]/30 shadow-sm' : 'border-gray-200 opacity-60 grayscale'}`}>
                                    <div className={`w-24 flex flex-col items-center justify-center text-white text-center p-2 border-r-2 border-dashed ${isEligible ? 'bg-[#FF6B00] border-orange-200' : 'bg-gray-400 border-gray-300'}`}>
                                        <span className="text-xl font-bold font-mono">
                                            {voucher.type === 'percentage' ? `${voucher.value}%` : `${(voucher.value * 25400 / 1000).toLocaleString()}k`}
                                        </span>
                                    </div>
                                    <div className="flex-1 p-3 flex flex-col justify-between">
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 mb-1 leading-tight">Đơn tối thiểu {(voucher.minOrderAmount * 25400).toLocaleString('vi-VN')}đ</p>
                                            <p className="text-[10px] text-gray-500">HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                        <div className="mt-2 text-right">
                                            <Button 
                                                type="button"
                                                disabled={!isEligible}
                                                onClick={() => {
                                                    setVoucherCode(voucher.code);
                                                    setIsVoucherModalOpen(false);
                                                    // Trigger validate automatically after state updates
                                                    setTimeout(() => {
                                                        const btn = document.getElementById('hidden-apply-btn');
                                                        if (btn) btn.click();
                                                    }, 50);
                                                }}
                                                className={`h-7 px-3 text-[10px] font-bold rounded-full ${isEligible ? 'bg-[#FF6B00] hover:bg-[#E65A00] text-white' : 'bg-gray-200 text-gray-500'}`}
                                            >
                                                {isEligible ? 'Dùng ngay' : 'Chưa đủ ĐK'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            {/* Hidden button to trigger validation after modal closes */}
            <button id="hidden-apply-btn" type="button" onClick={handleApplyVoucher} className="hidden"></button>
        </div>
      )}
    </div>
  );
};
