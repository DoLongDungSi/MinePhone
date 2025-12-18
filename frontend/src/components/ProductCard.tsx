import React from 'react';
import { Plus, Scale, Eye } from 'lucide-react';
import type { Product } from '../types'; // <-- QUAN TRỌNG: Thêm 'type' để sửa lỗi
import { useStore } from '../context/StoreContext';

interface Props { 
    product: Product; 
    onClick: () => void; 
}

const ProductCard: React.FC<Props> = ({ product, onClick }) => {
    // Lấy hàm thêm vào giỏ hàng và so sánh từ Store
    const { addToCart, addToCompare } = useStore();

    return (
        <div className="group bg-white rounded-3xl p-4 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            {/* Nhãn tình trạng máy (Like New, New...) */}
            <div className="absolute top-4 left-4 z-10 bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                {product.condition}
            </div>
            
            {/* Hình ảnh sản phẩm */}
            <div 
                className="relative h-64 bg-gray-50 rounded-2xl mb-4 flex items-center justify-center overflow-hidden cursor-pointer" 
                onClick={onClick}
            >
                <img 
                    src={product.image} 
                    className="h-[85%] object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" 
                    alt={product.name}
                />
                
                {/* Các nút hành động nhanh (Hiện khi di chuột vào) */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button 
                        onClick={(e) => {e.stopPropagation(); addToCompare(product)}} 
                        className="bg-white p-3 rounded-full hover:bg-blue-600 hover:text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300" 
                        title="So sánh"
                    >
                        <Scale size={20}/>
                    </button>
                    
                    <button 
                        onClick={(e) => {e.stopPropagation(); onClick()}} 
                        className="bg-white p-3 rounded-full hover:bg-blue-600 hover:text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75" 
                        title="Xem chi tiết"
                    >
                        <Eye size={20}/>
                    </button>
                </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div>
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">{product.brand}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1" title={product.name}>
                    {product.name}
                </h3>
                
                {/* Thông số kỹ thuật tóm tắt */}
                <div className="flex gap-2 mb-4">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                        {product.chip}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                        {product.storage}
                    </span>
                </div>
                
                {/* Giá và nút Mua ngay */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="font-bold text-xl text-blue-600">
                            {product.price.toLocaleString()}đ
                        </span>
                        {product.old_price && (
                            <span className="text-xs text-gray-400 line-through">
                                {product.old_price.toLocaleString()}đ
                            </span>
                        )}
                    </div>
                    
                    <button 
                        onClick={(e) => {e.stopPropagation(); addToCart(product)}} 
                        className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-gray-300 active:scale-90"
                        title="Thêm vào giỏ"
                    >
                        <Plus size={20}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;