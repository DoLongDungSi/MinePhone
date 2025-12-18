// FILE: MinePhone/frontend/src/types.ts
export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  old_price?: number;
  image: string;
  
  // Các trường mới thêm cho Sprint 1 & 2
  quantity: number;
  is_active: boolean;
  
  // Thông số kỹ thuật
  ram: string;
  storage: string;
  condition: string;
  chip: string;
  screen: string;
  battery: string;
  desc?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface User {
  id: number;
  username: string;
  role: string;
}