from sqlalchemy import Column, String, Integer, Text, TIMESTAMP, func
from app.core.database import Base
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from sqlalchemy import Column


class OrderItemCreate(BaseModel):
    product_id: str
    product_name: str
    image_url: str
    quantity: int
    unit_price: float


class OrderCreate(BaseModel):
    user_id: str
    address_id: int
    currency: str
    total_price: float
    items: List[OrderItemCreate]


class RefundCreate(BaseModel):
    reason: str
    details: Optional[str] = None


class TicketCreate(BaseModel):
    ticket_type: str  # 'REFUND' 或 'CONTACT'
    order_id: str
    user_id: str
    reason: Optional[str] = None
    details: str
    status: Optional[str] = "PENDING"
