import { useEffect, useState } from 'react';
import { voucherApi, type Voucher } from '@/shared/api/voucher.api';
import { Button } from '@/shared/components/ui/button';
import { Ticket, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const VouchersPage = () => {
    const [activeVouchers, setActiveVouchers] = useState<Voucher[]>([]);
    const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [activeRes, myRes] = await Promise.all([
                voucherApi.getActive().catch(() => ({ data: { data: [] as Voucher[] } })),
                voucherApi.getMyVouchers().catch(() => ({ data: { data: [] as Voucher[] } }))
            ]);
            
            setActiveVouchers(activeRes.data.data || []);
            setMyVouchers(myRes.data.data || []);
        } catch (error) {
            console.error('Failed to load vouchers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveVoucher = async (code: string) => {
        try {
            const res = await voucherApi.saveVoucher(code);
            if (res.data.success) {
                toast.success(`Voucher ${code} đã được thêm vào Kho của bạn.`);
                loadData(); // Reload to update states
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể lưu mã. Vui lòng đăng nhập.");
        }
    };

    const isVoucherSaved = (voucherId: string) => {
        return myVouchers.some(v => v._id === voucherId);
    };

    const formatCurrency = (amount: number) => {
        return (amount * 25400).toLocaleString('vi-VN') + 'đ';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (loading) {
        return <div className="min-h-screen pt-20 text-center">Đang tải Kho Voucher...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Ticket className="size-8 text-[#C83B1E]" />
                    <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Kho Voucher
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeVouchers.map((voucher) => {
                        const saved = isVoucherSaved(voucher._id);
                        const progress = Math.round((voucher.usedCount / voucher.usageLimit) * 100);
                        
                        return (
                            <div key={voucher._id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden relative">
                                {/* Left part - Red Background */}
                                <div className="bg-[#C83B1E] w-32 flex flex-col items-center justify-center p-4 text-white text-center border-r-2 border-dashed border-white/50 relative">
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-gray-50"></div>
                                    <span className="text-sm font-medium mb-1" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Giảm</span>
                                    <span className="text-2xl font-bold leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {voucher.type === 'percentage' ? `${voucher.value}%` : formatCurrency(voucher.value)}
                                    </span>
                                </div>

                                {/* Right part - Details */}
                                <div className="flex-1 p-5 flex flex-col justify-between relative">
                                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-gray-50"></div>
                                    
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-red-50 text-[#C83B1E] text-[10px] font-bold px-2 py-0.5 rounded border border-red-100 uppercase tracking-wider">
                                                Mã: {voucher.code}
                                            </span>
                                            {saved && <CheckCircle className="size-5 text-green-500" />}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 leading-snug">
                                            Đơn tối thiểu {formatCurrency(voucher.minOrderAmount)}
                                            {voucher.type === 'percentage' && voucher.maxDiscountAmount ? ` Giảm tối đa ${formatCurrency(voucher.maxDiscountAmount)}` : ''}
                                        </h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                            <Clock className="size-3" /> HSD: {formatDate(voucher.expiryDate)}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-end justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">
                                                <span>Đã dùng {progress}%</span>
                                            </div>
                                            <div className="bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-[#C83B1E] h-full rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            disabled={saved}
                                            onClick={() => handleSaveVoucher(voucher.code)}
                                            className={`h-8 px-5 text-xs font-semibold rounded-full ${saved ? 'bg-gray-200 text-gray-500' : 'bg-[#C83B1E] hover:bg-[#A63018] text-white'}`}
                                            style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
                                        >
                                            {saved ? 'Đã lưu' : 'Lưu mã'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {activeVouchers.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <Ticket className="size-16 mx-auto mb-4 opacity-20" />
                        <p>Hiện chưa có mã giảm giá nào được phát hành.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
