-- WATCH STORE DATABASE SCHEMA

-- Quản lý vai trò và quyền hạn
CREATE TABLE Role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Permission (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RolePermission (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES Role(id),
    permission_id INTEGER REFERENCES Permission(id),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Quản lý người dùng và nhân viên
CREATE TABLE UserAccount (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role_id INTEGER REFERENCES Role(id),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Employee (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES UserAccount(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    employee_code VARCHAR(50) UNIQUE,
    position VARCHAR(100),
    hire_date DATE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quản lý cửa hàng
CREATE TABLE Store (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    store_code VARCHAR(50) UNIQUE NOT NULL,
    manager_id INTEGER REFERENCES Employee(id),
    opening_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

-- Quản lý khách hàng
CREATE TABLE Customer (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    birth_date DATE,
    gender VARCHAR(10),
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

-- Quản lý danh mục và sản phẩm
CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES Category(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

CREATE TABLE Brand (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

CREATE TABLE Product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES Category(id),
    brand_id INTEGER REFERENCES Brand(id),
    base_price DECIMAL(10,2) NOT NULL,
    warranty_period INTEGER, -- số tháng bảo hành
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

-- Bảng thuộc tính sản phẩm
CREATE TABLE AttributeType (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AttributeValue (
    id SERIAL PRIMARY KEY,
    attribute_type_id INTEGER REFERENCES AttributeType(id),
    value VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ProductVariant (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES Product(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    price_adjustment DECIMAL(10,2) DEFAULT 0, -- điều chỉnh giá so với base_price
    stock_alert_threshold INTEGER DEFAULT 5,
    barcode VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

CREATE TABLE ProductVariantAttribute (
    id SERIAL PRIMARY KEY,
    product_variant_id INTEGER REFERENCES ProductVariant(id),
    attribute_value_id INTEGER REFERENCES AttributeValue(id),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_variant_id, attribute_value_id)
);

-- Quản lý kho
CREATE TABLE Inventory (
    id SERIAL PRIMARY KEY,
    product_variant_id INTEGER REFERENCES ProductVariant(id),
    store_id INTEGER REFERENCES Store(id),
    quantity INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_variant_id, store_id)
);

CREATE TABLE InventoryTransaction (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES Inventory(id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2), -- giá nhập hoặc giá xuất
    reference_id INTEGER, -- ID của đơn hàng hoặc phiếu nhập
    reference_type VARCHAR(50), -- 'ORDER', 'PURCHASE', 'ADJUSTMENT'
    note TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

CREATE TABLE Supplier (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

CREATE TABLE PurchaseOrder (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES Supplier(id),
    store_id INTEGER REFERENCES Store(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    total_amount DECIMAL(10,2),
    note TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

CREATE TABLE PurchaseOrderDetail (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER REFERENCES PurchaseOrder(id),
    product_variant_id INTEGER REFERENCES ProductVariant(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quản lý đơn hàng
CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES Customer(id),
    store_id INTEGER REFERENCES Store(id),
    employee_id INTEGER REFERENCES Employee(id), -- nhân viên bán hàng
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    payment_method VARCHAR(50),
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    note TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

CREATE TABLE OrderDetail (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES Orders(id),
    product_variant_id INTEGER REFERENCES ProductVariant(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quản lý bảo hành
CREATE TABLE Warranty (
    id SERIAL PRIMARY KEY,
    order_detail_id INTEGER REFERENCES OrderDetail(id),
    warranty_start_date DATE NOT NULL,
    warranty_end_date DATE NOT NULL,
    serial_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CLAIMED')),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

CREATE TABLE WarrantyClaim (
    id SERIAL PRIMARY KEY,
    warranty_id INTEGER REFERENCES Warranty(id),
    claim_date DATE NOT NULL,
    description TEXT NOT NULL,
    resolution TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED')),
    completed_date DATE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES UserAccount(id),
    updated_by INTEGER REFERENCES UserAccount(id)
);

-- Theo dõi các thay đổi trong cơ sở dữ liệu
CREATE TABLE AuditLog (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES UserAccount(id),
    action_type VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng ảo (Views) cho thống kê doanh thu

-- View cho doanh thu theo ngày của từng cửa hàng
CREATE VIEW DailyRevenue AS
SELECT 
    store_id,
    DATE(order_date) as sale_date,
    COUNT(id) as total_orders,
    SUM(total_amount) as total_revenue
From Orders
WHERE is_deleted = FALSE AND status = 'COMPLETED'
GROUP BY store_id, DATE(order_date);

-- View cho doanh thu theo tháng của từng cửa hàng
CREATE VIEW MonthlyRevenue AS
SELECT 
    store_id,
    DATE_TRUNC('month', order_date) as month,
    COUNT(id) as total_orders,
    SUM(total_amount) as total_revenue
FROM Orders
WHERE is_deleted = FALSE AND status = 'COMPLETED'
GROUP BY store_id, DATE_TRUNC('month', order_date);

-- View cho doanh thu theo tháng của toàn bộ chuỗi cửa hàng
CREATE VIEW ChainMonthlyRevenue AS
SELECT 
    DATE_TRUNC('month', order_date) as month,
    COUNT(id) as total_orders,
    SUM(total_amount) as total_revenue
FROM Orders
WHERE is_deleted = FALSE AND status = 'COMPLETED'
GROUP BY DATE_TRUNC('month', order_date);

-- Triggers để cập nhật thời gian sửa đổi
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ví dụ cho một bảng (cần áp dụng tương tự cho tất cả các bảng)
CREATE TRIGGER update_product_timestamp
BEFORE UPDATE ON Product
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger cho audit log
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO AuditLog (user_id, action_type, table_name, record_id, old_values, new_values)
    VALUES (
        current_setting('app.current_user_id', true)::integer,
        TG_OP,
        TG_TABLE_NAME,
        CASE TG_OP
            WHEN 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' 
            THEN to_jsonb(OLD) 
            ELSE NULL 
        END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' 
            THEN to_jsonb(NEW) 
            ELSE NULL 
        END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Ví dụ tạo trigger audit log cho một bảng (cần áp dụng tương tự cho các bảng quan trọng)
CREATE TRIGGER product_audit_log
AFTER INSERT OR UPDATE OR DELETE ON Product
FOR EACH ROW
EXECUTE FUNCTION audit_log_changes();

-- Procedure để tính tồn kho theo thời gian
CREATE OR REPLACE FUNCTION get_inventory_history(
    p_product_variant_id INTEGER, 
    p_store_id INTEGER,
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
)
RETURNS TABLE (
    transaction_date TIMESTAMP,
    quantity_change INTEGER,
    running_balance INTEGER
) AS $$
DECLARE
    v_initial_stock INTEGER;
BEGIN
    -- Lấy số lượng tồn kho trước ngày bắt đầu
    SELECT COALESCE(SUM(CASE 
        WHEN transaction_type = 'STOCK_IN' THEN quantity
        WHEN transaction_type = 'STOCK_OUT' THEN -quantity
        WHEN transaction_type = 'ADJUSTMENT' THEN quantity
    END), 0) INTO v_initial_stock
    FROM InventoryTransaction it
    JOIN Inventory i ON it.inventory_id = i.id
    WHERE i.product_variant_id = p_product_variant_id
      AND i.store_id = p_store_id
      AND it.transaction_date < p_start_date
      AND it.is_deleted = FALSE;

    RETURN QUERY
    WITH transactions AS (
        SELECT 
            it.transaction_date,
            CASE 
                WHEN transaction_type = 'STOCK_IN' THEN quantity
                WHEN transaction_type = 'STOCK_OUT' THEN -quantity
                WHEN transaction_type = 'ADJUSTMENT' THEN quantity
            END as quantity_change
        FROM InventoryTransaction it
        JOIN Inventory i ON it.inventory_id = i.id
        WHERE i.product_variant_id = p_product_variant_id
          AND i.store_id = p_store_id
          AND it.transaction_date BETWEEN p_start_date AND p_end_date
          AND it.is_deleted = FALSE
        ORDER BY it.transaction_date
    )
    SELECT 
        t.transaction_date,
        t.quantity_change,
        v_initial_stock + SUM(t.quantity_change) OVER (ORDER BY t.transaction_date) as running_balance
    FROM transactions t;
END;
$$ LANGUAGE plpgsql;