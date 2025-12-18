import React from 'react';
import { X } from 'lucide-react';
import type { Product } from '../types'; // <-- QUAN TRỌNG: Thêm 'type' để sửa lỗi

interface Props { 
    products: Product[]; 
    onClose: () => void; 
    onRemove: (id:number) => void; 
}

const CompareModal: React.FC<Props> = ({ products, onClose, onRemove }) => {
    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-3xl p-8 overflow-x-auto shadow-2xl animate-slide-up relative">
                {/* Nút đóng Modal */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <X size={20}/>
                </button>
                
                <h2 className="text-2xl font-bold mb-6 text-gray-800">So sánh chi tiết</h2>
                
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 border-b text-gray-500 font-medium">Thông số kỹ thuật</th>
                            {products.map(p => (
                                <th key={p.id} className="p-4 border-b min-w-[200px]">
                                    <div className="relative flex flex-col items-center">
                                        <button 
                                            onClick={() => onRemove(p.id)} 
                                            className="absolute -top-2 -right-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full p-1.5 transition-colors"
                                            title="Xóa khỏi so sánh"
                                        >
                                            <X size={14}/>
                                        </button>
                                        <img src={p.image} className="h-32 object-contain mb-3 mix-blend-multiply" alt={p.name}/>
                                        <div className="text-center font-bold text-gray-800">{p.name}</div>
                                        <div className="text-center text-blue-600 font-bold mt-1">
                                            {p.price.toLocaleString()}đ
                                        </div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {['chip', 'ram', 'storage', 'screen', 'battery'].map(spec => (
                            <tr key={spec} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">
                                    {spec}
                                </td>
                                {products.map(p => (
                                    <td key={p.id} className="p-4 text-center font-medium text-gray-700">
                                        {(p as any)[spec]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        Chưa có sản phẩm nào để so sánh.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompareModal;