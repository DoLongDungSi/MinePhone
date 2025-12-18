// FILE: MinePhone/frontend/src/pages/client/ProductDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, ShoppingBag, Check, Package, Share2, Heart, 
    Minus, Plus, Truck, ShieldCheck 
} from 'lucide-react';
import { api } from '../../api';
import type { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import Toastify from 'toastify-js';
import ProductCard from '../../components/ProductCard';
import ReviewSection from '../../components/ReviewSection';
const ProductDetailPage = () => {
    // Lấy ID từ URL
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Lấy hàm thêm vào giỏ từ Context
    const { addToCart } = useStore();
    
    // State quản lý dữ liệu
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    
    // State quản lý số lượng mua (Mặc định là 1)
    const [quantity, setQuantity] = useState(1);

    // Effect: Load dữ liệu khi ID thay đổi
    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            // Reset số lượng về 1 mỗi khi đổi sản phẩm
            setQuantity(1); 
            
            try {
                if (!id) return;

                // 1. Lấy chi tiết sản phẩm hiện tại
                const res = await api.get<Product>(`/products/${id}`);
                const currentProduct = res.data;
                setProduct(currentProduct);
                
                // 2. Lấy sản phẩm liên quan (Cùng Brand)
                const relatedRes = await api.get<Product[]>('/products', { 
                    params: { brand: currentProduct.brand } 
                });
                
                // Lọc bỏ sản phẩm đang xem và lấy tối đa 4 sản phẩm
                const filteredRelated = relatedRes.data
                    .filter(p => p.id !== currentProduct.id)
                    .slice(0, 4);
                
                setRelatedProducts(filteredRelated);

            } catch (error) {
                console.error("Lỗi tải trang chi tiết:", error);
                Toastify({ 
                    text: "Sản phẩm không tồn tại hoặc lỗi kết nối!", 
                    style: { background: "#EF4444" } 
                }).showToast();
                navigate('/'); 
            } finally { 
                setLoading(false); 
            }
        };

        fetchDetail();
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    }, [id, navigate]);

    // Hàm xử lý tăng/giảm số lượng
    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => {
            const newValue = prev + delta;
            // Không cho phép < 1 và không vượt quá tồn kho (nếu có thông tin tồn kho)
            if (newValue < 1) return 1;
            if (product && newValue > product.quantity) {
                Toastify({ text: "Đã đạt giới hạn tồn kho!", style: { background: "orange" } }).showToast();
                return product.quantity;
            }
            return newValue;
        });
    };

    // Hàm xử lý thêm vào giỏ
    const handleAddToCart = () => {
        if (product) {
            // Gọi hàm addToCart mới (có hỗ trợ tham số quantity)
            addToCart(product, quantity);
        }
    };

    // --- RENDER LOADING ---
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black mb-4"></div>
                <p className="font-medium">Đang tải thông tin chi tiết...</p>
            </div>
        );
    }

    // --- RENDER EMPTY (Nếu không tìm thấy) ---
    if (!product) return null;

    // --- RENDER MAIN CONTENT ---
    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in pb-20">
            {/* Nút Quay lại */}
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-gray-500 mb-6 hover:text-black transition-colors font-medium group px-4 py-2 hover:bg-gray-100 rounded-full w-fit"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> 
                Quay lại
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 bg-white md:p-8 rounded-[2rem] shadow-sm border border-gray-100 mb-16">
                
                {/* --- CỘT TRÁI: ẢNH --- */}
                <div className="md:col-span-5 flex flex-col gap-4">
                    <div className="bg-gray-50 rounded-3xl p-8 flex items-center justify-center border border-gray-100 relative group overflow-hidden aspect-square">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Nhãn Tình trạng */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm text-gray-800">
                            {product.condition}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: THÔNG TIN --- */}
                <div className="md:col-span-7 flex flex-col">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider mb-2 bg-blue-50 w-fit px-3 py-1 rounded-full">
                            {product.brand}
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                            {product.name}
                        </h1>
                        
                        {/* Giá bán */}
                        <div className="flex items-end gap-4 mb-6 pb-6 border-b border-gray-100">
                            <div className="text-4xl font-bold text-gray-900">
                                {product.price.toLocaleString()}đ
                            </div>
                            {product.old_price && (
                                <div className="text-xl text-gray-400 line-through mb-1 font-medium">
                                    {product.old_price.toLocaleString()}đ
                                </div>
                            )}
                            {product.old_price && (
                                <div className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg mb-2">
                                    -{Math.round((1 - product.price/product.old_price)*100)}%
                                </div>
                            )}
                        </div>

                        {/* Mô tả ngắn / Tồn kho */}
                        <p className="text-gray-600 leading-relaxed mb-6">
                            {product.desc || `Sản phẩm ${product.name} chính hãng, giá tốt nhất thị trường. Bảo hành dài hạn, hỗ trợ trả góp 0%.`}
                        </p>
                    </div>

                    {/* Bộ chọn cấu hình (Visual Only - Sprint 1 chưa xử lý logic biến thể) */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Chip xử lý</div>
                            <div className="font-bold text-gray-900 truncate" title={product.chip}>{product.chip}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Bộ nhớ</div>
                            <div className="font-bold text-gray-900">{product.ram} / {product.storage}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Màn hình</div>
                            <div className="font-bold text-gray-900 truncate" title={product.screen}>{product.screen}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Pin & Sạc</div>
                            <div className="font-bold text-gray-900 truncate" title={product.battery}>{product.battery}</div>
                        </div>
                    </div>

                    {/* --- ACTIONS AREA (SỐ LƯỢNG & MUA) --- */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                        
                        {/* Chọn số lượng */}
                        <div className="flex items-center justify-between bg-gray-100 rounded-2xl px-4 py-2 sm:w-40 h-[60px]">
                            <button 
                                onClick={() => handleQuantityChange(-1)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                            >
                                <Minus size={16}/>
                            </button>
                            <span className="font-bold text-xl w-8 text-center">{quantity}</span>
                            <button 
                                onClick={() => handleQuantityChange(1)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                            >
                                <Plus size={16}/>
                            </button>
                        </div>

                        {/* Nút Thêm vào giỏ */}
                        <button 
                            onClick={handleAddToCart}
                            disabled={product.quantity === 0}
                            className="flex-1 h-[60px] bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200"
                        >
                            <ShoppingBag size={22}/>
                            {product.quantity > 0 ? 'Thêm Vào Giỏ Hàng' : 'Hết Hàng'}
                        </button>
                        
                        {/* Nút Yêu thích (Placeholder) */}
                        <button className="h-[60px] w-[60px] flex items-center justify-center rounded-2xl border-2 border-gray-100 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all text-gray-400">
                            <Heart size={24}/>
                        </button>
                    </div>

                    {/* Chính sách bán hàng */}
                    <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 font-medium">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"><ShieldCheck size={16}/></div>
                            Bảo hành 12 tháng chính hãng
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Truck size={16}/></div>
                            Miễn phí vận chuyển toàn quốc
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Package size={16}/></div>
                            Bao test 1 đổi 1 trong 30 ngày
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Share2 size={16}/></div>
                            Hỗ trợ trả góp 0% lãi suất
                        </div>
                    </div>
                </div>
            </div>
            
            {product && <ReviewSection productId={product.id} />}
            {/* --- SẢN PHẨM LIÊN QUAN --- */}
            {relatedProducts.length > 0 && (
                <div className="mt-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Sản phẩm tương tự</h2>
                        <button onClick={() => navigate('/')} className="text-sm font-bold text-blue-600 hover:underline">
                            Xem tất cả
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map(p => (
                            <ProductCard 
                                key={p.id} 
                                product={p} 
                                onClick={() => navigate(`/product/${p.id}`)} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;