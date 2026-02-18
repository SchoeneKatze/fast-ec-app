from sqlalchemy import Column, String, Integer, Numeric, Boolean, ForeignKey, Text, Enum, Date, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# 2. 商品分类表
class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True) # 无限极分类
    image_url = Column(String(500), nullable=True)

# 4. 币种汇率表
class Currency(Base):
    __tablename__ = "currencies"
    currency_code = Column(String(3), primary_key=True) # USD, CNY
    currency_symbol = Column(String(5))
    exchange_rate = Column(Numeric(12, 4))
    is_default = Column(Boolean, default=False)

# 5. 税率配置表
class TaxSetting(Base):
    __tablename__ = "tax_settings"
    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String(2), nullable=False) # CN, US, JP
    tax_class = Column(String(50), nullable=False)    # Standard, Reduced, Zero
    tax_rate = Column(Numeric(5, 4), nullable=False)      # 0.1000
    is_show_inclusive = Column(Boolean, default=True) # 是否含税显示

# 3. 商品主表 (核心计价基准)
class Product(Base):
    __tablename__ = "products"
    product_id = Column(String(50), primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    base_price = Column(Numeric(12, 2), nullable=False) 
    currency_code = Column(String(3), nullable=False) # USD, JPY
    discount_factor = Column(Numeric(3, 2), default=1.0)     
    tax_class = Column(String(50), nullable=False)     
    stock_quantity = Column(Integer, default=0)
    brand_id = Column(Integer, nullable=True)
    sku_internal_code = Column(String(50), nullable=True)
    barcode = Column(String(50), nullable=True)
    origin_country = Column(String(50), nullable=True)
    weight = Column(Float, nullable=True)
    dimensions = Column(String(100), nullable=True)
    created_at = Column(Date, nullable=True)
    isActive = Column(Boolean, default=True)

class ProductImage(Base):
    __tablename__ = "product_images"
    
    image_id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(String(50), ForeignKey("products.product_id", ondelete="CASCADE"))
    image_url = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0)