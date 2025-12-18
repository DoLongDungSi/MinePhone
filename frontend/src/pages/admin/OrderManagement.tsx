import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, Eye, Download, CheckCircle, 
    Truck, RefreshCw, XCircle, Clock, Package 
} from 'lucide-react'; // Đã import đầy đủ Icon
import { getOrders, updateOrderStatus } from '../../api';
import Toastify from 'toastify-js';

const OrderManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Hàm load dữ liệu
  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders(); 
      // Sắp xếp đơn mới nhất lên đầu (nếu API chưa sắp xếp)
      const sorted = Array.isArray(data) ? data.sort((a: any, b: any) => b.id - a.id) : [];
      setOrders(sorted);
    } catch (error) {
      console.error(error);
      Toastify({ text: "Lỗi kết nối server!", style: { background: "red" } }).showToast();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  // 2. Hàm cập nhật trạng thái
  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    if (!confirm(`Bạn có chắc muốn chuyển đơn #${orderId} sang trạng thái "${nextStatus}"?`)) return;

    try {
      await updateOrderStatus(orderId, nextStatus);
      Toastify({ text: `Cập nhật đơn #${orderId} thành công!`, style: { background: "green" } }).showToast();
      loadOrders(); // Tải lại danh sách
    } catch (err) {
      Toastify({ text: "Lỗi cập nhật trạng thái", style: { background: "red" } }).showToast();
    }
  };

  // Helper: Màu sắc trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipping': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper: Icon trạng thái
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14}/>;
      case 'shipping': return <Truck size={14}/>;
      case 'completed': return <CheckCircle size={14}/>;
      case 'cancelled': return <XCircle size={14}/>;
      default: return <Package size={14}/>;
    }
  };

  // 3. Lọc tìm kiếm
  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchTerm) || 
    (o.user_id && o.user_id.toString().includes(searchTerm))
  );

  return (
    <div className="p-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi vận đơn và doanh thu</p>
        </div>
        <button 
            onClick={loadOrders} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm transition-all"
        >
            <RefreshCw size={18}/> <span>Làm mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo Mã đơn hoặc ID Khách hàng..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600">
            <Filter size={20}/>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
            <tr>
              <th className="px-6 py-4">Mã Đơn</th>
              <th className="px-6 py-4">Khách Hàng</th>
              <th className="px-6 py-4">Ngày Đặt</th>
              <th className="px-6 py-4">Tổng Tiền</th>
              <th className="px-6 py-4">Trạng Thái</th>
              <th className="px-6 py-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-400">Không tìm thấy đơn hàng nào.</td></tr>
            ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">#{order.id}</td>
                    {/* <td className="px-6 py-4 text-gray-600">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">ID: {order.user_id}</span>
                    </td> */}
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{order.username}</span>
                            <span className="text-xs text-gray-500 font-mono">ID: {order.user_id}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      <br/>
                      <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString('vi-VN')}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {order.total?.toLocaleString()} ₫
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} uppercase`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Logic Nút Hành Động */}
                        {order.status === 'pending' && (
                            <>
                                <button 
                                    onClick={() => handleUpdateStatus(order.id, 'shipping')} 
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100" 
                                    title="Giao hàng"
                                >
                                    <Truck size={18}/>
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(order.id, 'cancelled')} 
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100" 
                                    title="Hủy đơn"
                                >
                                    <XCircle size={18}/>
                                </button>
                            </>
                        )}
                        
                        {order.status === 'shipping' && (
                            <button 
                                onClick={() => handleUpdateStatus(order.id, 'completed')} 
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-100" 
                                title="Hoàn thành"
                            >
                                <CheckCircle size={18}/>
                            </button>
                        )}

                        <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all" title="Xem chi tiết">
                            <Eye size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;