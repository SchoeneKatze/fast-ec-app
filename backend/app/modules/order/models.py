from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String(20), unique=True, index=True) # e.g. 20260226000001
    user_id = Column(String(50), index=True)
    currency = Column(String(10))
    total_price = Column(Numeric(10, 2))
    status = Column(String(20), default="PAID") # PAID, SHIPPED, COMPLETED
    tracking_number = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order")
    refund = relationship("RefundRequest", back_populates="order", uselist=False)
    contacts = relationship("Contact", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(String(50))
    product_name = Column(String(255)) # 商品名称快照
    image_url = Column(String(255))    # 图片快照
    quantity = Column(Integer)
    unit_price = Column(Numeric(10, 2)) # 下单时的单价

    order = relationship("Order", back_populates="items")

class RefundRequest(Base):
    __tablename__ = "refund_requests"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True)
    reason = Column(String(100))
    details = Column(Text, nullable=True)
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="refund")