// FILE: MinePhone/frontend/src/components/Header.tsx
import React, { useState } from 'react';
import { 
  Bell, Search, Menu, User, ShoppingBag, 
  LogOut, ChevronDown, LayoutDashboard,
  Package, Scale // <--- BỔ SUNG: Package (để sửa lỗi crash) và Scale (cho nút so sánh)
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
    onOpenCart: () => void;
    onOpenAuth: () => void;
    onOpenCompare: () => void; // Chức năng Sprint 3
    onOpenAdmin: () => void;
    onMenuClick?: () => void;
}

// BỔ SUNG: Lấy onOpenCompare ra để sử dụng
const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenAuth, onOpenAdmin, onOpenCompare }) => {
  const { user, logout, cart, compareList } = useStore(); // Lấy thêm compareList
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-1">
            MinePhone<span className="text-blue-600">.</span>
        </Link>
        
        {/* Search Bar (Desktop) */}
        <div className="relative hidden md:block ml-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..." 
            className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* --- NÚT SO SÁNH (SẢN PHẨM MỚI BỔ SUNG) --- */}
        {/* Chỉ hiện khi có sản phẩm trong danh sách so sánh */}
        {compareList.length > 0 && (
            <button 
                onClick={onOpenCompare} 
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group text-gray-600"
                title="So sánh sản phẩm"
            >
                <Scale size={22} className="group-hover:text-blue-600"/>
                <span className="absolute top-0 right-0 w-5 h-5 bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {compareList.length}
                </span>
            </button>
        )}

        {/* Cart Button */}
        <button onClick={onOpenCart} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group">
          <ShoppingBag size={22} className="text-gray-600 group-hover:text-black"/>
          {cart.length > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {cart.reduce((total, item) => total + item.qty, 0)}
            </span>
          )}
        </button>

        {/* Auth / Profile Area */}
        {!user ? (
            <button 
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-300"
            >
                <User size={18}/> 
                <span className="hidden sm:inline">Đăng nhập</span>
            </button>
        ) : (
            <div className="relative">
                <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-gray-50 rounded-full border border-transparent hover:border-gray-200 transition-all"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                        {user.username.charAt(0)}
                    </div>
                    <div className="hidden md:block text-left mr-1">
                        <p className="text-xs font-bold text-gray-800 leading-none">{user.username}</p>
                        <p className="text-[10px] text-gray-500">{user.role}</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400"/>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-fade-in z-50">
                        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                            <p className="text-sm font-bold text-gray-900">Xin chào, {user.username}</p>
                            <p className="text-xs text-gray-500">Thành viên thân thiết</p>
                        </div>
                        
                        {user.role === 'admin' && (
                            <button 
                                onClick={() => { onOpenAdmin(); setShowProfileMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                            >
                                <LayoutDashboard size={18} />
                                <span>Trang quản trị</span>
                            </button>
                        )}
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        {/* Link này trước đây gây lỗi vì thiếu import Package */}
                        <Link 
                            to="/history"
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                        >
                            <Package size={18} />
                            <span>Đơn mua</span>
                        </Link>
                        
                        <button 
                            onClick={() => { logout(); setShowProfileMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;