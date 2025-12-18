import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  Phone, Mail, MapPin, Facebook, Instagram, Youtube, 
  CreditCard, ShieldCheck, Truck 
} from 'lucide-react';

// Components
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import AuthModal from '../components/AuthModal';
import ChatBot from '../components/ChatBot';
import CompareModal from '../components/CompareModal';

const ClientLayout: React.FC = () => {
    const navigate = useNavigate();
    const { compareList, removeFromCompare } = useStore();

    // UI States (Quản lý Modal toàn cục)
    const [showCart, setShowCart] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [showCompare, setShowCompare] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
            {/* --- HEADER --- */}
            <Header 
                onOpenCart={() => setShowCart(true)} 
                onOpenAuth={() => setShowAuth(true)}
                onOpenCompare={() => setShowCompare(true)}
                onOpenAdmin={() => navigate('/admin')}
            />
            
            {/* --- MAIN CONTENT (OUTLET) --- */}
            {/* flex-grow để đẩy Footer xuống đáy, mt-[80px] để tránh bị Header che mất nội dung */}
            <main className="flex-grow container mx-auto px-4 py-8 mt-[70px]">
                <Outlet />
            </main>

            {/* --- FOOTER CHI TIẾT --- */}
            <footer className="bg-white border-t border-gray-200 pt-16 pb-8 text-gray-600">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        {/* Cột 1: Thông tin chung */}
                        <div>
                            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
                                <ShieldCheck /> MinePhone
                            </h3>
                            <p className="mb-4 text-sm leading-relaxed">
                                Hệ thống bán lẻ điện thoại chính hãng uy tín hàng đầu. Cam kết chất lượng, bảo hành chu đáo, giá cả cạnh tranh.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="hover:text-blue-600"><Facebook size={20} /></a>
                                <a href="#" className="hover:text-pink-600"><Instagram size={20} /></a>
                                <a href="#" className="hover:text-red-600"><Youtube size={20} /></a>
                            </div>
                        </div>

                        {/* Cột 2: Liên hệ */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4 uppercase text-sm">Liên hệ</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <MapPin size={18} className="mt-1 flex-shrink-0" />
                                    <span>123 Đường Công Nghệ, Q.1, TP.HCM</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone size={18} />
                                    <span>1900 1000 (8:00 - 22:00)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail size={18} />
                                    <span>cskh@minephone.com</span>
                                </li>
                            </ul>
                        </div>

                        {/* Cột 3: Chính sách */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4 uppercase text-sm">Hỗ trợ khách hàng</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="#" className="hover:text-blue-600">Chính sách bảo hành</Link></li>
                                <li><Link to="#" className="hover:text-blue-600">Chính sách đổi trả</Link></li>
                                <li><Link to="#" className="hover:text-blue-600">Phương thức thanh toán</Link></li>
                                <li><Link to="#" className="hover:text-blue-600">Giao hàng & Lắp đặt</Link></li>
                            </ul>
                        </div>

                        {/* Cột 4: Đăng ký nhận tin */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4 uppercase text-sm">Thanh toán an toàn</h4>
                            <div className="flex gap-3 mb-6">
                                <div className="bg-gray-100 p-2 rounded"><CreditCard size={24} /></div>
                                <div className="bg-gray-100 p-2 rounded"><Truck size={24} /></div>
                            </div>
                            <p className="text-sm mb-2">Đăng ký nhận khuyến mãi:</p>
                            <div className="flex">
                                <input 
                                    type="email" 
                                    placeholder="Email của bạn..." 
                                    className="border border-gray-300 rounded-l px-3 py-2 w-full focus:outline-none focus:border-blue-500 text-sm"
                                />
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 text-sm font-medium">
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8 text-center text-sm">
                        <p>© 2024 MinePhone Store. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* --- GLOBAL MODALS & WIDGETS --- */}
            
            {/* Giỏ hàng (Drawer trượt từ phải sang) */}
            <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
            
            {/* Modal Đăng nhập/Đăng ký */}
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            
            {/* Thanh so sánh sản phẩm (Chỉ hiện khi có sản phẩm trong list) */}
            {showCompare && compareList.length > 0 && (
                <CompareModal 
                    products={compareList} 
                    onClose={() => setShowCompare(false)} 
                    onRemove={removeFromCompare} 
                />
            )}
            
            {/* Chatbot AI (Nổi ở góc phải dưới) */}
            <ChatBot />
        </div>
    );
};

export default ClientLayout;