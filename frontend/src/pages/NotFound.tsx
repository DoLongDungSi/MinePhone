// FILE: MinePhone/frontend/src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
            <h1 className="text-9xl font-black text-gray-200">404</h1>
            <div className="absolute">
                <div className="text-2xl font-bold text-gray-800 mb-2">Oops! Trang không tồn tại</div>
                <p className="text-gray-500 mb-6">Có vẻ bạn đã đi lạc vào vùng đất không có sóng điện thoại.</p>
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-200">
                    <Home size={20}/> Quay về trang chủ
                </Link>
            </div>
        </div>
    );
};
export default NotFound;