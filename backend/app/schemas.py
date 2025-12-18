# FILE: MinePhone/backend/app/schemas.py
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

# ... (Giữ nguyên các Schema Product, User, Order cũ) ...

class ProductBase(BaseModel):
    name: str
    brand: str
    price: float
    old_price: Optional[float] = None
    image: str
    quantity: int = 10
    is_active: bool = True
    ram: str
    storage: str
    condition: str
    chip: str
    screen: str
    battery: str
    desc: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    old_price: Optional[float] = None
    image: Optional[str] = None
    quantity: Optional[int] = None
    is_active: Optional[bool] = None
    ram: Optional[str] = None
    storage: Optional[str] = None
    condition: Optional[str] = None
    chip: Optional[str] = None
    screen: Optional[str] = None
    battery: Optional[str] = None
    desc: Optional[str] = None

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LoginReq(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    role: str
    model_config = ConfigDict(from_attributes=True)

class OrderItem(BaseModel):
    id: int
    name: str
    price: float
    qty: int

class OrderCreate(BaseModel):
    user_id: int
    total: float
    items: List[OrderItem]

class ChatReq(BaseModel):
    message: str

# --- MỚI: SCHEMA REVIEW & DASHBOARD ---
class ReviewCreate(BaseModel):
    user_id: int
    product_id: int
    rating: int
    comment: str

class ReviewResponse(ReviewCreate):
    id: int
    username: str # Trả về tên người bình luận
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_revenue: float
    total_orders: int
    total_products: int
    recent_orders: List[dict]