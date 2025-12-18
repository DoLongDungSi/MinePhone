// FILE: MinePhone/frontend/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- THÊM
import './index.css'
import App from './App.tsx'
import { StoreProvider } from './context/StoreContext'
import "toastify-js/src/toastify.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* Bao bọc toàn bộ ứng dụng */}
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)