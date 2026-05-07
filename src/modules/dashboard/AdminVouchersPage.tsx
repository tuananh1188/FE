import { useState, useEffect } from 'react';
import { Plus, Trash2, Ticket, Calendar, DollarSign, Users, CheckCircle2, XCircle, Edit } from 'lucide-react';
import { voucherApi, type Voucher } from '@/shared/api/voucher.api';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';

export default function AdminVouchersPage() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    
    // Form state
    const [form, setForm] = useState({
        code: '',
        type: 'fixed' as 'fixed' | 'percentage',
        value: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        expiryDate: '',
        usageLimit: 100,
        isActive: true
    });

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const res = await voucherApi.getAll();
            if (res.data.success) {
                setVouchers(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch vouchers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const resetForm = () => {
        setForm({
            code: '',
            type: 'fixed',
            value: 0,
            minOrderAmount: 0,
            maxDiscountAmount: 0,
            expiryDate: '',
            usageLimit: 100,
            isActive: true
        });
        setEditingVoucherId(null);
        setShowForm(false);
    };

    const handleEdit = (voucher: Voucher) => {
        setForm({
            code: voucher.code,
            type: voucher.type,
            value: voucher.value,
            minOrderAmount: voucher.minOrderAmount,
            maxDiscountAmount: voucher.maxDiscountAmount || 0,
            expiryDate: new Date(voucher.expiryDate).toISOString().split('T')[0],
            usageLimit: voucher.usageLimit,
            isActive: voucher.isActive
        });
        setEditingVoucherId(voucher._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Clean payload
            const payload = { ...form };
            
            if (editingVoucherId) {
                const res = await voucherApi.update(editingVoucherId, payload);
                if (res.data.success) {
                    toast.success('Voucher updated successfully');
                    resetForm();
                    fetchVouchers();
                }
            } else {
                const res = await voucherApi.create(payload);
                if (res.data.success) {
                    toast.success('Voucher created successfully');
                    resetForm();
                    fetchVouchers();
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save voucher');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await voucherApi.delete(id);
            if (res.data.success) {
                toast.success('Voucher đã được xóa');
                setConfirmDeleteId(null);
                fetchVouchers();
            } else {
                toast.error(res.data.message || 'Không thể xóa voucher');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi xóa voucher');
        }
    };

    return (
        <div className="space-y-8 relative">
            {/* Custom Delete Confirmation Modal */}
            {confirmDeleteId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-center text-gray-900 mb-2">Xác nhận xóa?</h3>
                        <p className="text-gray-500 text-center text-sm mb-8">
                            Hành động này không thể hoàn tác. Voucher này sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </p>
                        <div className="flex gap-3">
                            <Button 
                                variant="ghost" 
                                className="flex-1 h-12 rounded-xl font-bold"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Hủy bỏ
                            </Button>
                            <Button 
                                className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold"
                                onClick={() => handleDelete(confirmDeleteId)}
                            >
                                Xóa ngay
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Voucher Management</h1>
                    <p className="text-gray-500 text-sm">Create and manage discount codes for your store.</p>
                </div>
                <Button 
                    onClick={() => {
                        if (showForm) resetForm();
                        else setShowForm(true);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                >
                    {showForm ? 'Cancel' : <><Plus size={18} /> Create Voucher</>}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">{editingVoucherId ? 'Edit Voucher' : 'Create New Voucher'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Voucher Code</label>
                                <Input 
                                    required 
                                    placeholder="e.g. WELCOME10" 
                                    value={form.code}
                                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                                    className="uppercase font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                                    <select 
                                        className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                        value={form.type}
                                        onChange={e => setForm({...form, type: e.target.value as any})}
                                    >
                                        <option value="fixed">Fixed Amount ($)</option>
                                        <option value="percentage">Percentage (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Value</label>
                                    <Input 
                                        type="number" 
                                        required 
                                        value={form.value}
                                        onChange={e => setForm({...form, value: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min Order ($)</label>
                                    <Input 
                                        type="number" 
                                        value={form.minOrderAmount}
                                        onChange={e => setForm({...form, minOrderAmount: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Usage Limit</label>
                                    <Input 
                                        type="number" 
                                        value={form.usageLimit}
                                        onChange={e => setForm({...form, usageLimit: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry Date</label>
                                    <Input 
                                        type="date" 
                                        required 
                                        value={form.expiryDate}
                                        onChange={e => setForm({...form, expiryDate: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                                    <div className="flex items-center gap-3 h-10">
                                        <input 
                                            type="checkbox" 
                                            id="isActive"
                                            checked={form.isActive}
                                            onChange={e => setForm({...form, isActive: e.target.checked})}
                                            className="size-5 accent-orange-600 rounded"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">Active</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-8">
                                {editingVoucherId ? 'Update Voucher' : 'Create Voucher'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type / Value</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Min Order</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usage</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading vouchers...</td>
                            </tr>
                        ) : vouchers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No vouchers created yet.</td>
                            </tr>
                        ) : (
                            vouchers.map((v) => (
                                <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                                                <Ticket size={16} />
                                            </div>
                                            <span className="font-mono font-bold text-gray-900">{v.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800">
                                                {v.type === 'percentage' ? `${v.value}% Off` : `$${v.value} Off`}
                                            </span>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                                                {v.type} Discount
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 font-medium">${v.minOrderAmount}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-orange-500" 
                                                    style={{ width: `${(v.usedCount / v.usageLimit) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">{v.usedCount}/{v.usageLimit}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{new Date(v.expiryDate).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {v.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                <CheckCircle2 size={10} /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                <XCircle size={10} /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(v)}
                                                className="p-2 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => setConfirmDeleteId(v._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
