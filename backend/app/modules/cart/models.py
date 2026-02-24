from sqlalchemy import Column, DateTime, String, Integer, Numeric, Boolean, ForeignKey, Text, Enum, Date, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class CartItems(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False) #logto_id
    product_id = Column(String(50), nullable=False)
    quantity = Column(Integer, default=1)
    updated_at = Column(DateTime, nullable=True)