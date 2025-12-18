import React from 'react';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom'; // Thêm hook điều hướng

const CartDrawer: React.FC<{isOpen: boolean, onClose: () => void}> = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, cartTotal } = useStore();
    const navigate = useNavigate();

    // Hàm chuyển hướng sang trang thanh toán đầy đủ
    const handleGoToCheckout = () => {
        onClose(); // Đóng drawer
        navigate('/cart'); // Chuyển sang trang CartPage xịn
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Overlay đóng khi click ra ngoài */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="bg-white w-full max-w-md h-full relative z-10 flex flex-col shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-xl flex items-center gap-2">
                        Giỏ hàng <span className="text-sm font-normal text-gray-500">({cart.length} món)</span>
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all"><X size={20}/></button>
                </div>

                {/* Body: List sản phẩm */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 mt-20">
                            <p>Giỏ hàng đang trống</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm group">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl p-2 flex items-center justify-center">
                                    <img src={item.image} className="w-full h-full object-contain mix-blend-multiply"/>
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-gray-800 line-clamp-1">{item.name}</div>
                                    <div className="text-gray-500 text-xs mb-1">{item.brand}</div>
                                    <div className="text-blue-600 text-sm font-bold flex items-center gap-2">
                                        {item.price.toLocaleString()}đ 
                                        <span className="text-gray-400 font-normal text-xs">x{item.qty}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item.id)} 
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer: Tổng tiền & Nút điều hướng */}
                <div className="p-6 border-t bg-gray-50">
                    <div className="flex justify-between mb-4 items-end">
                        <span className="text-gray-500 font-medium">Tổng tạm tính:</span> 
                        <span className="text-2xl font-bold text-gray-900">{cartTotal.toLocaleString()}đ</span>
                    </div>
                    
                    <button 
                        onClick={handleGoToCheckout} 
                        disabled={cart.length === 0} 
                        className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        Tiến hành đặt hàng <ArrowRight size={20}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;