// FILE: MinePhone/frontend/src/pages/client/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Filter, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts, seedData } from '../../api';
import type { Product } from '../../types';
import ProductCard from '../../components/ProductCard';

const HomePage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    
    // States bộ lọc
    const [brand, setBrand] = useState('All');
    const [search, setSearch] = useState('');
    const [priceRange, setPriceRange] = useState<string>('all'); // all, <10m, 10m-20m, >20m
    const [sortBy, setSortBy] = useState<string>('newest'); // newest, price_asc, price_desc

    const fetchData = async () => {
        setLoading(true);
        try {
            // Convert khoảng giá
            let min, max;
            if (priceRange === 'under_10') { max = 10000000; }
            else if (priceRange === '10_20') { min = 10000000; max = 20000000; }
            else if (priceRange === 'over_20') { min = 20000000; }

            const data = await getProducts(brand, search, min, max, sortBy);
            setProducts(data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { 
        const t = setTimeout(fetchData, 300); 
        return () => clearTimeout(t); 
    }, [brand, search, priceRange, sortBy]);

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            {/* --- THANH CÔNG CỤ (FILTER & SORT) --- */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 sticky top-24 z-30">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    
                    {/* 1. Lọc Thương hiệu */}
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                        {['All', 'Apple', 'Samsung', 'Xiaomi'].map(b => (
                            <button key={b} onClick={() => setBrand(b)} 
                                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${brand === b ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {b === 'All' ? 'Tất cả' : b}
                            </button>
                        ))}
                    </div>

                    {/* 2. Tìm kiếm & Lọc nâng cao */}
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        {/* Lọc Giá */}
                        <div className="relative group">
                            <Filter size={18} className="absolute left-3 top-2.5 text-gray-500"/>
                            <select 
                                value={priceRange} 
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 appearance-none cursor-pointer hover:bg-white transition-colors"
                            >
                                <option value="all">Mọi mức giá</option>
                                <option value="under_10">Dưới 10 triệu</option>
                                <option value="10_20">Từ 10 - 20 triệu</option>
                                <option value="over_20">Trên 20 triệu</option>
                            </select>
                        </div>

                        {/* Sắp xếp */}
                        <div className="relative">
                            <ArrowUpDown size={18} className="absolute left-3 top-2.5 text-gray-500"/>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 appearance-none cursor-pointer hover:bg-white transition-colors"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="price_asc">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
                            </select>
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[200px]">
                            <input 
                                placeholder="Tìm tên máy..." 
                                className="w-full bg-white border border-gray-200 px-4 py-2 rounded-xl pl-10 text-sm outline-none focus:ring-2 focus:ring-black transition-all" 
                                value={search} onChange={(e) => setSearch(e.target.value)} 
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- GRID SẢN PHẨM --- */}
            {loading ? (
                <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-600"/></div> 
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed">
                    <p className="mb-2">Không tìm thấy sản phẩm phù hợp.</p>
                    <button onClick={async () => { await seedData(); fetchData(); }} className="text-blue-600 font-bold hover:underline">Reset dữ liệu mẫu</button>
                </div> 
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(p => (
                        <ProductCard key={p.id} product={p} onClick={() => navigate(`/product/${p.id}`)} /> 
                    ))}
                </div>
            )}
        </div>
    );
};
export default HomePage;