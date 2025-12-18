// FILE: MinePhone/frontend/src/components/AuthModal.tsx
import React, { useState, useEffect } from 'react';
import { X, User, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'; // Thêm icon báo lỗi/thành công
import { useStore } from '../context/StoreContext';
import { loginUser, registerUser } from '../api';
import { useNavigate } from 'react-router-dom';
import Toastify from 'toastify-js';

// Định nghĩa Props cho component
interface AuthModalProps {
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    // --- STATE QUẢN LÝ ---
    const [isLogin, setIsLogin] = useState(true); // true = Login, false = Register
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(''); // State hiển thị lỗi ngay trên form

    // Lấy context và hook
    const { login } = useStore();
    const navigate = useNavigate();

    // Reset lỗi khi chuyển tab
    useEffect(() => {
        setErrorMsg('');
        setUsername('');
        setPassword('');
    }, [isLogin]);

    // --- HÀM XỬ LÝ SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        // 1. Validate cơ bản
        if (!username.trim() || !password.trim()) {
            setErrorMsg('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.');
            return;
        }

        if (password.length < 6) {
            setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                // ================= LOGIC ĐĂNG NHẬP =================
                const userData = await loginUser(username, password);
                
                // Lưu user vào context (và localStorage)
                login(userData);

                // Thông báo thành công
                Toastify({ 
                    text: `Chào mừng ${userData.username} quay trở lại!`, 
                    style: { background: "#10B981" },
                    duration: 3000
                }).showToast();
                
                // Đóng modal
                onClose();

                // Kiểm tra Role để chuyển hướng
                if (userData.role === 'admin') {
                    setTimeout(() => {
                        navigate('/admin'); // Chuyển sang trang Admin
                        Toastify({ text: "Đang vào trang quản trị...", style: { background: "#3B82F6" } }).showToast();
                    }, 500);
                }

            } else {
                // ================= LOGIC ĐĂNG KÝ =================
                await registerUser(username, password);
                
                Toastify({ 
                    text: "Đăng ký thành công! Đang đăng nhập...", 
                    style: { background: "#3B82F6" } 
                }).showToast();

                // Tự động đăng nhập ngay sau khi đăng ký
                const userData = await loginUser(username, password);
                login(userData);
                onClose();
            }

        } catch (error: any) {
            console.error("Auth Error:", error);
            // Lấy thông báo lỗi từ backend (FastAPI raise HTTPException)
            const message = error.response?.data?.detail || "Có lỗi xảy ra, vui lòng thử lại.";
            setErrorMsg(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Overlay nền đen mờ
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            
            {/* Modal Container */}
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative flex flex-col transform transition-all scale-100">
                
                {/* Nút Đóng (X) */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all z-10"
                    title="Đóng"
                >
                    <X size={24} />
                </button>

                {/* Header: Tiêu đề */}
                <div className="p-8 pb-0 text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                        {isLogin ? 'MinePhone ID' : 'Tạo tài khoản'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isLogin 
                            ? 'Đăng nhập để quản lý đơn hàng & tích điểm' 
                            : 'Trở thành thành viên để nhận ưu đãi'
                        }
                    </p>
                </div>

                {/* Form Nhập liệu */}
                <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
                    
                    {/* Hiển thị lỗi nếu có */}
                    {errorMsg && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium animate-pulse">
                            <AlertCircle size={18} />
                            {errorMsg}
                        </div>
                    )}

                    {/* Input Username */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tên đăng nhập</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20}/>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                                placeholder="Ví dụ: admin"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Input Password */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mật khẩu</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20}/>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all font-medium"
                                placeholder="••••••"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Nút Submit */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="mt-2 w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-gray-200"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Đang xử lý...
                            </span>
                        ) : (
                            <>
                                {isLogin ? 'Đăng Nhập' : 'Đăng Ký Ngay'}
                                <ArrowRight size={20}/>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer: Chuyển đổi Login/Register */}
                <div className="bg-gray-50 p-6 text-center border-t border-gray-100 mt-auto">
                    <p className="text-gray-600 text-sm">
                        {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                        <button 
                            type="button" // Quan trọng để không trigger submit form
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 font-bold text-blue-600 hover:text-blue-800 hover:underline transition-all"
                        >
                            {isLogin ? 'Đăng ký miễn phí' : 'Đăng nhập ngay'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;