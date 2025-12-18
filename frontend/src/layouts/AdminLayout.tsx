// FILE: MinePhone/frontend/src/layouts/AdminLayout.tsx
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const AdminLayout: React.FC = () => {
    const { logout } = useStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col">
                <div className="p-6 border-b flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg"></div>
                    <span className="font-bold text-xl">MineAdmin</span>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium">
                        <LayoutDashboard size={20}/> Dashboard
                    </Link>
                    <Link to="/admin/products" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium">
                        <Package size={20}/> Sản phẩm
                    </Link>
                    <Link to="/admin/orders" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium">
                        <ShoppingCart size={20}/> Đơn hàng
                    </Link>
                </nav>

                <div className="p-4 border-t space-y-2">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl w-full">
                        <ArrowLeft size={20}/> Về trang chủ
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl w-full">
                        <LogOut size={20}/> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;