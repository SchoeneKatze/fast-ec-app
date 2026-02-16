from unittest.mock import Base
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Text, Enum, DECIMAL, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import func

Base = declarative_base()

class ShippingAddress(Base):
    __tablename__ = "shipping_addresses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    logto_id = Column(String(128), nullable=False, index=True)
    tag = Column(String(50))
    recipient_name = Column(String(100))
    phone = Column(String(20))
    country_code = Column(String(2))
    zip_code = Column(String(20))
    state = Column(String(100), nullable=True) 
    city = Column(String(100), nullable=True)
    address_line = Column(Text)
    is_default = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())