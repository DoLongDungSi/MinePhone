# FILE: MinePhone/backend/app/models.py
from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    # ... (Các cột cũ giữ nguyên) ...
    name = Column(String, index=True)
    brand = Column(String, index=True)
    price = Column(Float)
    old_price = Column(Float, nullable=True)
    image = Column(String)
    quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ram = Column(String)
    storage = Column(String)
    condition = Column(String)
    chip = Column(String)
    screen = Column(String)
    battery = Column(String)
    desc = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="customer")
    orders = relationship("Order", back_populates="user")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total = Column(Float)
    items = Column(JSON)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="orders")

# --- MỚI: BẢNG REVIEW ---
class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    rating = Column(Integer) # 1 đến 5 sao
    comment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship để lấy tên người dùng
    user = relationship("User")