from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: str
    product_name: str
    image_url: str
    quantity: int
    unit_price: float

class OrderCreate(BaseModel):
    user_id: str
    currency: str
    total_price: float
    items: List[OrderItemCreate]

class RefundCreate(BaseModel):
    reason: str
    details: Optional[str] = None