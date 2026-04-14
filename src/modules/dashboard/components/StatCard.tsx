import React from 'react';
import { Card } from 'antd';

interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    isPositive: boolean;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, isPositive, icon }) => {
    return (
        <Card className="rounded-2xl border-gray-100 shadow-sm flex-1">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {isPositive ? '↗' : '↘'} {trend}
                </div>
            </div>
            <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
                {title}
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
                {value}
            </div>
        </Card>
    );
};

export default StatCard;