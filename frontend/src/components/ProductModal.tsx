import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { createProduct, updateProduct, uploadImage } from '../api'; 
import type { Product } from '../types';
import Toastify from 'toastify-js';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productToEdit?: Product | null;
}

const ProductModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, productToEdit }) => {
    // State form
    const [formData, setFormData] = useState({
        name: '', brand: 'Apple', price: 0, old_price: 0, quantity: 10,
        image: '', condition: 'New 100%',
        chip: '', ram: '', storage: '', screen: '', battery: '', desc: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false); // State xử lý upload

    // Load dữ liệu khi sửa
    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                brand: productToEdit.brand,
                price: productToEdit.price,
                old_price: productToEdit.old_price || 0,
                quantity: productToEdit.quantity,
                image: productToEdit.image,
                condition: productToEdit.condition || 'New 100%',
                chip: productToEdit.chip || '',
                ram: productToEdit.ram || '',
                storage: productToEdit.storage || '',
                screen: productToEdit.screen || '',
                battery: productToEdit.battery || '',
                desc: productToEdit.desc || ''
            });
        } else {
            // Reset form
            setFormData({
                name: '', brand: 'Apple', price: 0, old_price: 0, quantity: 10,
                image: '', // Mặc định trống để bắt buộc upload hoặc nhập
                condition: 'New 100%', chip: '', ram: '', storage: '', screen: '', battery: '', desc: ''
            });
        }
    }, [productToEdit, isOpen]);

    // --- HÀM UPLOAD ẢNH MỚI ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            // Gọi API upload của backend
            const res = await uploadImage(data);
            // Backend trả về { "url": "http://..." }
            setFormData(prev => ({ ...prev, image: res.url }));
            Toastify({ text: "📸 Upload ảnh thành công!", style: { background: "green" } }).showToast();
        } catch (error) {
            console.error(error);
            Toastify({ text: "Lỗi upload ảnh", style: { background: "red" } }).showToast();
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.image) {
                Toastify({ text: "Vui lòng upload hình ảnh sản phẩm!", style: { background: "orange" } }).showToast();
                setLoading(false);
                return;
            }

            if (productToEdit) {
                await updateProduct(productToEdit.id, formData);
                Toastify({ text: "Cập nhật thành công!", style: { background: "green" } }).showToast();
            } else {
                await createProduct(formData);
                Toastify({ text: "Thêm mới thành công!", style: { background: "green" } }).showToast();
            }
            onSuccess();
            onClose();
        } catch (error) {
            Toastify({ text: "Có lỗi xảy ra", style: { background: "red" } }).showToast();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {productToEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Cột Trái: Ảnh & Giá */}
                    <div className="space-y-5">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="block text-sm font-bold mb-2">Hình ảnh sản phẩm</label>
                            
                            {/* Khu vực Upload */}
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                                    {formData.image ? (
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <ImageIcon className="text-gray-300" size={32} />
                                    )}
                                    {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">...</div>}
                                </div>
                                <div className="flex-1">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                    />
                                    <div className="mt-2 text-xs text-gray-400">Hoặc dán link ảnh:</div>
                                    <input 
                                        className="w-full text-xs border rounded p-1.5 mt-1" 
                                        placeholder="https://..."
                                        value={formData.image}
                                        onChange={e => setFormData({...formData, image: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">Tên sản phẩm</label>
                            <input required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-black outline-none" 
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: iPhone 15 Pro Max"/>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Thương hiệu</label>
                                <select className="w-full border p-3 rounded-xl outline-none bg-white" 
                                    value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}>
                                    <option value="Apple">Apple</option>
                                    <option value="Samsung">Samsung</option>
                                    <option value="Xiaomi">Xiaomi</option>
                                    <option value="Oppo">Oppo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Tình trạng</label>
                                <select className="w-full border p-3 rounded-xl outline-none bg-white" 
                                    value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
                                    <option value="New 100%">New 100%</option>
                                    <option value="Like New">Like New</option>
                                    <option value="99%">99%</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Giá bán (VNĐ)</label>
                                <input type="number" required className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold" 
                                    value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Kho</label>
                                <input type="number" required className="w-full border p-3 rounded-xl outline-none" 
                                    value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                            </div>
                        </div>
                    </div>

                    {/* Cột Phải: Cấu hình */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 border-b pb-2">Thông số kỹ thuật</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Chip (VD: A17 Pro)" className="border p-3 rounded-xl outline-none" 
                                value={formData.chip} onChange={e => setFormData({...formData, chip: e.target.value})} />
                            <input placeholder="RAM (VD: 8GB)" className="border p-3 rounded-xl outline-none" 
                                value={formData.ram} onChange={e => setFormData({...formData, ram: e.target.value})} />
                            <input placeholder="Bộ nhớ (VD: 256GB)" className="border p-3 rounded-xl outline-none" 
                                value={formData.storage} onChange={e => setFormData({...formData, storage: e.target.value})} />
                            <input placeholder="Màn hình (VD: 6.7)" className="border p-3 rounded-xl outline-none" 
                                value={formData.screen} onChange={e => setFormData({...formData, screen: e.target.value})} />
                            <input placeholder="Pin (VD: 4422 mAh)" className="border p-3 rounded-xl outline-none" 
                                value={formData.battery} onChange={e => setFormData({...formData, battery: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 mt-4">Mô tả chi tiết</label>
                            <textarea rows={5} className="w-full border p-3 rounded-xl outline-none resize-none" 
                                value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} 
                                placeholder="Mô tả sản phẩm..."></textarea>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 mt-auto rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-3 bg-white border border-gray-300 rounded-xl font-bold hover:bg-gray-50">
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading || uploading} 
                        className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Đang lưu...' : <><Save size={20}/> Lưu Sản Phẩm</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;