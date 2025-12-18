// FILE: MinePhone/frontend/src/context/StoreContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem, User } from '../types';
import Toastify from 'toastify-js';

// Định nghĩa kiểu dữ liệu cho Context
interface StoreContextType {
    // --- STATE GIỎ HÀNG ---
    cart: CartItem[];
    // Cập nhật quan trọng: Thêm tham số quantity (mặc định = 1)
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, change: number) => void; // Tăng giảm số lượng trong giỏ
    clearCart: () => void;
    cartTotal: number;
    
    // --- STATE USER (AUTH) ---
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    
    // --- STATE SO SÁNH (COMPARE) ---
    compareList: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (id: number) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    
    // 1. KHỞI TẠO STATE & LOAD TỪ LOCAL STORAGE
    
    const [user, setUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem('minephone_user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('minephone_cart');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    
    const [compareList, setCompareList] = useState<Product[]>([]);

    // 2. EFFECTS: TỰ ĐỘNG LƯU KHI STATE THAY ĐỔI
    
    useEffect(() => {
        if (user) localStorage.setItem('minephone_user', JSON.stringify(user));
        else localStorage.removeItem('minephone_user');
    }, [user]);

    useEffect(() => {
        localStorage.setItem('minephone_cart', JSON.stringify(cart));
    }, [cart]);

    // 3. LOGIC CART (GIỎ HÀNG)
    
    const addToCart = (product: Product, quantity: number = 1) => {
        setCart(prev => {
            const exist = prev.find(item => item.id === product.id);
            if (exist) {
                // Nếu sản phẩm đã có -> Cộng dồn số lượng
                return prev.map(item => 
                    item.id === product.id ? {...item, qty: item.qty + quantity} : item
                );
            }
            // Nếu chưa có -> Thêm mới với số lượng chỉ định
            return [...prev, { ...product, qty: quantity }];
        });
        
        // Hiển thị thông báo
        Toastify({ 
            text: `Đã thêm ${quantity} x ${product.name} vào giỏ!`, 
            style: { background: "#10B981", color: "white" }, 
            duration: 2000,
            gravity: "bottom", 
            position: "right"
        }).showToast();
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: number, change: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.qty + change;
                // Không cho phép số lượng < 1 (Nếu muốn xóa thì dùng nút xóa riêng)
                return newQty > 0 ? { ...item, qty: newQty } : item;
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('minephone_cart');
    };

    // Tính tổng tiền giỏ hàng (Computed Value)
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // 4. LOGIC AUTH (ĐĂNG NHẬP/XUẤT)
    
    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        setCompareList([]); // Xóa danh sách so sánh khi đăng xuất
        // clearCart(); // Tùy chọn: Có xóa giỏ hàng hay không? Thường thì không nên xóa.
        
        Toastify({ 
            text: "Đã đăng xuất thành công", 
            style: { background: "#6B7280" } 
        }).showToast();
        
        // Chuyển hướng về trang chủ (Force reload để reset trạng thái sạch sẽ)
        window.location.href = '/';
    };

    // 5. LOGIC COMPARE (SO SÁNH)
    
    const addToCompare = (product: Product) => {
        if (compareList.length >= 3) {
            Toastify({ 
                text: "Chỉ so sánh tối đa 3 máy!", 
                style: { background: "#EF4444" } 
            }).showToast();
            return;
        }
        
        if (!compareList.find(p => p.id === product.id)) {
            setCompareList(prev => [...prev, product]);
            Toastify({ 
                text: "Đã thêm vào so sánh", 
                style: { background: "#3B82F6" } 
            }).showToast();
        } else {
            Toastify({ 
                text: "Sản phẩm này đang được so sánh rồi", 
                style: { background: "#F59E0B" } 
            }).showToast();
        }
    };

    const removeFromCompare = (id: number) => {
        setCompareList(prev => prev.filter(p => p.id !== id));
    };

    // 6. RENDER PROVIDER
    return (
        <StoreContext.Provider value={{ 
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, 
            user, login, logout,
            compareList, addToCompare, removeFromCompare
        }}>
            {children}
        </StoreContext.Provider>
    );
};

// Custom Hook để sử dụng Context dễ dàng
export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error("useStore must be used within StoreProvider");
    }
    return context;
};