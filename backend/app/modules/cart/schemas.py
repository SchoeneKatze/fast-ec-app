import datetime
from pydantic import BaseModel
from typing import Optional


class CartItemSchema(BaseModel):
    id: Optional[int] = None
    user_id: str
    product_id: str
    quantity: int
    updated_at: Optional[datetime.datetime] = None
    title: Optional[str] = None
    symbol: Optional[str] = None
    image_url: Optional[str] = None
    stock_status: Optional[str] = "in_stock"
    updated_at: Optional[datetime.datetime] = None


class CartItemBase(BaseModel):
    user_id: str
    product_id: str


class CartItemUpdate(BaseModel):
    user_id: str
    product_id: str
    quantity: int


class Config:
    from_attributes = True
