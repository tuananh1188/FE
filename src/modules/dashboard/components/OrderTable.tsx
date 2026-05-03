import { Avatar, Tag, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { BarChart3, MoreHorizontal } from "lucide-react";
import type { OrderAPIResponse } from "@/shared/api/order.api";

interface OrderTableProps {
    recentOrders: OrderAPIResponse[];
}

const columns: ColumnsType<OrderAPIResponse> = [
    {
        title: 'ORDER ID',
        dataIndex: '_id',
        key: '_id',
        render: (id) => <span className="font-bold text-xs">#{id.slice(-8).toUpperCase()}</span>
    },
    {
        title: 'CUSTOMER',
        dataIndex: 'shippingAddress',
        key: 'customer',
        render: (shippingAddress, record) => (
            <div className="flex items-center gap-3">
                <Avatar style={{ backgroundColor: '#FF6B00' }}>
                    {shippingAddress?.fullName?.[0] || '?'}
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{shippingAddress?.fullName || 'Anonymous'}</span>
                    <span className="text-[10px] text-gray-400">{(record.userId as any)?.email || 'N/A'}</span>
                </div>
            </div>
        ),
    },
    {
        title: 'DATE',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date) => <span className="text-gray-500 text-xs">{new Date(date).toLocaleDateString()}</span>
    },
    {
        title: 'AMOUNT',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: (amount) => <span className="font-bold text-sm">${amount.toFixed(2)}</span>
    },
    {
        title: 'STATUS',
        dataIndex: 'orderStatus',
        key: 'orderStatus',
        render: (status) => {
            let color = 'gray';
            if (status === 'DELIVERED') color = 'green';
            if (status === 'PENDING') color = 'orange';
            if (status === 'PROCESSING') color = 'blue';
            if (status === 'CANCELLED') color = 'red';
            return <Tag color={color} className="rounded-full border-none px-3 text-[10px] font-bold">{status}</Tag>
        }
    },
    {
        title: 'ACTIONS',
        key: 'actions',
        render: () => (
            <MoreHorizontal className="text-gray-400 cursor-pointer" />
        )
    }
];

const OrderTable: React.FC<OrderTableProps> = ({ recentOrders }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm mt-8 border border-gray-50">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <button className="p-2 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                <BarChart3 size={18} className="rotate-90 text-gray-400" />
            </button>
        </div>
        <Table 
            columns={columns} 
            dataSource={recentOrders} 
            rowKey="_id"
            pagination={false} 
            className="custom-table" 
        />
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400 font-medium">Showing latest {recentOrders.length} orders</p>
            <div className="flex gap-4">
                <button className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">{'PREVIOUS'}</button>
                <button className="text-xs font-bold text-[#FF6B00] hover:text-[#E65A00] transition-colors">NEXT {' >'}</button>
            </div>
        </div>
    </div>
);

export default OrderTable;