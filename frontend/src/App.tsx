// FILE: MinePhone/frontend/src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Import Layouts chuẩn
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Import Pages Client
import HomePage from './pages/client/HomePage';
import ProductDetailPage from './pages/client/ProductDetailPage';
import CartPage from './pages/client/CartPage';
import NotFound from './pages/NotFound';
import OrderHistoryPage from './pages/client/OrderHistoryPage';
// Import Pages Admin
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';

// Component cuộn lên đầu trang khi chuyển trang
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* --- ROUTES KHÁCH HÀNG (Dùng ClientLayout) --- */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
        </Route>

        {/* --- ROUTES ADMIN (Dùng AdminLayout) --- */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="settings" element={<div className="p-6 font-bold">Chức năng đang phát triển</div>} />
        </Route>

        {/* --- 404 NOT FOUND --- */}
        <Route path="*" element={<NotFound />} />
        <Route path="history" element={<OrderHistoryPage />} /> {/* Route mới */}
      </Routes>
    </>
  );
}

export default App;