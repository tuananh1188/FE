import { http } from './http';

export interface Voucher {
    _id: string;
    code: string;
    type: 'fixed' | 'percentage';
    value: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    expiryDate: string;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
}

export const voucherApi = {
    validate: (code: string, orderAmount: number) =>
        http.post<{ success: boolean; discount: number; voucher: Partial<Voucher> }>('vouchers/validate', { code, orderAmount }),
    
    getAll: () =>
        http.get<{ success: boolean; data: Voucher[] }>('vouchers'),

    create: (payload: Partial<Voucher>) =>
        http.post<{ success: boolean; data: Voucher }>('vouchers', payload),

    update: (id: string, payload: Partial<Voucher>) =>
        http.put<{ success: boolean; data: Voucher }>(`vouchers/update/${id}`, payload),

    delete: (id: string) =>
        http.delete<{ success: boolean; message?: string }>(`vouchers/delete/${id}`),
};
