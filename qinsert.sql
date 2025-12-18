-- Thêm 7 sản phẩm mới vào bảng products
-- Lưu ý: Cột "desc" phải để trong ngoặc kép vì trùng từ khóa của SQL

INSERT INTO products (name, brand, price, old_price, image, quantity, is_active, ram, storage, condition, chip, screen, battery, "desc", created_at, updated_at) 
VALUES 
-- 1. Samsung Galaxy A55 5G (Tầm trung bán chạy)
(
    'Samsung Galaxy A55 5G', 
    'Samsung', 
    9990000, 
    11490000, 
    'https://cdn.tgdd.vn/Products/Images/42/322623/samsung-galaxy-a55-5g-xanh-thumb-600x600.jpg', 
    25, 
    1, 
    '8GB', 
    '128GB', 
    'New 100%', 
    'Exynos 1480', 
    '6.6 inch Super AMOLED', 
    '5000 mAh', 
    'Thiết kế khung kim loại sang trọng, camera chụp đêm ấn tượng và hiệu năng mượt mà cho mọi tác vụ.', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),

-- 2. iPhone 13 (Flagship cũ giá tốt)
(
    'iPhone 13', 
    'Apple', 
    13990000, 
    18990000, 
    'https://cdn.tgdd.vn/Products/Images/42/251192/iphone-13-pink-thumb-600x600.jpg', 
    15, 
    1, 
    '4GB', 
    '128GB', 
    'Like New', 
    'Apple A15 Bionic', 
    '6.1 inch OLED', 
    '3240 mAh', 
    'Hiệu năng vẫn cực mạnh với chip A15, quay phim điện ảnh, pin trâu hơn thế hệ trước.', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),

-- 3. Xiaomi Redmi Note 13 Pro (Vua tầm trung giá rẻ)
(
    'Xiaomi Redmi Note 13 Pro', 
    'Xiaomi', 
    6490000, 
    7290000, 
    'https://cdn.tgdd.vn/Products/Images/42/309831/xiaomi-redmi-note-13-pro-black-thumb-600x600.jpg', 
    40, 
    1, 
    '8GB', 
    '256GB', 
    'New 100%', 
    'Helio G99-Ultra', 
    '6.67 inch AMOLED 120Hz', 
    '5000 mAh', 
    'Camera 200MP đột phá trong tầm giá, màn hình viền siêu mỏng và sạc nhanh 67W.', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),

-- 4. Oppo Reno11 F 5G (Thiết kế đẹp)
(
    'Oppo Reno11 F 5G', 
    'Oppo', 
    8990000, 
    NULL, 
    'https://cdn.tgdd.vn/Products/Images/42/321586/oppo-reno11-f-purple-thumb-600x600.jpg', 
    20, 
    1, 
    '8GB', 
    '256GB', 
    'New 100%', 
    'Dimensity 7050', 
    '6.7 inch AMOLED', 
    '5000 mAh', 
    'Chuyên gia chân dung, thiết kế mặt lưng vân đá độc đáo, kháng nước IP65.', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),

-- 5. Samsung Galaxy Z Flip5 (Màn hình gập sành điệu)
(
    'Samsung Galaxy Z Flip5', 
    'Samsung', 
    16990000, 
    25990000, 
    'https://cdn.tgdd.vn/Products/Images/42/303565/samsung-galaxy-z-flip5-mint-thumb-600x600.jpg', 
    8, 
    1, 
    '8GB', 
    '256GB', 
    '99%', 
    'Snapdragon 8 Gen 2', 
    '6.7 inch (Chính) / 3.4 inch (Phụ)', 
    '3700 mAh', 
    'Màn hình phụ Flex Window đa năng, gập không khe hở, nhỏ gọn trong lòng bàn tay.', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),

-- 6. iPhone 11 (Giá rẻ cho iFan)
(
    'iPhone 11', 
    'Apple', 
    8490000, 
    11990000, 
    'https://cdn.tgdd.vn/Products/Images/42/153856/iphone-11-trang-600x600.jpg', 
    30, 
    1, 
    '4GB', 
    '64GB', 
    '99%', 
    'Apple A13 Bionic', 
    '6.1 inch IPS LCD', 
    '3110 mAh', 
    'Huyền thoại giá rẻ của Apple, vẫn mượt mà cho nhu cầu cơ bản, chụp đêm tốt.', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),

-- 7. Xiaomi 13T (Cận cao cấp Leica)
(
    'Xiaomi 13T 5G', 
    'Xiaomi', 
    10990000, 
    12990000, 
    'https://cdn.tgdd.vn/Products/Images/42/307246/xiaomi-13t-xanh-duong-thumb-600x600.jpg', 
    12, 
    1, 
    '12GB', 
    '256GB', 
    'Like New', 
    'Dimensity 8200-Ultra', 
    '6.67 inch CrystalRes AMOLED', 
    '5000 mAh', 
    'Hệ thống camera Leica chuyên nghiệp, màn hình 144Hz siêu mượt, chống nước IP68.', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
);  