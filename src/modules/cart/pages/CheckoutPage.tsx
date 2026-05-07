import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/shared/context/CartContext';
import { orderApi } from '@/shared/api/order.api';
import { authApi } from '@/modules/auth/api/auth.api';
import { voucherApi } from '@/shared/api/voucher.api';
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

  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [discount, setDiscount] = useState(0);

  const shipping = 0;
  const taxRate = 0.08;
  const tax = cartSubtotal * taxRate;
  const totalBeforeVoucher = cartSubtotal + shipping + tax;
  const total = Math.max(0, totalBeforeVoucher - discount);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    
    try {
      setIsValidatingVoucher(true);
      const res = await voucherApi.validate(voucherCode, totalBeforeVoucher);
      if (res.data.success) {
        setAppliedVoucher(res.data.voucher);
        setDiscount(res.data.discount);
        toast.success(`Coupon applied: -$${res.data.discount.toFixed(2)}`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Invalid voucher code');
      setAppliedVoucher(null);
      setDiscount(0);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscount(0);
    setVoucherCode('');
    toast.info('Voucher removed');
  };

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (tokenStore.get()) {
        try {
          const res = await authApi.getMe();
          if (res.data) {
              setForm((prev) => ({
                ...prev,
                fullName: prev.fullName || res.data.displayName || '',
                phone: prev.phone || res.data.phone || '',
                address: prev.address || res.data.address || '',
                city: prev.city || res.data.city || '',
              }));
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9]{9,15}$/.test(form.phone.replace(/\s/g, '')))
      newErrors.phone = 'Invalid phone number';
    if (!form.address.trim()) newErrors.address = 'Delivery address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
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
        toast.success('🎉 Order placed successfully!');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if cart is empty and no successful order
  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
        <Package size={64} className="text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No items to checkout</h2>
        <p className="text-gray-500 mb-8 text-center">
          Add some products to your cart first.
        </p>
        <Link
          to="/categories"
          className="bg-[#FF6B00] hover:bg-[#E65A00] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md"
        >
          Browse Products
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
          <h2 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-6">
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono font-bold text-gray-800 text-xs">
                #{orderSuccess._id?.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Items</span>
              <span className="font-semibold text-gray-800">{orderSuccess.items?.length} product(s)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-[#FF6B00] text-lg">${orderSuccess.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment</span>
              <span className="font-semibold text-gray-800">
                {orderSuccess.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit Card'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                {orderSuccess.orderStatus}
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
              <div className="text-left space-y-1">
                <p className="text-xs text-orange-700"><strong>Số tiền:</strong> {(orderSuccess.totalAmount * 25400).toLocaleString()} VND</p>
                <p className="text-xs text-orange-700"><strong>Nội dung:</strong> THANH TOAN DON HANG {orderSuccess._id.slice(-8).toUpperCase()}</p>
                <p className="text-[10px] text-orange-600 mt-2 italic">* Đơn hàng sẽ được xử lý ngay sau khi nhận được thanh toán.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1 py-5 rounded-xl font-bold cursor-pointer"
            >
              Back to Home
            </Button>
            <Button
              onClick={() => navigate('/profile')}
              className="flex-1 bg-[#FF6B00] hover:bg-[#E65A00] text-white py-5 rounded-xl font-bold cursor-pointer"
            >
              View Orders
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
        <h1 className="text-3xl font-black text-[#FF6B00]">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left - Shipping Form */}
          <div className="w-full lg:flex-1 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-[#FF6B00]" />
                Shipping Information
              </h2>

              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
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
                      placeholder="Nguyen Van A"
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
                    Phone Number <span className="text-red-500">*</span>
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
                    Delivery Address <span className="text-red-500">*</span>
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
                      placeholder="123 Nguyen Trai, Quan 1"
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
                    City
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
                      placeholder="Ho Chi Minh City"
                      className="pl-10 py-5 bg-gray-50/50 border border-gray-200"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Order Notes
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
                      placeholder="Special instructions for delivery..."
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-[#FF6B00]" />
                Payment Method
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#FF6B00] bg-orange-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'COD' ? 'border-[#FF6B00]' : 'border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'COD' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                    )}
                  </div>
                  <Banknote size={24} className="text-green-600" />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Cash on Delivery (COD)</p>
                    <p className="text-xs text-gray-500">Pay when you receive your order</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'border-[#FF6B00] bg-orange-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    checked={paymentMethod === 'CREDIT_CARD'}
                    onChange={() => setPaymentMethod('CREDIT_CARD')}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'CREDIT_CARD' ? 'border-[#FF6B00]' : 'border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'CREDIT_CARD' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                    )}
                  </div>
                  <CreditCard size={24} className="text-blue-600" />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Credit / Debit Card</p>
                    <p className="text-xs text-gray-500">Visa, Mastercard, JCB</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'border-[#FF6B00] bg-orange-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === 'BANK_TRANSFER'}
                    onChange={() => setPaymentMethod('BANK_TRANSFER')}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'BANK_TRANSFER' ? 'border-[#FF6B00]' : 'border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'BANK_TRANSFER' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                    )}
                  </div>
                  <Ticket size={24} className="text-orange-600" />
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Chuyển khoản Ngân hàng (VietQR)</p>
                    <p className="text-xs text-gray-500">Tạo mã QR thanh toán tự động</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right - Order Review */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package size={20} className="text-[#FF6B00]" />
                Order Review
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
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-sm text-gray-900">
                        ${(itemPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ${cartSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#C83B1E] font-medium bg-red-50 p-2 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      Voucher ({appliedVoucher?.code})
                    </span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Voucher Input */}
              <div className="mt-6 mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="Promo code" 
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      className="pl-10 h-10 bg-gray-50/50 border-gray-200 uppercase"
                      disabled={!!appliedVoucher}
                    />
                  </div>
                  {appliedVoucher ? (
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleRemoveVoucher}
                      className="h-10 border-gray-200 text-gray-500 hover:text-red-500 cursor-pointer"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={isValidatingVoucher || !voucherCode.trim()}
                      className="h-10 bg-gray-800 hover:bg-gray-900 text-white px-5 cursor-pointer disabled:opacity-50"
                    >
                      {isValidatingVoucher ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-[#FF6B00] leading-none">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF6B00] hover:bg-[#E65A00] text-white py-6 rounded-xl font-bold text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} /> Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
