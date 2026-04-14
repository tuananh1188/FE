import { Avatar, Tag, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { BarChart3, MoreHorizontal } from "lucide-react";


interface OrderData {
    key: string;
    orderId: string;
    customer: { name: string; avatar: string; color: string };
    date: string;
    amount: string;
    status: 'Shipped' | 'Paid' | 'Pending';
}

const columns: ColumnsType<OrderData> = [
    {
        title: 'ORDER ID',
        dataIndex: 'orderId',
        key: 'orderId',
        render: (text) => <span className="font-bold">{text}</span>
    },
    {
        title: 'CUSTOMER',
        dataIndex: 'customer',
        key: 'customer',
        render: (customer) => (
            <div className="flex items-center gap-3">
                <Avatar style={{ backgroundColor: customer.color }}>{customer.name[0]}</Avatar>
                <span className="font-medium">{customer.name}</span>
            </div>
        ),
    },
    {
        title: 'DATE',
        dataIndex: 'date',
        key: 'date',
        render: (date) => <span className="text-gray-500">{date}</span>
    },
    {
        title: 'AMOUNT',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => <span className="font-bold">{amount}</span>
    },
    {
        title: 'STATUS',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
            let color = status === 'Shipped' ? 'orange' : status === 'Paid' ? 'green' : 'volcano';
            return <Tag color={color} className="rounded-full border-none px-3">{status}</Tag>
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

const data: OrderData[] = [
    {
        key: '1',
        orderId: '#VL2024-001',
        customer: { name: 'John Doe', avatar: '', color: 'orange' },
        date: '2024-01-15',
        amount: '$120.00',
        status: 'Shipped'
    },
    {
        key: '2',
        orderId: '#VL2024-002',
        customer: { name: 'Jane Smith', avatar: '', color: 'blue' },
        date: '2024-01-16',
        amount: '$150.00',
        status: 'Paid'
    },
    {
        key: '3',
        orderId: '#VL2024-003',
        customer: { name: 'Bob Johnson', avatar: '', color: 'green' },
        date: '2024-01-17',
        amount: '$180.00',
        status: 'Pending'
    },
];

const OrderTable = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm mt-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <button className="p-2 hover:bg-gray-50 rounded-lg border border-gray-200">
                <BarChart3 size={18} className="rotate-90 text-gray-500" />
            </button>
        </div>
        <Table columns={columns} dataSource={data} pagination={false} className="custom-table" />
        <div className="flex gap-4">
            <button className="hover:text-gray-600">{'<Previous'}</button>
            <button className="text-orange-600 font-medium">Next {'>'}</button>
        </div>

    </div>
)

export default OrderTable;