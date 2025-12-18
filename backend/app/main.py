# FILE: MinePhone/backend/app/main.py
import os
import shutil
from typing import List, Optional
from datetime import datetime

from openai import OpenAI
from pydantic import BaseModel
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from sqlalchemy import func

# Import nội bộ
from . import models, schemas
from .database import SessionLocal, engine

# ---------------------------------------------------------
# 1. CẤU HÌNH HỆ THỐNG (CONFIG)
# ---------------------------------------------------------

# Tạo bảng trong Database nếu chưa có
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MinePhone API",
    description="Backend API cho dự án website bán điện thoại MinePhone",
    version="2.0.0"
)

# Cấu hình CORS (Cho phép Frontend gọi API)
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "*"  # Trong môi trường dev, cho phép tất cả để tránh lỗi
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tạo thư mục chứa ảnh tĩnh nếu chưa có
os.makedirs("app/static/images", exist_ok=True)
# Mount thư mục static để truy cập ảnh qua URL (ví dụ: http://localhost:5000/static/images/a.jpg)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Cấu hình mã hóa mật khẩu (Bcrypt)
# Lưu ý: Yêu cầu bcrypt==4.0.1 trong requirements.txt để tránh lỗi "password > 72 bytes"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------
# 2. CÁC HÀM TIỆN ÍCH (DEPENDENCIES & UTILS)
# ---------------------------------------------------------

# Dependency lấy Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Hàm hash mật khẩu
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Hàm kiểm tra mật khẩu
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ---------------------------------------------------------
# 3. SỰ KIỆN KHỞI ĐỘNG (STARTUP EVENT)
# ---------------------------------------------------------

@app.on_event("startup")
def startup_event():
    """
    Chạy khi server khởi động.
    Tự động tạo tài khoản Admin nếu chưa tồn tại.
    """
    db = SessionLocal()
    try:
        print("--- ĐANG KIỂM TRA DỮ LIỆU KHỞI TẠO ---")
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            print("--- CHƯA CÓ ADMIN. ĐANG TẠO USER ADMIN MẶC ĐỊNH... ---")
            admin_pwd = get_password_hash("123456")
            new_admin = models.User(
                username="admin",
                password=admin_pwd,
                role="admin"
            )
            db.add(new_admin)
            db.commit()
            print("--- ĐÃ TẠO THÀNH CÔNG: admin / 123456 ---")
        else:
            print("--- TÀI KHOẢN ADMIN ĐÃ TỒN TẠI ---")
    except Exception as e:
        print(f"--- LỖI KHỞI TẠO: {e} ---")
    finally:
        db.close()

# ---------------------------------------------------------
# 4. API AUTHENTICATION (ĐĂNG KÝ / ĐĂNG NHẬP)
# ---------------------------------------------------------

@app.post("/auth/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register(req: schemas.LoginReq, db: Session = Depends(get_db)):
    # Kiểm tra trùng username
    existing_user = db.query(models.User).filter(models.User.username == req.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Tên đăng nhập đã tồn tại, vui lòng chọn tên khác."
        )
    
    # Tạo user mới
    hashed_password = get_password_hash(req.password)
    # Logic đơn giản: Nếu username là "admin" thì cấp quyền admin (chỉ dùng cho dev/test)
    role = "admin" if req.username == "admin" else "user"
    
    new_user = models.User(
        username=req.username, 
        password=hashed_password, 
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@app.post("/auth/login")
def login(req: schemas.LoginReq, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == req.username).first()
    
    # Kiểm tra user và pass
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Sai tên đăng nhập hoặc mật khẩu"
        )
    
    # Trả về thông tin user (Trong thực tế nên trả về JWT Token)
    return {
        "message": "Đăng nhập thành công",
        "id": user.id,
        "username": user.username,
        "role": user.role
    }

# ---------------------------------------------------------
# 5. API PRODUCTS (SẢN PHẨM)
# ---------------------------------------------------------

@app.get("/products", response_model=List[schemas.Product])
def get_products(
    brand: Optional[str] = None, 
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None, # values: newest, price_asc, price_desc
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # Base query: Chỉ lấy sản phẩm đang hoạt động (chưa bị xóa mềm)
    q = db.query(models.Product).filter(models.Product.is_active == True)
    
    # 1. Lọc theo Thương hiệu
    if brand and brand != 'All':
        q = q.filter(models.Product.brand == brand)
        
    # 2. Tìm kiếm theo tên (Case insensitive)
    if search:
        q = q.filter(models.Product.name.ilike(f"%{search}%"))
        
    # 3. Lọc theo khoảng giá
    if min_price is not None:
        q = q.filter(models.Product.price >= min_price)
    if max_price is not None:
        q = q.filter(models.Product.price <= max_price)
        
    # 4. Sắp xếp
    if sort_by == 'price_asc':
        q = q.order_by(models.Product.price.asc())
    elif sort_by == 'price_desc':
        q = q.order_by(models.Product.price.desc())
    else:
        # Mặc định sắp xếp mới nhất (ID giảm dần)
        q = q.order_by(models.Product.id.desc())
        
    # 5. Phân trang
    products = q.offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}", response_model=schemas.Product)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    return product

@app.post("/products", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    # Convert Pydantic model sang Dictionary
    product_data = product.model_dump()
    db_product = models.Product(**product_data)
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product_update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm cần sửa")
    
    # Chỉ cập nhật các trường được gửi lên (loại bỏ các trường null)
    update_data = product_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db_product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm cần xóa")
    
    # Soft Delete: Đánh dấu is_active = False thay vì xóa vĩnh viễn
    db_product.is_active = False
    db.commit()
    return {"message": "Đã xóa sản phẩm thành công (Soft Delete)"}

# ---------------------------------------------------------
# 6. API UPLOAD & SEED DATA
# ---------------------------------------------------------

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        file_location = f"app/static/images/{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # Trả về URL để frontend truy cập
        url = f"http://localhost:5000/static/images/{file.filename}"
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi upload ảnh: {str(e)}")

@app.post("/seed")
def seed_data(db: Session = Depends(get_db)):
    """API tạo dữ liệu mẫu để test nhanh"""
    if db.query(models.Product).count() > 0:
        return {"message": "Dữ liệu đã tồn tại, không cần seed thêm."}
    
    sample_products = [
        models.Product(
            name="iPhone 15 Pro Max", 
            brand="Apple", 
            price=34990000, old_price=36990000,
            image="https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg",
            ram="8GB", storage="256GB", condition="New 100%", 
            chip="A17 Pro", screen="6.7 inch OLED", battery="4422 mAh",
            quantity=10, is_active=True,
            desc="iPhone 15 Pro Max thiết kế Titan siêu bền, chip A17 Pro mạnh mẽ nhất."
        ),
        models.Product(
            name="Samsung Galaxy S24 Ultra", 
            brand="Samsung", 
            price=29990000, old_price=33990000,
            image="https://cdn.tgdd.vn/Products/Images/42/307172/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg",
            ram="12GB", storage="512GB", condition="Like New", 
            chip="Snapdragon 8 Gen 3", screen="6.8 inch AMOLED", battery="5000 mAh",
            quantity=5, is_active=True,
            desc="Galaxy AI quyền năng, bút S-Pen thần thánh."
        ),
        models.Product(
            name="Xiaomi 14 Ultra", 
            brand="Xiaomi", 
            price=24990000, 
            image="https://cdn.tgdd.vn/Products/Images/42/317530/xiaomi-14-ultra-black-thumbnew-600x600.jpg",
            ram="16GB", storage="512GB", condition="99%", 
            chip="Snapdragon 8 Gen 3", screen="6.73 inch AMOLED", battery="5000 mAh",
            quantity=20, is_active=True,
            desc="Đỉnh cao nhiếp ảnh với ống kính Leica."
        )
    ]
    db.add_all(sample_products)
    db.commit()
    return {"message": "Đã tạo dữ liệu mẫu thành công!"}

# --- SETUP OPENROUTER CLIENT ---
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

SYSTEM_PROMPT = os.getenv("CHATBOT_PROMPT", "Bạn là trợ lý ảo của MinePhone.")
AI_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-exp:free")

# Schema cho chat
class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_with_ai(chat_req: ChatRequest, db: Session = Depends(get_db)):
    try:
        # 1. Lấy toàn bộ sản phẩm từ DB
        products = db.query(models.Product).all()
        
        # 2. Tạo context dữ liệu sản phẩm
        # Format: "iPhone 15 Pro (25.000.000 VND) - RAM: 8GB, Kho: 10..."
        product_context = "\n".join([
            f"- {p.name}: Giá {p.price:,.0f} VND. Cấu hình: {p.description}. RAM: {p.ram}, Bộ nhớ: {p.storage}, Màu: {p.color}. Tình trạng kho: {p.quantity} cái."
            for p in products
        ])

        # 3. Ghép prompt
        full_system_prompt = f"{SYSTEM_PROMPT}\n\nDỮ LIỆU SẢN PHẨM CỦA CỬA HÀNG:\n{product_context}"

        # 4. Gọi OpenRouter
        completion = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": full_system_prompt},
                {"role": "user", "content": chat_req.message}
            ]
        )
        
        # 5. Trả về câu trả lời
        return {"reply": completion.choices[0].message.content}

    except Exception as e:
        print(f"Lỗi AI: {e}")
        return {"reply": "Xin lỗi, hiện tại em đang bị 'đơ' một chút. Anh/chị chờ lát hỏi lại nhé!"}

# ---------------------------------------------------------
# 7. API ORDERS (ĐƠN HÀNG) - SPRINT 2
# ---------------------------------------------------------

# FILE: MinePhone/backend/app/main.py (Phần hàm create_order)

@app.post("/orders")
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # 1. Kiểm tra tồn kho
    items_json = []
    total_price = 0
    
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Sản phẩm ID {item.id} không tồn tại")
        
        if product.quantity < item.qty:
            raise HTTPException(status_code=400, detail=f"Sản phẩm '{product.name}' chỉ còn {product.quantity} chiếc.")
        
        # Trừ kho
        product.quantity -= item.qty
        
        # Tính lại tổng tiền (Backend nên tự tính để bảo mật, không tin tưởng total từ frontend gửi lên hoàn toàn)
        # Tuy nhiên để đơn giản theo Sprint 2 hiện tại, ta vẫn dùng logic cũ nhưng lưu structure đúng
        items_json.append(item.model_dump())

    # 2. Tạo đơn hàng
    new_order = models.Order(
        user_id=order.user_id,
        total=order.total,
        items=items_json,
        status="pending",
        created_at=datetime.utcnow()
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # --- FIX QUAN TRỌNG: Trả về đối tượng new_order để lấy được ID ---
    return {
        "id": new_order.id,
        "user_id": new_order.user_id,
        "total": new_order.total,
        "status": new_order.status,
        "created_at": new_order.created_at
    }

# FILE: MinePhone/backend/app/main.py (Cập nhật hàm get_orders)

@app.get("/orders")
def get_orders(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Lấy danh sách đơn hàng kèm theo tên người dùng.
    """
    # Join bảng Order với User để lấy username
    # Query trả về Tuple: (Order Object, username string)
    query = db.query(models.Order, models.User.username)\
        .join(models.User, models.Order.user_id == models.User.id)
    
    if user_id:
        query = query.filter(models.Order.user_id == user_id)
        
    # Sắp xếp mới nhất lên đầu
    results = query.order_by(models.Order.id.desc()).all()
    
    # Map dữ liệu trả về client (kết hợp Order + username)
    response = []
    for order, username in results:
        order_dict = {
            "id": order.id,
            "user_id": order.user_id,
            "username": username, # <--- Dữ liệu mới thêm
            "total": order.total,
            "status": order.status,
            "created_at": order.created_at,
            "items": order.items # Danh sách sản phẩm
        }
        response.append(order_dict)
        
    return response
@app.patch("/orders/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    """API dành cho Admin cập nhật trạng thái đơn (pending -> shipping -> completed)"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
    
    valid_statuses = ["pending", "shipping", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")
        
    order.status = status
    db.commit()
    
    return {"message": f"Đã cập nhật đơn hàng #{order_id} sang trạng thái {status}"}

# ---------------------------------------------------------
# 8. AI CHATBOT (PLACEHOLDER - SPRINT 3)
# ---------------------------------------------------------
# --- SETUP OPENROUTER CLIENT (Đảm bảo đoạn này ở trên endpoint chat) ---
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

# Lấy prompt từ docker-compose hoặc dùng mặc định
SYSTEM_PROMPT = os.getenv("CHATBOT_PROMPT", "Bạn là nhân viên tư vấn của MinePhone. Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt.")
AI_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-exp:free") # Hoặc model bạn thích

# # --- ĐÂY LÀ ENDPOINT CHÍNH THỨC (Gộp logic AI thật vào đường dẫn /ai/chat) ---
# @app.post("/ai/chat")
# def ai_chat(req: schemas.ChatReq, db: Session = Depends(get_db)):
#     try:
#         products = db.query(models.Product).filter(models.Product.is_active == True).all()
        
#         # 1. CẤP THÊM ẢNH VÀO CONTEXT (Để AI biết đường lấy link ảnh)
#         product_list_text = "\n".join([
#             f"- ID: {p.id} | Tên: {p.name} | Giá: {p.price:,.0f}đ | Ảnh: {p.image} | Kho: {p.quantity}"
#             for p in products
#         ])

#         # 2. PROMPT "MẠNH TAY": Ép dùng format @@PRODUCT|...@@
#         full_system_prompt = (
#             f"{SYSTEM_PROMPT}\n"
#             f"DỮ LIỆU SẢN PHẨM:\n{product_list_text}\n\n"
#             f"QUY TẮC TUYỆT ĐỐI (QUAN TRỌNG):\n"
#             f"1. Khi gợi ý sản phẩm, KHÔNG được chỉ viết tên. BẮT BUỘC dùng định dạng mã đặc biệt sau:\n"
#             f"   @@PRODUCT|ID|Tên_Sản_Phẩm|Giá_Tiền|Link_Ảnh@@\n"
#             f"   Ví dụ: @@PRODUCT|1|iPhone 15 Pro|25.000.000đ|https://link-anh.jpg@@\n"
#             f"2. Nếu gợi ý nhiều sản phẩm, hãy xuống dòng giữa các mã @@PRODUCT...@@.\n"
#             f"3. Không cần mô tả dài dòng, hãy để thẻ sản phẩm tự nói lên tất cả."
#         )

#         # 3. Tạo Prompt hoàn chỉnh
#         # Kỹ thuật: Đóng vai + Cung cấp dữ liệu + Yêu cầu định dạng
#         full_system_prompt = (
#             f"{SYSTEM_PROMPT}\n"
#             f"Dưới đây là danh sách sản phẩm thực tế đang có tại cửa hàng (chỉ tư vấn trong danh sách này):\n"
#             f"{product_list_text}\n\n"
#             f"LƯU Ý: Nếu khách hỏi sản phẩm không có trong danh sách, hãy gợi ý sản phẩm tương tự. Luôn trả lời ngắn dưới 3 câu."
#         )

#         # 4. Gọi AI
#         completion = client.chat.completions.create(
#             model=AI_MODEL,
#             messages=[
#                 {"role": "system", "content": full_system_prompt},
#                 {"role": "user", "content": req.message}
#             ]
#         )
        
#         reply_content = completion.choices[0].message.content
#         return {"reply": reply_content}

#     except Exception as e:
#         print(f"Lỗi AI: {e}")
#         return {"reply": "Hệ thống đang bảo trì một chút ạ."}

#     except Exception as e:
#         print(f"Lỗi AI: {e}")
#         # Trả về câu fallback để UI không bị đơ
#         return {"reply": "Xin lỗi, server AI đang quá tải. Anh/chị hỏi lại sau giây lát nhé!"}

# FILE: MinePhone/backend/app/main.py

# FILE: MinePhone/backend/app/main.py

@app.post("/ai/chat")
def ai_chat(req: schemas.ChatReq, db: Session = Depends(get_db)):
    try:
        # Lấy dữ liệu sản phẩm làm kiến thức nền
        products = db.query(models.Product).filter(models.Product.is_active == True).all()
        
        # Tạo chuỗi thông tin chi tiết hơn để AI chém gió
        product_info = "\n".join([
            f"ID:{p.id}|Tên:{p.name}|Giá:{p.price:,.0f}đ|Thông số:{p.ram}/{p.storage}, Chip {p.chip}, Pin {p.battery}, Màn {p.screen}, Tình trạng {p.condition}|Mô tả:{p.desc}|Ảnh:{p.image}"
            for p in products
        ])

        # SYSTEM PROMPT MỚI: LINH HOẠT HƠN
        system_instruction = (
            "Bạn là trợ lý ảo bán hàng của MinePhone. Bạn rất thân thiện và am hiểu công nghệ.\n"
            f"DỮ LIỆU KHO HÀNG:\n{product_info}\n\n"
            "QUY TẮC TRẢ LỜI QUAN TRỌNG:\n"
            "1. KHI CẦN GIỚI THIỆU/GỢI Ý SẢN PHẨM: Bắt buộc kèm theo mã hiển thị thẻ sản phẩm ở cuối câu trả lời:\n"
            "   Cú pháp: @@PRODUCT|ID|Tên|Giá|Link_Ảnh@@\n"
            "   (Mỗi sản phẩm 1 dòng mã riêng biệt).\n"
            "2. KHI KHÁCH HỎI CHI TIẾT (Ví dụ: 'Nó có gì hay?', 'Cấu hình sao?'):\n"
            "   - Hãy trả lời bằng văn bản bình thường, phân tích kỹ dựa trên thông số trong Kho dữ liệu.\n"
            "   - KHÔNG dùng mã @@PRODUCT@@ trong trường hợp này trừ khi muốn gợi ý lại.\n"
            "3. LUÔN xưng 'em' và gọi khách là 'anh/chị'.\n"
            "4. KHÔNG trả về JSON raw (như {'message':...}). Chỉ trả về text hoặc mã @@PRODUCT@@."
        )

        # Gọi AI (OpenRouter)
        completion = client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": req.message} # Frontend đã gửi cả history trong message này
            ]
        )
        
        reply_content = completion.choices[0].message.content
        return {"reply": reply_content}

    except Exception as e:
        print(f"Lỗi AI: {e}")
        return {"reply": "Dạ hiện tại em đang bị quá tải, anh/chị chờ em chút xíu nhé!"}

# --- API REVIEWS (MỚI) ---
@app.get("/products/{product_id}/reviews", response_model=List[schemas.ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    # Join bảng Review với User để lấy username
    results = db.query(models.Review, models.User.username)\
        .join(models.User, models.Review.user_id == models.User.id)\
        .filter(models.Review.product_id == product_id)\
        .order_by(models.Review.created_at.desc()).all()
    
    response = []
    for review, username in results:
        # Convert sang schema response
        r = schemas.ReviewResponse(
            id=review.id,
            user_id=review.user_id,
            product_id=review.product_id,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            username=username
        )
        response.append(r)
    return response

@app.post("/reviews", response_model=schemas.ReviewResponse)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    new_review = models.Review(
        user_id=review.user_id,
        product_id=review.product_id,
        rating=review.rating,
        comment=review.comment,
        created_at=datetime.utcnow()
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Lấy username để trả về
    user = db.query(models.User).filter(models.User.id == review.user_id).first()
    
    return schemas.ReviewResponse(
        id=new_review.id,
        user_id=new_review.user_id,
        product_id=new_review.product_id,
        rating=new_review.rating,
        comment=new_review.comment,
        created_at=new_review.created_at,
        username=user.username if user else "Unknown"
    )

# --- API DASHBOARD (MỚI) ---
@app.get("/admin/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Tổng doanh thu (chỉ tính đơn completed)
    total_revenue = db.query(func.sum(models.Order.total))\
        .filter(models.Order.status == "completed").scalar() or 0
        
    # 2. Tổng số đơn hàng
    total_orders = db.query(models.Order).count()
    
    # 3. Tổng sản phẩm tồn kho
    total_products = db.query(func.sum(models.Product.quantity)).scalar() or 0
    
    # 4. 5 đơn hàng mới nhất
    recent_orders_query = db.query(models.Order, models.User.username)\
        .join(models.User, models.Order.user_id == models.User.id)\
        .order_by(models.Order.id.desc()).limit(5).all()
        
    recent_orders = [
        {
            "id": o.id, 
            "username": u, 
            "total": o.total, 
            "status": o.status,
            "created_at": o.created_at
        } 
        for o, u in recent_orders_query
    ]
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_products": total_products,
        "recent_orders": recent_orders
    }