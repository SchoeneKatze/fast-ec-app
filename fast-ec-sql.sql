-- 1. 币种汇率表
CREATE TABLE currencies (
    currency_code VARCHAR(3) PRIMARY KEY,
    currency_symbol VARCHAR(5) NOT NULL,
    exchange_rate DECIMAL(12, 4) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

-- 2. 用户表
CREATE TABLE users (
    internal_id INT AUTO_INCREMENT PRIMARY KEY,
    logto_id VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- 预留位
    email VARCHAR(100),
    phone_no VARCHAR(20),
    nickname VARCHAR(100),
    gender ENUM('male', 'female', 'other', 'secret') DEFAULT 'secret',
    birthday DATE,
    default_currency VARCHAR(3) DEFAULT 'USD',
    role ENUM('customer', 'VIP', 'staff', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    last_login DATETIME,
    isActive BOOLEAN DEFAULT TRUE
);

-- 3. 分类表
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT,
    image_url VARCHAR(255),
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- 4. 商品主表
CREATE TABLE products (
    product_id VARCHAR(50) PRIMARY KEY,
    category_id INT,
    brand_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(12, 2) NOT NULL,
    tax_class ENUM('Standard', 'Reduced', 'Zero') DEFAULT 'Standard',
    stock_quantity INT DEFAULT 0,
    sku_internal_code VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    origin_country VARCHAR(50),
    weight FLOAT,
    dimensions VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 5. 税率配置表
CREATE TABLE tax_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL,
    tax_class ENUM('Standard', 'Reduced', 'Zero'),
    rate DECIMAL(5, 4) NOT NULL,
    is_show_inclusive BOOLEAN DEFAULT TRUE,
    UNIQUE KEY (country_code, tax_class)
);

-- 6. 购物车表
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(internal_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 7. 商品图片表
CREATE TABLE product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50),
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 8. 评论表
CREATE TABLE product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(50),
    user_id INT,
    rating TINYINT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (user_id) REFERENCES users(internal_id)
);

-- 9. 收货地址表
CREATE TABLE shipping_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    recipient_name VARCHAR(100),
    phone VARCHAR(20),
    country_code VARCHAR(2), -- 此处逻辑上对应税率表，但不做硬外键
    state VARCHAR(100),
    city VARCHAR(100),
    address_line TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(internal_id)
);

GRANT ALL PRIVILEGES ON fastec.* TO 'fast-ec-admin'@'%';
FLUSH PRIVILEGES;


