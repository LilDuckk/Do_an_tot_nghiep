-- Bảng Danh mục sản phẩm (ProductCategories)
CREATE TABLE ProductCategories (
    CategoryID INT PRIMARY KEY,
    CategoryName VARCHAR(255),
    CategoryDescription TEXT,
    ParentCategoryID INT,
    ImageURL VARCHAR(255),
    IsActive BOOLEAN DEFAULT TRUE,
    DisplayOrder INT DEFAULT 0,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Hãng (Brands)
CREATE TABLE Brands (
    BrandID INT PRIMARY KEY,
    BrandName VARCHAR(255),
    BrandDescription TEXT,
    LogoURL VARCHAR(255),
    IsActive BOOLEAN DEFAULT TRUE,
    DisplayOrder INT DEFAULT 0,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Sản phẩm (Products)
CREATE TABLE Products (
    ProductID INT PRIMARY KEY,
    ProductName VARCHAR(255),
    ProductDescription TEXT,
    CategoryID INT,
    BrandID INT,
    BasePrice DECIMAL(10, 2),
    FOREIGN KEY (CategoryID) REFERENCES ProductCategories(CategoryID),
    FOREIGN KEY (BrandID) REFERENCES Brands(BrandID),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Thuộc tính (Attributes)
CREATE TABLE Attributes (
    AttributeID INT PRIMARY KEY,
    AttributeName VARCHAR(255),
    AttributeDescription TEXT
);

-- Bảng Thuộc tính của danh mục (CategoryAttributes)
CREATE TABLE CategoryAttributes (
    CategoryID INT,
    AttributeID INT,
    IsRequired BOOLEAN,
    AffectsPrice BOOLEAN,
    DisplayOrder INT,
    PRIMARY KEY (CategoryID, AttributeID),
    FOREIGN KEY (CategoryID) REFERENCES ProductCategories(CategoryID),
    FOREIGN KEY (AttributeID) REFERENCES Attributes(AttributeID)
);

-- Bảng Giá trị thuộc tính (AttributeValues)
CREATE TABLE AttributeValues (
    AttributeValueID INT PRIMARY KEY,
    AttributeID INT,
    Value VARCHAR(255),
    FOREIGN KEY (AttributeID) REFERENCES Attributes(AttributeID)
);

-- Bảng Biến thể sản phẩm (ProductVariants)
CREATE TABLE ProductVariants (
    VariantID INT PRIMARY KEY,
    ProductID INT,
    SKUCode VARCHAR(255),
    PriceAdjustment DECIMAL(10, 2),
    Stock INT,
    IsActive BOOLEAN,
    Barcode VARCHAR(50),
    Weight DECIMAL(10, 2),
    Dimensions VARCHAR(50),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Thuộc tính của biến thể sản phẩm (ProductVariantAttributes)
CREATE TABLE ProductVariantAttributes (
    VariantID INT,
    AttributeValueID INT,
    PRIMARY KEY (VariantID, AttributeValueID),
    FOREIGN KEY (VariantID) REFERENCES ProductVariants(VariantID),
    FOREIGN KEY (AttributeValueID) REFERENCES AttributeValues(AttributeValueID)
);


-- Bảng Cơ sở (Stores)
CREATE TABLE Stores (
    StoreID INT PRIMARY KEY,
    StoreName VARCHAR(255),
    StoreAddress VARCHAR(255),
    StorePhone VARCHAR(15),
    StoreManagerID INT,
    StoreCode VARCHAR(50) UNIQUE,
    StoreType VARCHAR(50),
    IsActive BOOLEAN DEFAULT TRUE,
    OpeningDate DATE,
    ClosingDate DATE,
    FOREIGN KEY (StoreManagerID) REFERENCES Employees(EmployeeID),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Nhân viên (Employees)
CREATE TABLE Employees (
    EmployeeID INT PRIMARY KEY,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Email VARCHAR(100),
    Phone VARCHAR(15),
    Role VARCHAR(50),
    HireDate DATE,
    EmployeeCode VARCHAR(50) UNIQUE,
    Position VARCHAR(100),
    Department VARCHAR(100),
    Salary DECIMAL(10, 2),
    IsActive BOOLEAN DEFAULT TRUE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Lịch sử nhập kho (StockIn)
CREATE TABLE StockIn (
    StockInID INT PRIMARY KEY,
    StoreID INT,
    ProductID INT,
    Quantity INT,
    CostPrice DECIMAL(10, 2),
    StockInDate DATE,
    SupplierName VARCHAR(255),
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- Bảng Lịch sử xuất kho (StockOut)
CREATE TABLE StockOut (
    StockOutID INT PRIMARY KEY,
    StoreID INT,
    ProductID INT,
    Quantity INT,
    SalePrice DECIMAL(10, 2),
    StockOutDate DATE,
    EmployeeID INT,
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
);

-- Bảng Doanh thu (Revenue)
CREATE TABLE Revenue (
    RevenueID INT PRIMARY KEY,
    StoreID INT,
    RevenueAmount DECIMAL(10, 2),
    RevenueDate DATE,
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID)
);

-- Bảng Ca làm việc (Shifts)
CREATE TABLE Shifts (
    ShiftID INT PRIMARY KEY,
    EmployeeID INT,
    StoreID INT,
    ShiftStartTime DATETIME,
    ShiftEndTime DATETIME,
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID),
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID)
);

-- Bảng Lịch sử giao dịch (Transactions)
CREATE TABLE Transactions (
    TransactionID INT PRIMARY KEY,
    StoreID INT,
    ProductID INT,
    Quantity INT,
    TotalPrice DECIMAL(10, 2),
    TransactionDate DATETIME,
    EmployeeID INT,
    PaymentMethod VARCHAR(50),
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
);

-- Bảng Quản lý tồn kho (Inventory)
CREATE TABLE Inventory (
    InventoryID INT PRIMARY KEY,
    StoreID INT,
    ProductID INT,
    QuantityInStock INT,
    MinimumStock INT,
    MaximumStock INT,
    LastRestockedDate DATETIME,
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- Bảng Mối quan hệ giữa các cơ sở và nhân viên (StoreEmployeeAssignments)
CREATE TABLE StoreEmployeeAssignments (
    StoreID INT,
    EmployeeID INT,
    AssignmentDate DATE,
    PRIMARY KEY (StoreID, EmployeeID),
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
);

-- Bảng Khuyến mãi (Promotions)
CREATE TABLE Promotions (
    PromotionID INT PRIMARY KEY,
    ProductID INT,
    DiscountPercentage DECIMAL(5, 2),
    StartDate DATE,
    EndDate DATE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Bảng thống kê doanh thu theo ngày (DailyRevenueStats)
CREATE TABLE DailyRevenueStats (
    StatID INT PRIMARY KEY,
    StoreID INT,
    RevenueAmount DECIMAL(10, 2),
    StatDate DATE,
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID)
);

-- Bảng Quyền truy cập của nhân viên (EmployeePermissions)
CREATE TABLE EmployeePermissions (
    EmployeeID INT,
    PermissionType VARCHAR(50),
    PRIMARY KEY (EmployeeID, PermissionType),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
);

-- Bảng Vai trò (Roles)
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY,
    RoleName VARCHAR(50),
    Description TEXT
);

-- Bảng Tài khoản người dùng (Users)
CREATE TABLE Users (
    UserID INT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE,
    Password VARCHAR(255),
    Email VARCHAR(100),
    RoleID INT,
    IsActive BOOLEAN DEFAULT TRUE,
    LastLogin DATETIME,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

-- Bảng Thông tin chi tiết người dùng (UserProfiles)
CREATE TABLE UserProfiles (
    UserID INT PRIMARY KEY,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Phone VARCHAR(15),
    Address TEXT,
    Avatar VARCHAR(255),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Bảng Phân quyền (Permissions)
CREATE TABLE Permissions (
    PermissionID INT PRIMARY KEY,
    PermissionName VARCHAR(50),
    Description TEXT
);

-- Bảng Phân quyền theo vai trò (RolePermissions)
CREATE TABLE RolePermissions (
    RoleID INT,
    PermissionID INT,
    PRIMARY KEY (RoleID, PermissionID),
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID),
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID)
);

-- Bảng Lịch sử hoạt động (ActivityLogs)
CREATE TABLE ActivityLogs (
    LogID INT PRIMARY KEY,
    UserID INT,
    Action VARCHAR(255),
    Description TEXT,
    IPAddress VARCHAR(45),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Cập nhật bảng Employees để liên kết với Users
ALTER TABLE Employees ADD COLUMN UserID INT;
ALTER TABLE Employees ADD FOREIGN KEY (UserID) REFERENCES Users(UserID);

-- Cập nhật bảng Stores để liên kết với Users (Store Manager)
ALTER TABLE Stores ADD COLUMN ManagerUserID INT;
ALTER TABLE Stores ADD FOREIGN KEY (ManagerUserID) REFERENCES Users(UserID);

-- Bảng Đơn hàng (Orders)
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY,
    StoreID INT,
    OrderDate DATETIME,
    TotalAmount DECIMAL(10, 2),
    Status VARCHAR(50),
    PaymentMethod VARCHAR(50),
    CustomerName VARCHAR(100),
    CustomerPhone VARCHAR(15),
    CustomerAddress TEXT,
    OrderType VARCHAR(20),
    ShippingAddress TEXT,
    ShippingFee DECIMAL(10, 2),
    DiscountAmount DECIMAL(10, 2),
    FinalAmount DECIMAL(10, 2),
    CustomerID INT,
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Chi tiết đơn hàng (OrderDetails)
CREATE TABLE OrderDetails (
    OrderID INT,
    ProductVariantID INT,
    Quantity INT,
    UnitPrice DECIMAL(10, 2),
    PRIMARY KEY (OrderID, ProductVariantID),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductVariantID) REFERENCES ProductVariants(VariantID)
);

-- Bảng Bảo hành (Warranty)
CREATE TABLE Warranty (
    WarrantyID INT PRIMARY KEY,
    OrderID INT,
    ProductID INT,
    WarrantyStartDate DATE,
    WarrantyEndDate DATE,
    WarrantyStatus VARCHAR(50),
    CustomerName VARCHAR(100),
    CustomerPhone VARCHAR(15),
    WarrantyNote TEXT,
    CustomerID INT,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Đánh giá sản phẩm (Reviews)
CREATE TABLE Reviews (
    ReviewID INT PRIMARY KEY,
    ProductID INT,
    Rating INT,
    Comment TEXT,
    ReviewDate DATETIME,
    CustomerName VARCHAR(100),
    CustomerPhone VARCHAR(15),
    CustomerID INT,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Thông tin liên hệ (ContactInfo)
CREATE TABLE ContactInfo (
    ContactID INT PRIMARY KEY,
    StoreID INT,
    Email VARCHAR(100),
    Phone VARCHAR(15),
    Address TEXT,
    WorkingHours TEXT,
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID)
);

-- Bảng Tin tức/Sự kiện (News)
CREATE TABLE News (
    NewsID INT PRIMARY KEY,
    Title VARCHAR(255),
    Content TEXT,
    PublishDate DATETIME,
    ImageURL VARCHAR(255),
    IsActive BOOLEAN,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Banner quảng cáo (Banners)
CREATE TABLE Banners (
    BannerID INT PRIMARY KEY,
    Title VARCHAR(255),
    ImageURL VARCHAR(255),
    LinkURL VARCHAR(255),
    StartDate DATE,
    EndDate DATE,
    IsActive BOOLEAN,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Cấu hình website (Settings)
CREATE TABLE Settings (
    SettingID INT PRIMARY KEY,
    SettingKey VARCHAR(50),
    SettingValue TEXT,
    Description TEXT,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Khách hàng (Customers)
CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Email VARCHAR(100),
    Phone VARCHAR(15),
    Address TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastPurchaseDate DATETIME,
    TotalPurchases INT DEFAULT 0,
    TotalSpent DECIMAL(10, 2) DEFAULT 0,
    Notes TEXT,
    CustomerType VARCHAR(20),
    BirthDate DATE,
    Gender VARCHAR(10),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Cập nhật bảng Orders để liên kết với Customers
ALTER TABLE Orders ADD COLUMN CustomerID INT;
ALTER TABLE Orders ADD FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID);

-- Cập nhật bảng Warranty để liên kết với Customers
ALTER TABLE Warranty ADD COLUMN CustomerID INT;
ALTER TABLE Warranty ADD FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID);

-- Cập nhật bảng Reviews để liên kết với Customers
ALTER TABLE Reviews ADD COLUMN CustomerID INT;
ALTER TABLE Reviews ADD FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID);

-- Thêm các index cho tối ưu hiệu suất
CREATE INDEX idx_customers_phone ON Customers(Phone);
CREATE INDEX idx_customers_email ON Customers(Email);
CREATE INDEX idx_orders_date ON Orders(OrderDate);
CREATE INDEX idx_products_category ON Products(CategoryID);
CREATE INDEX idx_inventory_store ON Inventory(StoreID);

-- Bảng Shipment
CREATE TABLE Shipments (
    ShipmentID INT PRIMARY KEY,
    OrderID INT,
    ShippingMethod VARCHAR(50),
    TrackingNumber VARCHAR(100),
    Status VARCHAR(50),
    EstimatedDeliveryDate DATE,
    ActualDeliveryDate DATE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng ProductImages
CREATE TABLE ProductImages (
    ImageID INT PRIMARY KEY,
    ProductID INT,
    ImageURL VARCHAR(255),
    IsMain BOOLEAN DEFAULT FALSE,
    DisplayOrder INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng ProductSpecifications
CREATE TABLE ProductSpecifications (
    SpecificationID INT PRIMARY KEY,
    ProductID INT,
    SpecificationName VARCHAR(100),
    SpecificationValue TEXT,
    DisplayOrder INT DEFAULT 0,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng ProductReviews
CREATE TABLE ProductReviews (
    ReviewID INT PRIMARY KEY,
    ProductID INT,
    CustomerID INT,
    Rating INT CHECK (Rating >= 1 AND Rating <= 5),
    Comment TEXT,
    ReviewDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsApproved BOOLEAN DEFAULT FALSE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng ProductWishlist
CREATE TABLE ProductWishlist (
    WishlistID INT PRIMARY KEY,
    CustomerID INT,
    ProductID INT,
    AddedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Thêm ràng buộc cho giá
ALTER TABLE Products ADD CONSTRAINT chk_base_price CHECK (BasePrice >= 0);
ALTER TABLE ProductVariants ADD CONSTRAINT chk_price_adjustment CHECK (PriceAdjustment >= 0);

-- Thêm ràng buộc cho số lượng
ALTER TABLE Inventory ADD CONSTRAINT chk_quantity CHECK (QuantityInStock >= 0);
ALTER TABLE OrderDetails ADD CONSTRAINT chk_order_quantity CHECK (Quantity > 0);

-- Thêm trường theo dõi cho các bảng chính
ALTER TABLE Products ADD COLUMN CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE Products ADD COLUMN UpdatedAt DATETIME;
ALTER TABLE Products ADD COLUMN IsActive BOOLEAN DEFAULT TRUE;

ALTER TABLE Orders ADD COLUMN CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE Orders ADD COLUMN UpdatedAt DATETIME;

ALTER TABLE Customers ADD COLUMN UpdatedAt DATETIME;

-- Bảng Quản lý phiếu giảm giá
CREATE TABLE Coupons (
    CouponID INT PRIMARY KEY,
    Code VARCHAR(50) UNIQUE,
    DiscountType VARCHAR(20),
    DiscountValue DECIMAL(10, 2),
    StartDate DATE,
    EndDate DATE,
    IsActive BOOLEAN DEFAULT TRUE,
    UsageLimit INT,
    UsedCount INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME,
    CONSTRAINT chk_discount_value CHECK (DiscountValue >= 0),
    CONSTRAINT chk_usage_limit CHECK (UsageLimit > 0),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Quản lý đổi trả
CREATE TABLE Returns (
    ReturnID INT PRIMARY KEY,
    OrderID INT,
    ProductID INT,
    Quantity INT,
    Reason TEXT,
    Status VARCHAR(50),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    CONSTRAINT chk_return_quantity CHECK (Quantity > 0),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Quản lý phiếu bảo hành
CREATE TABLE WarrantyCards (
    WarrantyCardID INT PRIMARY KEY,
    OrderID INT,
    ProductID INT,
    CustomerID INT,
    IssueDate DATE,
    ExpiryDate DATE,
    Status VARCHAR(50),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Quản lý lịch sử giá
CREATE TABLE PriceHistory (
    PriceHistoryID INT PRIMARY KEY,
    ProductID INT,
    OldPrice DECIMAL(10, 2),
    NewPrice DECIMAL(10, 2),
    ChangedBy INT,
    ChangedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Reason TEXT,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (ChangedBy) REFERENCES Users(UserID),
    CONSTRAINT chk_price_history CHECK (NewPrice >= 0)
);

-- Bảng Quản lý thông báo
CREATE TABLE Notifications (
    NotificationID INT PRIMARY KEY,
    Title VARCHAR(255),
    Content TEXT,
    Type VARCHAR(50),
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ExpiryDate DATETIME,
    IsActive BOOLEAN DEFAULT TRUE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedBy INT,
    UpdatedBy INT,
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(UserID)
);

-- Bảng Quản lý lịch sử đăng nhập
CREATE TABLE LoginHistory (
    LoginID INT PRIMARY KEY,
    UserID INT,
    LoginTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    IPAddress VARCHAR(45),
    DeviceInfo TEXT,
    Status VARCHAR(20),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Thêm index cho các trường thường xuyên tìm kiếm
CREATE INDEX idx_products_brand ON Products(BrandID);
CREATE INDEX idx_orders_status ON Orders(Status);
CREATE INDEX idx_orders_customer ON Orders(CustomerID);
CREATE INDEX idx_inventory_product ON Inventory(ProductID);
CREATE INDEX idx_warranty_status ON Warranty(WarrantyStatus);
CREATE INDEX idx_returns_status ON Returns(Status);
CREATE INDEX idx_coupons_code ON Coupons(Code);
CREATE INDEX idx_notifications_type ON Notifications(Type);
CREATE INDEX idx_login_history_user ON LoginHistory(UserID);

-- Tạo index cho các trường IsDeleted
CREATE INDEX idx_productcategories_isdeleted ON ProductCategories(IsDeleted);
CREATE INDEX idx_brands_isdeleted ON Brands(IsDeleted);
CREATE INDEX idx_products_isdeleted ON Products(IsDeleted);
CREATE INDEX idx_productvariants_isdeleted ON ProductVariants(IsDeleted);
CREATE INDEX idx_stores_isdeleted ON Stores(IsDeleted);
CREATE INDEX idx_employees_isdeleted ON Employees(IsDeleted);
CREATE INDEX idx_orders_isdeleted ON Orders(IsDeleted);
CREATE INDEX idx_customers_isdeleted ON Customers(IsDeleted);
CREATE INDEX idx_promotions_isdeleted ON Promotions(IsDeleted);
CREATE INDEX idx_coupons_isdeleted ON Coupons(IsDeleted);
CREATE INDEX idx_warranty_isdeleted ON Warranty(IsDeleted);
CREATE INDEX idx_returns_isdeleted ON Returns(IsDeleted);
CREATE INDEX idx_warrantycards_isdeleted ON WarrantyCards(IsDeleted);
CREATE INDEX idx_news_isdeleted ON News(IsDeleted);
CREATE INDEX idx_banners_isdeleted ON Banners(IsDeleted);
CREATE INDEX idx_settings_isdeleted ON Settings(IsDeleted);
CREATE INDEX idx_shipments_isdeleted ON Shipments(IsDeleted);
CREATE INDEX idx_productimages_isdeleted ON ProductImages(IsDeleted);
CREATE INDEX idx_productspecifications_isdeleted ON ProductSpecifications(IsDeleted);
CREATE INDEX idx_productreviews_isdeleted ON ProductReviews(IsDeleted);
CREATE INDEX idx_productwishlist_isdeleted ON ProductWishlist(IsDeleted);
CREATE INDEX idx_notifications_isdeleted ON Notifications(IsDeleted);

