// FILE: MinePhone/frontend/src/pages/admin/ProductManagement.tsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Package, MoreVertical, RefreshCw } from 'lucide-react';
import { getProducts, deleteProduct } from '../../api';
import type { Product } from '../../types';
import Toastify from 'toastify-js';
import ProductModal from '../../components/ProductModal'; // Import Modal

const ProductManagement = () => {
    // State dữ liệu
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // State Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Load dữ liệu từ API
    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getProducts('All');
            setProducts(data);
        } catch (error) {
            Toastify({ text: "Không thể tải danh sách sản phẩm!", style: { background: "red" } }).showToast();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Xóa sản phẩm
    const handleDelete = async (id: number) => {
        if (!confirm("Cảnh báo: Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
        
        try {
            await deleteProduct(id);
            Toastify({ text: "Đã xóa sản phẩm", style: { background: "green" } }).showToast();
            loadData(); // Reload lại bảng
        } catch (error) {
            Toastify({ text: "Lỗi khi xóa sản phẩm", style: { background: "red" } }).showToast();
        }
    };

    // Mở modal thêm mới
    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    // Mở modal chỉnh sửa
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    // Lọc tìm kiếm
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kho Sản Phẩm</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý nhập xuất và giá cả</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadData} className="p-2.5 bg-white border rounded-xl hover:bg-gray-50 text-gray-600 transition-all" title="Làm mới">
                        <RefreshCw size={20}/>
                    </button>
                    <button 
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus size={20}/> Thêm mới
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                    <input 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-medium transition-all" 
                        placeholder="Tìm kiếm theo tên, mã sản phẩm..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Sản phẩm</th>
                            <th className="px-6 py-4">Thương hiệu</th>
                            <th className="px-6 py-4">Giá bán</th>
                            <th className="px-6 py-4">Tồn kho</th>
                            <th className="px-6 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-400">Chưa có sản phẩm nào. Hãy thêm mới!</td></tr>
                        ) : (
                            filteredProducts.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white border border-gray-100 rounded-lg p-1 flex items-center justify-center">
                                                <img src={p.image} className="w-full h-full object-contain mix-blend-multiply" alt=""/>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{p.name}</div>
                                                <div className="text-xs text-gray-400 font-mono">ID: #{p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">{p.brand}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-blue-600">{p.price.toLocaleString()} ₫</div>
                                        {p.old_price && <div className="text-xs text-gray-400 line-through">{p.old_price.toLocaleString()} ₫</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-2 font-bold text-sm ${p.quantity > 5 ? 'text-green-600' : 'text-orange-500'}`}>
                                            <Package size={16}/> {p.quantity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEdit(p)}
                                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Sửa"
                                            >
                                                <Edit size={18}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.id)}
                                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Popup */}
            <ProductModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={loadData} 
                productToEdit={editingProduct}
            />
        </div>
    );
};

export default ProductManagement;