# FILE: MinePhone/backend/app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base # Updated import cho bản mới

# Sửa đường dẫn để trỏ vào thư mục data (nơi được mount volume)
# Nếu folder data chưa có thì code sẽ lỗi, nên docker-compose đã lo việc mount này
SQLALCHEMY_DATABASE_URL = "sqlite:///./data/minephone.db"

# check_same_thread=False cần thiết cho SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()