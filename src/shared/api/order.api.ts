import { http } from './http';

export type OrderItemAPI = {
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    _id?: string;
};

export type OrderAPIResponse = {
    _id: string;
    userId: string | any;
    items: OrderItemAPI[];
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        city?: string;
        notes?: string;
    };
    paymentMethod: 'COD' | 'CREDIT_CARD';
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
    orderStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    subtotal: number;
    shippingFee: number;
    tax: number;
    totalAmount: number;
    promoCode?: string;
    createdAt: string;
};

export type CheckoutPayload = {
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        city?: string;
        notes?: string;
    };
    paymentMethod?: 'COD' | 'CREDIT_CARD';
    promoCode?: string;
};

export type DashboardStats = {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    recentOrders: OrderAPIResponse[];
};

export const orderApi = {
    checkout: (payload: CheckoutPayload) =>
        http.post<{ success: boolean; data: OrderAPIResponse }>('orders/checkout', payload),

    getMyOrders: () =>
        http.get<{ success: boolean; count: number; data: OrderAPIResponse[] }>('orders/my-orders'),

    getOrderById: (id: string) =>
        http.get<{ success: boolean; data: OrderAPIResponse }>(`orders/${id}`),

    // Admin APIs
    getAllOrders: () =>
        http.get<{ success: boolean; count: number; data: OrderAPIResponse[] }>('orders/all'),

    updateOrderStatus: (id: string, payload: { orderStatus?: string; paymentStatus?: string }) =>
        http.put<{ success: boolean; data: OrderAPIResponse }>(`orders/${id}`, payload),

    getDashboardStats: () =>
        http.get<{ success: boolean; data: DashboardStats }>('orders/stats'),
};
