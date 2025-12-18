// FILE: MinePhone/frontend/src/pages/admin/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { getDashboardStats } from '../../api';

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) { console.error("Lỗi load stats"); }
        };
        fetchStats();
    }, []);

    if (!stats) return <div className="p-10 text-center">Đang tải thống kê...</div>;

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Tổng quan kinh doanh</h1>
            
            {/* Cards Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Tổng doanh thu</p>
                            <h3 className="text-3xl font-bold">{stats.total_revenue.toLocaleString()} ₫</h3>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg"><DollarSign size={24}/></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Tổng đơn hàng</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.total_orders}</h3>
                        </div>
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-lg"><ShoppingCart size={24}/></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Tồn kho hiện tại</p>
                            <h3 className="text-3xl font-bold text-gray-800">{stats.total_products}</h3>
                        </div>
                        <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><Package size={24}/></div>
                    </div>
                </div>
            </div>

            {/* Đơn hàng gần đây */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-600"/> Đơn hàng mới nhất
                </h3>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-gray-500 border-b border-gray-100">
                            <th className="pb-3 font-medium">Mã đơn</th>
                            <th className="pb-3 font-medium">Khách hàng</th>
                            <th className="pb-3 font-medium">Tổng tiền</th>
                            <th className="pb-3 font-medium">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {stats.recent_orders.map((o: any) => (
                            <tr key={o.id}>
                                <td className="py-3 font-bold">#{o.id}</td>
                                <td className="py-3">{o.username}</td>
                                <td className="py-3 font-bold text-blue-600">{o.total.toLocaleString()}đ</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold 
                                        ${o.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                          o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}>
                                        {o.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;