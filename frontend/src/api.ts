// FILE: MinePhone/frontend/src/api.ts
import axios from 'axios';
import type { Product, User } from './types'; // Đảm bảo bạn đã có file types.ts

// Lấy URL từ biến môi trường hoặc dùng mặc định localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Tạo instance axios mặc định
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// --- 1. PRODUCT APIs (SẢN PHẨM) ---

// Lấy danh sách sản phẩm (Hỗ trợ lọc, tìm kiếm, sắp xếp)
export const getProducts = async (
    brand?: string, 
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string
) => {
  const params: any = {};
  
  if (brand && brand !== 'All') params.brand = brand;
  if (search) params.search = search;
  if (minPrice) params.min_price = minPrice;
  if (maxPrice) params.max_price = maxPrice;
  if (sortBy) params.sort_by = sortBy;
  
  const res = await api.get<Product[]>('/products', { params });
  return res.data;
};

// Lấy chi tiết 1 sản phẩm
export const getProductDetail = async (id: number) => {
    const res = await api.get<Product>(`/products/${id}`);
    return res.data;
};

// Tạo sản phẩm mới (Admin)
export const createProduct = async (product: any) => {
  const res = await api.post<Product>('/products', product);
  return res.data;
};

// Cập nhật sản phẩm (Admin)
export const updateProduct = async (id: number, product: any) => {
    const res = await api.put<Product>(`/products/${id}`, product);
    return res.data;
};

// Xóa sản phẩm (Admin)
export const deleteProduct = async (id: number) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
};

// Upload ảnh (Multipart Form Data)
export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    // Trả về URL của ảnh
    return res.data.url;
};

// Tạo dữ liệu mẫu
export const seedData = async () => {
  return await api.post('/seed');
};

// --- 2. AUTH APIs (ĐĂNG KÝ / ĐĂNG NHẬP) ---

export const loginUser = async (u: string, p: string) => {
  const res = await api.post('/auth/login', { username: u, password: p });
  // Trả về object User { id, username, role }
  return res.data;
};

export const registerUser = async (u: string, p: string) => {
    const res = await api.post('/auth/register', { username: u, password: p });
    return res.data;
};

// --- 3. ORDER APIs (ĐƠN HÀNG) ---

// Tạo đơn hàng mới
export const createOrder = async (orderData: any) => {
  const res = await api.post('/orders', orderData);
  return res.data;
};

// Lấy danh sách đơn hàng (Có thể lọc theo User ID)
export const getOrders = async (userId?: number) => {
    const params = userId ? { user_id: userId } : {};
    const res = await api.get('/orders', { params });
    return res.data;
};

// Cập nhật trạng thái đơn (Admin)
export const updateOrderStatus = async (orderId: number, status: string) => {
    // API backend dùng query param: /orders/{id}/status?status=...
    const res = await api.patch(`/orders/${orderId}/status`, null, { 
        params: { status } 
    });
    return res.data;
};

// --- 4. AI APIs (SPRINT 3) ---
export const aiChat = async (message: string) => {
  const res = await api.post('/ai/chat', { message });
  return res.data;
};


// --- 5. REVIEWS & STATS (MỚI) ---
export const getReviews = async (productId: number) => {
    const res = await api.get(`/products/${productId}/reviews`);
    return res.data;
};

export const createReview = async (data: {user_id: number, product_id: number, rating: number, comment: string}) => {
    const res = await api.post('/reviews', data);
    return res.data;
};

export const getDashboardStats = async () => {
    const res = await api.get('/admin/stats');
    return res.data;
};