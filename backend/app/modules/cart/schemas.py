import datetime
from pydantic import BaseModel
from typing import Optional


class CartItemSchema(BaseModel):
    id: Optional[int] = None
    user_id: str
    product_id: str
    quantity: int
    updated_at: Optional[datetime.datetime] = None


class Config:
    from_attributes = True
