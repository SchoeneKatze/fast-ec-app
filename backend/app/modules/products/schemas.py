from pydantic import BaseModel
from typing import Optional

class ProductCardResponse(BaseModel):
    product_id: str
    title: str
    category_name: str
    symbol: str
    base_price: float
    discount_rate: float
    tax_rate: float
    final_price: float
    final_no_discount_price_for_show: float
    stock_status: str
    image_url: Optional[str]
    is_show_inclusive: bool