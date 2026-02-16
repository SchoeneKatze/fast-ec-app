from datetime import date
from pydantic import BaseModel

class ShippingAddressUpdate(BaseModel):
    logto_id: str
    id: int | None = None
    tag: str
    recipient_name: str
    phone: str
    country_code: str
    zip_code: str
    state: str | None = None
    city: str | None = None
    address_line: str
    is_default: bool = False
    
class defaultAddressSet(BaseModel):
    logto_id: str
    id: int
    tag: str
    is_default: bool = False