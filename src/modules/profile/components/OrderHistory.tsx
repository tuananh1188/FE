import { useEffect, useState } from 'react';
import { orderApi, type OrderAPIResponse } from '@/shared/api/order.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Package, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';

const statusMap: Record<string, { label: string, color: string, icon: any }> = {
    'PENDING': { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    'PROCESSING': { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
    'SHIPPED': { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
    'DELIVERED': { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    'CANCELLED': { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export const OrderHistory = () => {
    const [orders, setOrders] = useState<OrderAPIResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderApi.getMyOrders();
                if (res.data.success) {
                    setOrders(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="py-10 text-center text-muted-foreground">Loading orders...</div>;

    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <Package className="size-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => {
                const status = statusMap[order.orderStatus] || statusMap['PENDING'];
                const StatusIcon = status.icon;

                return (
                    <Card key={order._id} className="overflow-hidden border-none shadow-sm bg-white">
                        <CardHeader className="bg-gray-50/50 py-4 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Order ID</p>
                                <p className="text-xs font-mono font-bold">#{order._id.slice(-8).toUpperCase()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-muted-foreground font-medium">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                                <Badge className={`${status.color} border-none flex items-center gap-1 px-2.5 py-0.5`}>
                                    <StatusIcon className="size-3" />
                                    {status.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="size-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            <img src={item.image || '/placeholder.jpg'} alt={item.name} className="size-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Total Amount</p>
                                    <p className="text-lg font-black text-[#C83B1E]">${order.totalAmount.toFixed(2)}</p>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Payment Method</p>
                                    <p className="text-xs font-semibold">{order.paymentMethod}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
