import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';

export const ConfirmModal: React.FC = () => {
    // 1. Log để xem component có render lại khi bấm nút không
    console.log("Render ConfirmModal"); 
    
    const { confirmModal, closeConfirmModal } = useAppContext();

    if (!confirmModal?.isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex justify-center items-center p-4"
            // GIẢI PHÁP MẠNH: Dùng style trực tiếp để ép trình duyệt hiểu, bỏ qua Tailwind
            style={{ zIndex: 99999 }} 
        >
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative">
                <h3 className="text-lg font-bold text-slate-800">{confirmModal.title}</h3>
                <p className="mt-2 text-sm text-slate-600">
                    {confirmModal.message}
                </p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        // 2. Thêm Log và Inline Style cho nút Hủy
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log("DEBUG: Đã click nút Hủy tại component"); // Nếu không thấy dòng này -> Nút bị che 100%
                            closeConfirmModal();
                        }}
                        style={{ position: 'relative', zIndex: 100000, cursor: 'pointer' }}
                        className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            console.log("DEBUG: Đã click nút Xác nhận");
                            confirmModal.onConfirm();
                        }}
                        style={{ position: 'relative', zIndex: 100000, cursor: 'pointer' }}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};