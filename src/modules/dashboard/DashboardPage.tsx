import OrderTable from "./components/OrderTable";
import StatCard from "./components/StatCard";
import { DollarSign, ShoppingCart, Users, TrendingDown } from "lucide-react";

const DashboardPage: React.FC = () => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value="$45,231.89"
                    trend="+20.1%"
                    isPositive={true}
                    icon={<DollarSign size={20} className="text-orange-600" />}
                />
                <StatCard
                    title="Total Orders"
                    value="1,234"
                    trend="+12.5%"
                    isPositive={true}
                    icon={<ShoppingCart size={20} className="text-orange-600" />}
                />
                <StatCard
                    title="Active Users"
                    value="8,923"
                    trend="+5.2%"
                    isPositive={true}
                    icon={<Users size={20} className="text-orange-600" />}
                />
                <StatCard
                    title="Conversion Rate"
                    value="2.45%"
                    trend="-1.2%"
                    isPositive={false}
                    icon={<TrendingDown size={20} className="text-orange-600" />}
                />
            </div>
            <OrderTable />
        </>
    );
};

export default DashboardPage;