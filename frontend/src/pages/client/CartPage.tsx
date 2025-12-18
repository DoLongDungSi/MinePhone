import React, { useState } from 'react';
import { 
    Trash2, Plus, Minus, ArrowRight, ShoppingBag, 
    MapPin, Phone, User, CreditCard, Banknote, ShieldCheck, Calendar, Lock 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../api';
import Toastify from 'toastify-js';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, user } = useStore();
    const navigate = useNavigate();

    // --- STATE FORM GIAO HÀNG ---
    const [info, setInfo] = useState({
        name: user?.username || '', 
        phone: '',
        address: ''
    });

    // --- STATE THẺ VISA (MOCK) ---
    const [cardInfo, setCardInfo] = useState({
        number: '',
        expiry: '',
        cvv: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'banking'>('cod');
    const [isProcessing, setIsProcessing] = useState(false);

    // --- XỬ LÝ THANH TOÁN ---
    const handleCheckout = async () => {
        // 1. Kiểm tra đăng nhập
        if (!user) {
            Toastify({ text: "Vui lòng đăng nhập để thanh toán!", style: { background: "#F59E0B" } }).showToast();
            return;
        }
        
        if (cart.length === 0) return;

        // 2. Validate thông tin giao hàng
        if (!info.name.trim() || !info.phone.trim() || !info.address.trim()) {
            Toastify({ text: "Vui lòng điền đủ tên, sđt và địa chỉ!", style: { background: "#EF4444" } }).showToast();
            return;
        }

        // 3. Validate thông tin thẻ (Nếu chọn Visa)
        if (paymentMethod === 'banking') {
            if (!cardInfo.number.trim() || !cardInfo.expiry.trim() || !cardInfo.cvv.trim()) {
                Toastify({ text: "Vui lòng nhập thông tin thẻ Visa!", style: { background: "#EF4444" } }).showToast();
                return;
            }
        }

        setIsProcessing(true);

        try {
            // Giả lập xử lý thanh toán (2 giây)
            if (paymentMethod === 'banking') {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // 4. Gọi API tạo đơn hàng (FIX LỖI 422 TẠI ĐÂY)
            await createOrder({
                user_id: user.id,
                total: cartTotal,
                // Map đúng schema backend yêu cầu: id, name, price, qty
                items: cart.map(i => ({ 
                    id: i.id, 
                    name: i.name, // <--- ĐÃ THÊM TRƯỜNG NÀY (Quan trọng)
                    price: i.price,
                    qty: i.qty
                }))
            });
            
            clearCart();
            Toastify({ 
                text: "✅ Đặt hàng thành công! Cảm ơn bạn.", 
                style: { background: "#10B981" },
                duration: 3000
            }).showToast();
            
            navigate('/'); 

        } catch (err: any) {
            console.error("Checkout Error:", err);
            
            // Xử lý hiển thị lỗi thông minh hơn (tránh [object Object])
            let msg = "Lỗi kết nối server";
            const detail = err.response?.data?.detail;

            if (typeof detail === 'string') {
                msg = detail;
            } else if (Array.isArray(detail)) {
                // Nếu lỗi là array (Pydantic validation error), lấy msg đầu tiên
                msg = detail.map((e: any) => `${e.loc[1]}: ${e.msg}`).join(', ');
            }

            Toastify({ text: msg, style: { background: "red" } }).showToast();
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4 animate-fade-in">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                <ShoppingBag size={40}/>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
            <button onClick={() => navigate('/')} className="bg-black text-white px-8 py-3 rounded-xl font-bold mt-4 hover:bg-gray-800 transition-all">
                Đi mua sắm ngay
            </button>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in pb-20">
            <h1 className="text-3xl font-black text-gray-900 mb-8">Thanh toán an toàn</h1>
            
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* --- CỘT TRÁI: LIST SẢN PHẨM & FORM --- */}
                <div className="flex-1 space-y-6">
                    
                    {/* 1. Danh sách sản phẩm */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">1. Đơn hàng của bạn</h2>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-xl p-2 shrink-0 flex items-center justify-center">
                                        <img src={item.image} className="w-full h-full object-contain mix-blend-multiply"/>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                                        <div className="text-blue-600 font-bold text-sm">{item.price.toLocaleString()}đ x {item.qty}</div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                        <button onClick={() => item.qty > 1 ? updateQuantity(item.id, -1) : removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-xs font-bold">-</button>
                                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-xs font-bold">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Thông tin giao hàng */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">2. Thông tin nhận hàng</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                    <input className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none outline-none font-medium text-sm"
                                        placeholder="Họ tên" value={info.name} onChange={e => setInfo({...info, name: e.target.value})} />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                    <input className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none outline-none font-medium text-sm"
                                        placeholder="Số điện thoại" value={info.phone} onChange={e => setInfo({...info, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                                <input className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none outline-none font-medium text-sm"
                                    placeholder="Địa chỉ nhận hàng (Số nhà, Phường, Quận...)" value={info.address} onChange={e => setInfo({...info, address: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: THANH TOÁN --- */}
                <div className="flex-1 lg:max-w-md space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-24">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">3. Thanh toán</h2>
                        
                        {/* Chọn phương thức */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button 
                                onClick={() => setPaymentMethod('cod')}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${paymentMethod === 'cod' ? 'border-black bg-black text-white' : 'border-gray-100 bg-white text-gray-500'}`}
                            >
                                <Banknote size={20}/>
                                <span className="font-bold text-xs">Tiền mặt (COD)</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('banking')}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${paymentMethod === 'banking' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 bg-white text-gray-500'}`}
                            >
                                <CreditCard size={20}/>
                                <span className="font-bold text-xs">Visa / Thẻ</span>
                            </button>
                        </div>

                        {/* FORM NHẬP THẺ VISA (Chỉ hiện khi chọn Banking) */}
                        {paymentMethod === 'banking' && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 animate-fade-in">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Thông tin thẻ</span>
                                    <div className="flex gap-1">
                                        <div className="w-8 h-5 bg-blue-800 rounded"></div>
                                        <div className="w-8 h-5 bg-red-600 rounded"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                                        <input className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 font-mono"
                                            placeholder="0000 0000 0000 0000" maxLength={19}
                                            value={cardInfo.number} onChange={e => setCardInfo({...cardInfo, number: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                                            <input className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 font-mono"
                                                placeholder="MM/YY" maxLength={5}
                                                value={cardInfo.expiry} onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})} />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                                            <input type="password" className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 font-mono"
                                                placeholder="CVV" maxLength={3}
                                                value={cardInfo.cvv} onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tổng kết */}
                        <div className="border-t border-dashed my-4 pt-4">
                            <div className="flex justify-between mb-2 text-sm text-gray-500">
                                <span>Tạm tính</span>
                                <span>{cartTotal.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between mb-4 text-sm text-gray-500">
                                <span>Vận chuyển</span>
                                <span className="text-green-600 font-bold">Miễn phí</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-gray-900">Tổng thanh toán</span>
                                <span className="text-2xl font-black text-blue-600">{cartTotal.toLocaleString()}đ</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Đang xử lý...' : (paymentMethod === 'cod' ? 'Đặt Hàng (COD)' : 'Thanh Toán Ngay')} 
                            {!isProcessing && <ArrowRight size={20}/>}
                        </button>
                        
                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
                            <ShieldCheck size={12} className="text-green-500"/> Bảo mật thanh toán SSL 256-bit
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;