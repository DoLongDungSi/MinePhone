// FILE: MinePhone/frontend/src/pages/client/OrderHistoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { getOrders } from '../../api';
import { Package, Clock, Truck, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderHistoryPage = () => {
    const { user } = useStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        const fetchOrders = async () => {
            try {
                // Backend tự lọc theo user_id nếu client gọi
                const data = await getOrders(user.id);
                setOrders(data);
            } catch (error) {
                console.error("Lỗi tải lịch sử đơn hàng");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user, navigate]);

    const getStatusBadge = (status: string) => {
        const styles: any = {
            pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: <Clock size={16}/>, label: 'Đang xử lý' },
            shipping: { color: 'text-blue-600', bg: 'bg-blue-50', icon: <Truck size={16}/>, label: 'Đang giao hàng' },
            completed: { color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle size={16}/>, label: 'Giao thành công' },
            cancelled: { color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle size={16}/>, label: 'Đã hủy' }
        };
        const s = styles[status] || styles.pending;
        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${s.color} ${s.bg}`}>
                {s.icon} {s.label}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in min-h-screen">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-black">
                <ArrowLeft size={20}/> Quay lại mua sắm
            </button>
            
            <h1 className="text-3xl font-black text-gray-900 mb-8">Lịch sử đơn hàng</h1>

            {loading ? (
                <div className="text-center py-10">Đang tải dữ liệu...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl">
                    <Package size={48} className="mx-auto text-gray-300 mb-4"/>
                    <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            {/* Header Đơn hàng */}
                            <div className="flex flex-col md:flex-row justify-between md:items-center pb-4 border-b border-gray-100 mb-4 gap-4">
                                <div>
                                    <div className="font-bold text-lg text-gray-900">Đơn hàng #{order.id}</div>
                                    <div className="text-sm text-gray-500">
                                        Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>

                            {/* Chi tiết sản phẩm (Lấy từ JSON items) */}
                            <div className="space-y-3 mb-4">
                                {order.items && order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-500 bg-gray-100 w-6 h-6 flex items-center justify-center rounded text-xs">
                                                {item.qty}x
                                            </span>
                                            <span className="text-gray-800 font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-gray-600">{(item.price * item.qty).toLocaleString()}đ</span>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Tổng tiền */}
                            <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                                <span className="text-gray-500 font-medium">Tổng thanh toán</span>
                                <span className="text-xl font-black text-blue-600">{order.total.toLocaleString()}đ</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;