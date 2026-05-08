import React, { useEffect, useState } from "react";
import OrderTable from "./components/OrderTable";
import StatCard from "./components/StatCard";
import { DollarSign, ShoppingCart, Users, TrendingUp, Loader2 } from "lucide-react";
import { orderApi, type DashboardStats } from "@/shared/api/order.api";
import { toast } from "sonner";

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await orderApi.getDashboardStats();
                if (res.data.success) {
                    setStats(res.data.data);
                }
            } catch (error: any) {
                toast.error("Không thể tải thống kê bảng điều khiển");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Tổng doanh thu"
                    value={`${((stats?.totalRevenue || 0) * 25400).toLocaleString('vi-VN')}đ`}
                    trend="+12.5%"
                    isPositive={true}
                    icon={<DollarSign size={20} className="text-orange-600" />}
                />
                <StatCard
                    title="Tổng đơn hàng"
                    value={stats?.totalOrders.toString() || '0'}
                    trend="+8.2%"
                    isPositive={true}
                    icon={<ShoppingCart size={20} className="text-orange-600" />}
                />
                <StatCard
                    title="Tổng người dùng"
                    value={stats?.totalUsers.toString() || '0'}
                    trend="+5.1%"
                    isPositive={true}
                    icon={<Users size={20} className="text-orange-600" />}
                />
                <StatCard
                    title="Tỷ lệ chuyển đổi"
                    value="3.2%"
                    trend="+2.1%"
                    isPositive={true}
                    icon={<TrendingUp size={20} className="text-orange-600" />}
                />
            </div>
            <OrderTable recentOrders={stats?.recentOrders || []} />
        </>
    );
};

export default DashboardPage;